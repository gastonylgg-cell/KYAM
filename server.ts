import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kyam-medical-secret-key-2024';

app.use(express.json());

// --- MOCK DATABASE ---
const db = {
  users: [] as any[],
  patients: [] as any[],
  families: [] as any[],
  doctors: [] as any[],
  appointments: [] as any[],
  medical_records: [] as any[],
  vaccinations: [] as any[],
  payments: [] as any[],
  queue: [] as any[],
  medications: [
    { id: '1', name: 'Paracétamol', dosage: '500mg', type: 'Comprimé' },
    { id: '2', name: 'Amoxicilline', dosage: '1g', type: 'Gélule' },
    { id: '3', name: 'Ibuprofène', dosage: '400mg', type: 'Comprimé' },
    { id: '4', name: 'Sirop contre la toux', dosage: '150ml', type: 'Sirop' },
  ] as any[],
  clinic_settings: {
    openTime: '08:00',
    closeTime: '18:00',
    slotDurationMinutes: 30,
  },
  blocked_slots: [] as any[],
  messages: [] as any[],
  pending_2fa: [] as { email: string, code: string, expires: Date }[],
};

// --- REAL-TIME HELPERS ---
const notifyUser = (userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit('notification', { event, data, timestamp: new Date() });
};

const notifyStaff = (event: string, data: any) => {
  io.to('role:DOCTOR').to('role:ADMIN').to('role:SECRETARY').emit('notification', { event, data, timestamp: new Date() });
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// --- AUTH MIDDLEWARE ---
export const protect = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization?.split(' ')[1];
  if (!authHeader) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET) as any;
    req.user = db.users.find(u => u.id === decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// --- SOCKET CONNECTION ---
io.on('connection', (socket) => {
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = db.users.find(u => u.id === decoded.id);
      if (user) {
        socket.join(`user:${user.id}`);
        socket.join(`role:${user.role}`);
        console.log(`User ${user.fullName} (${user.role}) connected to real-time sync`);
      }
    } catch (e) {
      console.log('Socket authentication failed');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from sync');
  });
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req: any, res) => {
  const { email, password, fullName, role } = req.body;
  
  const authHeader = req.headers.authorization?.split(' ')[1];
  let creator = null;
  if (authHeader) {
    try {
      const decoded = jwt.verify(authHeader, JWT_SECRET) as any;
      creator = db.users.find(u => u.id === decoded.id);
    } catch {}
  }

  // Restriction: Staff accounts can ONLY be created by an ADMIN
  if (role && ['DOCTOR', 'SECRETARY', 'ADMIN'].includes(role)) {
    // Exception: If no users exist, the first user can be ADMIN
    const isFirstUser = db.users.length === 0;
    
    if (!isFirstUser && (!creator || creator.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Only an admin can create staff or admin accounts' });
    }
    
    // Restriction: Max 5 admins
    if (role === 'ADMIN') {
      const adminCount = db.users.filter(u => u.role === 'ADMIN').length;
      if (adminCount >= 5) {
        return res.status(400).json({ message: 'Maximum limit of 5 admin accounts reached' });
      }
    }
  }

  // Restriction: Patients can be created by themselves (no creator) or by DOCTOR/SECRETARY/ADMIN
  if (role === 'PATIENT' || !role) {
    // If there is a creator, they must be staff
    if (creator && !['ADMIN', 'DOCTOR', 'SECRETARY'].includes(creator.role)) {
       return res.status(403).json({ message: 'Insufficient permissions to create patient account' });
    }
  }

  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    fullName,
    role: role || 'PATIENT',
    mustChangePassword: !!creator, // If created by admin/another user, MUST change
    createdAt: new Date(),
  };

  db.users.push(newUser);

  if (newUser.role === 'PATIENT') {
    const { familyId } = req.body;
    db.patients.push({
      id: uuidv4(),
      userId: newUser.id,
      riskScore: 0,
      missedAppointmentsCount: 0,
      familyId: familyId || null,
      createdAt: new Date(),
    });
  } else if (newUser.role === 'DOCTOR') {
    const { specialty, registrationNumber, firstName, lastName } = req.body;
    db.doctors.push({
      id: uuidv4(),
      userId: newUser.id,
      firstName: firstName || fullName.split(' ')[0],
      lastName: lastName || fullName.split(' ')[1] || '',
      specialty: specialty || 'Généraliste',
      registrationNumber: registrationNumber || `RPPS-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      currentActivity: 'CONSULTATION', // Default
      createdAt: new Date(),
    });
  }

  const registrationToken = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ token: registrationToken, user: { id: newUser.id, email, fullName, role: newUser.role } });
});

app.get('/api/doctor/profile', protect, restrictTo('DOCTOR'), (req: any, res) => {
  const doctor = db.doctors.find(d => d.userId === req.user.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  res.json(doctor);
});

app.post('/api/doctor/activity', protect, restrictTo('DOCTOR'), (req: any, res) => {
  const { activity } = req.body; // 'CONSULTATION' or 'VACCINATION'
  const doctorIndex = db.doctors.findIndex(d => d.userId === req.user.id);
  if (doctorIndex === -1) return res.status(404).json({ message: 'Doctor profile not found' });
  
  db.doctors[doctorIndex].currentActivity = activity;
  res.json(db.doctors[doctorIndex]);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // 2FA for Staff (DOCTOR, SECRETARY, ADMIN)
  if (['DOCTOR', 'SECRETARY', 'ADMIN'].includes(user.role)) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60000); // 5 minutes
    
    // Cleanup old codes
    db.pending_2fa = db.pending_2fa.filter(p => p.email !== email);
    db.pending_2fa.push({ email, code, expires });

    console.log(`[AUTH] 2FA CODE SENT TO ${email}: ${code}`);
    return res.json({ requires2FA: true, email });
  }

  const loginToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ 
    token: loginToken, 
    user: { 
      id: user.id, 
      email: user.email, 
      fullName: user.fullName, 
      role: user.role,
      mustChangePassword: !!user.mustChangePassword
    } 
  });
});

app.post('/api/auth/verify-2fa', async (req, res) => {
  const { email, code } = req.body;
  const pending = db.pending_2fa.find(p => p.email === email && p.code === code && p.expires > new Date());
  
  if (!pending) {
    return res.status(401).json({ message: 'Invalid or expired 2FA code' });
  }

  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'User not found' });

  db.pending_2fa = db.pending_2fa.filter((p: any) => p.email !== email);

  const verificationToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ 
    token: verificationToken, 
    user: { 
      id: user.id, 
      email: user.email, 
      fullName: user.fullName, 
      role: user.role,
      mustChangePassword: !!user.mustChangePassword
    } 
  });
});

app.post('/api/auth/change-password', protect, async (req: any, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  
  if (userIndex === -1) return res.status(404).json({ message: 'Utilisateur non trouvé' });

  db.users[userIndex].password = hashedPassword;
  db.users[userIndex].mustChangePassword = false;

  res.json({ message: 'Mot de passe mis à jour avec succès' });
});

// --- APPOINTMENT SYSTEM ---
app.get('/api/agenda/settings', protect, (req, res) => {
  res.json(db.clinic_settings);
});

app.post('/api/agenda/settings', protect, restrictTo('ADMIN', 'DOCTOR'), (req, res) => {
  db.clinic_settings = { ...db.clinic_settings, ...req.body };
  res.json(db.clinic_settings);
});

app.get('/api/agenda/blocked', protect, (req, res) => {
  res.json(db.blocked_slots);
});

app.post('/api/agenda/blocked', protect, restrictTo('ADMIN', 'DOCTOR'), (req, res) => {
  const { start, end, reason } = req.body;
  const blocked = { id: uuidv4(), start, end, reason, createdAt: new Date() };
  db.blocked_slots.push(blocked);
  res.status(201).json(blocked);
});

app.delete('/api/agenda/blocked/:id', protect, restrictTo('ADMIN', 'DOCTOR'), (req, res) => {
  db.blocked_slots = db.blocked_slots.filter(b => b.id !== req.params.id);
  res.status(204).send();
});

app.post('/api/appointments', protect, restrictTo('PATIENT', 'ADMIN', 'SECRETARY'), async (req: any, res) => {
  const { doctorId, startTime, reason, type } = req.body;
  const patient = db.patients.find(p => p.userId === req.user.id);
  if (!patient) return res.status(400).json({ message: 'Patient profile not found' });

  // Check for missed appointments blocking (3 times = blocked)
  if (req.user.role === 'PATIENT' && (patient.missedAppointmentsCount || 0) >= 3) {
    return res.status(403).json({ 
      blocked: true,
      message: 'Vous avez manqué 3 rendez-vous. Pour des raisons de sécurité, vous ne pouvez plus prendre de rendez-vous en ligne. Veuillez appeler le secrétariat pour vos prochaines réservations.' 
    });
  }

  const start = new Date(startTime);
  const end = new Date(start.getTime() + db.clinic_settings.slotDurationMinutes * 60000);

  // Check if slot falls within opening hours
  const timeStr = start.toTimeString().substring(0, 5);
  if (timeStr < db.clinic_settings.openTime || timeStr >= db.clinic_settings.closeTime) {
    return res.status(400).json({ message: 'Clinic is closed at this time' });
  }

  // Check if slot is blocked
  const isBlocked = db.blocked_slots.find(b => 
    (start >= new Date(b.start) && start < new Date(b.end))
  );
  if (isBlocked) return res.status(409).json({ message: 'This slot is blocked for: ' + isBlocked.reason });

  const conflict = db.appointments.find(a => 
    a.doctorId === doctorId && 
    a.status !== 'CANCELLED' &&
    ((start >= new Date(a.startTime) && start < new Date(a.endTime)) ||
     (end > new Date(a.startTime) && end <= new Date(a.endTime)))
  );

  if (conflict) {
    return res.status(409).json({ message: 'Time slot already booked' });
  }

  const appointment = {
    id: uuidv4(),
    patientId: patient.id,
    doctorId,
    startTime: start,
    endTime: end,
    reason,
    type: type || 'CONSULTATION', // VACCINATION or CONSULTATION
    status: 'SCHEDULED',
    createdAt: new Date(),
  };

  db.appointments.push(appointment);

  const queueEntry = {
    id: uuidv4(),
    appointmentId: appointment.id,
    position: db.queue.filter(q => q.status === 'WAITING').length + 1,
    status: 'WAITING',
    checkInTime: null
  };
  db.queue.push(queueEntry);

  // Notify Patient and Staff (Simulation of Email/SMS)
  console.log(`[REMINDER ENGINE] Scheduled reminder to ${req.user.email} (or Phone: ${req.user.phone}) for ${start.toLocaleString()}`);
  
  notifyUser(req.user.id, 'APPOINTMENT_CONFIRMED', { appointmentId: appointment.id, time: start });
  notifyStaff('NEW_APPOINTMENT_QUEUED', { patientName: req.user.fullName, reason });

  res.status(201).json(appointment);
});

app.get('/api/appointments/me', protect, (req: any, res) => {
  if (req.user.role === 'DOCTOR') {
    const doctor = db.doctors.find(d => d.userId === req.user.id);
    if (doctor) {
      // Filter by doctor's current activity (only show matching type)
      return res.json(db.appointments.filter(a => a.type === doctor.currentActivity));
    }
  }
  
  if (req.user.role === 'ADMIN' || req.user.role === 'SECRETARY') {
    return res.json(db.appointments);
  }
  
  const patient = db.patients.find(p => p.userId === req.user.id);
  if (!patient) return res.json([]);
  const appointments = db.appointments.filter(a => a.patientId === patient.id);
  res.json(appointments);
});

app.put('/api/appointments/:id', protect, (req: any, res) => {
  const { id } = req.params;
  const { startTime, reason } = req.body;
  const appointment = db.appointments.find(a => a.id === id);
  if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

  if (req.user.role === 'PATIENT') {
    const patient = db.patients.find(p => p.userId === req.user.id);
    if (appointment.patientId !== patient?.id) return res.status(403).json({ message: 'Interdit' });

    const appDate = new Date(appointment.startTime);
    const dayStart = new Date(appDate);
    dayStart.setHours(0, 0, 0, 0);
    const limitDate = new Date(dayStart.getTime() - 12 * 60 * 60 * 1000);
    if (new Date() > limitDate) {
      return res.status(400).json({ message: 'Veuillez contacter directement le secrétariat du centre médical pour toute modification moins de 12h avant le rendez-vous.' });
    }
  }

  appointment.startTime = new Date(startTime);
  appointment.endTime = new Date(new Date(startTime).getTime() + db.clinic_settings.slotDurationMinutes * 60000);
  appointment.reason = reason;
  res.json(appointment);
});

app.delete('/api/appointments/:id', protect, (req: any, res) => {
  const { id } = req.params;
  const appointment = db.appointments.find(a => a.id === id);
  if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

  if (req.user.role === 'PATIENT') {
    const patient = db.patients.find(p => p.userId === req.user.id);
    if (appointment.patientId !== patient?.id) return res.status(403).json({ message: 'Interdit' });

    const appDate = new Date(appointment.startTime);
    const dayStart = new Date(appDate);
    dayStart.setHours(0, 0, 0, 0);
    const limitDate = new Date(dayStart.getTime() - 12 * 60 * 60 * 1000);
    if (new Date() > limitDate) {
      return res.status(400).json({ message: 'Veuillez contacter directement le secrétariat du centre médical pour toute annulation moins de 12h avant le rendez-vous.' });
    }
  }

  appointment.status = 'CANCELLED';
  res.status(204).send();
});

app.post('/api/appointments/:id/no-show', protect, restrictTo('DOCTOR', 'ADMIN', 'SECRETARY'), (req: any, res) => {
  const { id } = req.params;
  const appointment = db.appointments.find(a => a.id === id);
  if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

  if (appointment.status === 'MISSED') return res.status(400).json({ message: 'Déjà marqué comme non honoré' });

  appointment.status = 'MISSED';
  
  const patient = db.patients.find(p => p.id === appointment.patientId);
  if (patient) {
    patient.missedAppointmentsCount = (patient.missedAppointmentsCount || 0) + 1;
    console.log(`[POLICE CLINIQUE] Patient ${patient.id} manqué: ${patient.missedAppointmentsCount}/3`);
  }

  res.json({ message: 'Rendez-vous marqué comme non honoré', missedCount: patient?.missedAppointmentsCount });
});

// --- MEDICAL RECORDS (RBAC) ---
app.get('/api/records', protect, restrictTo('DOCTOR', 'ADMIN', 'SECRETARY'), (req: any, res) => {
  if (req.user.role === 'SECRETARY') {
    // Mask sensitive fields for Secretary
    const masked = db.medical_records.map(r => ({
      ...r,
      diagnosis: '[CONFIDENTIEL]',
      treatment: '[CONFIDENTIEL]'
    }));
    return res.json(masked);
  }
  res.json(db.medical_records);
});

app.get('/api/records/me', protect, (req: any, res) => {
  const patient = db.patients.find(p => p.userId === req.user.id);
  if (!patient) return res.json([]);
  
  // Find family members if any
  const familyIds = patient.familyId ? 
    db.patients.filter(p => p.familyId === patient.familyId).map(p => p.id) : 
    [patient.id];
    
  const records = db.medical_records.filter(r => familyIds.includes(r.patientId));
  res.json(records);
});

app.post('/api/records', protect, restrictTo('DOCTOR'), (req: any, res) => {
  const { patientId, diagnosis, treatment, prescription } = req.body;
  const record = {
    id: uuidv4(),
    patientId,
    doctorId: req.user.id,
    diagnosis,
    treatment,
    prescription,
    createdAt: new Date()
  };
  db.medical_records.push(record);
  
  const patient = db.patients.find(p => p.id === patientId);
  if (patient) notifyUser(patient.userId, 'NEW_MEDICAL_RECORD', { doctorName: req.user.fullName });
  
  res.status(201).json(record);
});

// --- FAMILY MANAGEMENT ---
app.post('/api/family/create', protect, (req: any, res) => {
  const { name } = req.body;
  const family = { id: uuidv4(), name: name || 'Famille', createdAt: new Date() };
  db.families.push(family);
  
  // Link current user if patient
  const patientIndex = db.patients.findIndex(p => p.userId === req.user.id);
  if (patientIndex !== -1) {
    db.patients[patientIndex].familyId = family.id;
  }
  
  res.status(201).json(family);
});

app.post('/api/family/join', protect, (req: any, res) => {
  const { familyId } = req.body;
  const family = db.families.find(f => f.id === familyId);
  if (!family) return res.status(404).json({ message: 'Famille non trouvée' });
  
  const patientIndex = db.patients.findIndex(p => p.userId === req.user.id);
  if (patientIndex !== -1) {
    db.patients[patientIndex].familyId = family.id;
  }
  
  res.json({ message: 'Rejoint avec succès' });
});

app.get('/api/family/me', protect, (req: any, res) => {
  const patient = db.patients.find(p => p.userId === req.user.id);
  if (!patient || !patient.familyId) return res.json(null);
  
  const family = db.families.find(f => f.id === patient.familyId);
  const members = db.patients
    .filter(p => p.familyId === patient.familyId)
    .map(p => {
      const user = db.users.find(u => u.id === p.userId);
      return { ...p, fullName: user?.fullName, email: user?.email };
    });
    
  res.json({ ...family, members });
});

app.get('/api/families', protect, restrictTo('ADMIN', 'SECRETARY', 'DOCTOR'), (req, res) => {
  res.json(db.families.map(f => ({
    ...f,
    members: db.patients.filter(p => p.familyId === f.id).length
  })));
});

// --- STATS & ANALYTICS ---
app.get('/api/analytics/activity', protect, restrictTo('ADMIN', 'DOCTOR', 'SECRETARY'), (req, res) => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const count = db.appointments.filter(a => isSameDay(new Date(a.startTime), d) && a.status !== 'CANCELLED').length;
    data.push({
      date: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      count
    });
  }
  res.json(data);
});

app.get('/api/stats', protect, restrictTo('ADMIN', 'DOCTOR', 'SECRETARY'), (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    revenue: db.payments.filter(p => new Date(p.createdAt) >= today)
      .reduce((acc, p) => acc + parseInt(p.amount.replace(/,/g, '')), 0),
    attendance: db.patients.length,
    avgWait: db.queue.length > 0 ? "12m" : "0m", // Mock dynamic logic for now
    momoRevenue: db.payments.filter(p => p.provider.includes('MOMO') || p.provider.includes('ORANGE'))
      .reduce((acc, p) => acc + parseInt(p.amount.replace(/,/g, '')), 0),
    appointmentsToday: db.appointments.filter(a => isSameDay(new Date(a.startTime), today) && a.status !== 'CANCELLED').length,
    treatedToday: 0 // Mock for now
  };
  res.json(stats);
});

// --- QUEUE MANAGEMENT ---
app.get('/api/queue', protect, restrictTo('ADMIN', 'SECRETARY', 'DOCTOR'), (req, res) => {
  const queue = db.queue.map(q => {
    const patient = db.patients.find(p => p.id === q.patientId);
    const user = patient ? db.users.find(u => u.id === patient.userId) : null;
    return { ...q, patientName: user?.fullName };
  });
  res.json(queue);
});

app.post('/api/queue/checkin', protect, restrictTo('ADMIN', 'SECRETARY'), (req: any, res) => {
  const { appointmentId } = req.body;
  const appointment = db.appointments.find(a => a.id === appointmentId);
  if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé' });
  
  const inQueue = db.queue.find(q => q.appointmentId === appointmentId);
  if (inQueue) return res.json(inQueue);

  const queueEntry = {
    id: uuidv4(),
    appointmentId,
    patientId: appointment.patientId,
    type: appointment.type,
    checkedInAt: new Date(),
    status: 'WAITING'
  };
  
  db.queue.push(queueEntry);
  notifyStaff('PATIENT_CHECKED_IN', { appointmentId });
  res.status(201).json(queueEntry);
});

app.post('/api/queue/complete', protect, restrictTo('DOCTOR', 'ADMIN'), (req: any, res) => {
  const { queueId } = req.body;
  const index = db.queue.findIndex(q => q.id === queueId);
  if (index === -1) return res.status(404).json({ message: 'Entrée non trouvée' });
  
  const completed = db.queue.splice(index, 1)[0];
  notifyStaff('PATIENT_TREATED', { queueId });
  res.json({ message: 'Traité avec succès', completed });
});

// --- INTERNAL MESSAGING (CHAT) ---
const cleanupMessages = () => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  db.messages = db.messages.filter(m => new Date(m.timestamp) > cutoff);
};

app.get('/api/messages', protect, restrictTo('ADMIN', 'SECRETARY', 'DOCTOR'), (req, res) => {
  cleanupMessages();
  res.json(db.messages);
});

app.post('/api/messages', protect, restrictTo('ADMIN', 'SECRETARY', 'DOCTOR'), (req: any, res) => {
  const { content, attachment, attachmentName, attachmentType } = req.body;
  const message = {
    id: uuidv4(),
    senderId: req.user.id,
    senderName: req.user.fullName,
    senderRole: req.user.role,
    content,
    attachment, // Base64
    attachmentName,
    attachmentType,
    timestamp: new Date()
  };
  
  db.messages.push(message);
  
  // Real-time broadcast
  io.emit('new_chat_message', message);
  
  res.status(201).json(message);
});

// --- VACCINATION INTELLIGENCE ---
const VACCINE_SCHEDULE = [
  // Child
  { name: 'BCG', category: 'CHILD', ageInMonths: 0 },
  { name: 'Polio', category: 'CHILD', ageInMonths: 0 },
  { name: 'Pentavalent', category: 'CHILD', ageInMonths: 2 },
  { name: 'Pneumocoque', category: 'CHILD', ageInMonths: 2 },
  { name: 'Rotavirus', category: 'CHILD', ageInMonths: 2 },
  { name: 'Rougeole', category: 'CHILD', ageInMonths: 9 },
  { name: 'Fièvre jaune', category: 'CHILD', ageInMonths: 9 },
  // Adult
  { name: 'Hépatite B', category: 'ADULT', ageInMonths: 216 },
  { name: 'Typhoïde', category: 'ADULT', ageInMonths: 216 },
  { name: 'Tétanos', category: 'ADULT', ageInMonths: 216 },
  { name: 'HPV', category: 'ADULT', ageInMonths: 132 },
  { name: 'Grippe', category: 'ADULT', ageInMonths: 216 },
  { name: 'Rage', category: 'ADULT', ageInMonths: 216 },
  { name: 'Pneumocoque', category: 'ADULT', ageInMonths: 216 },
  // Traveler
  { name: 'Fièvre jaune', category: 'TRAVELER', ageInMonths: 0 },
  { name: 'Choléra', category: 'TRAVELER', ageInMonths: 0 },
];

app.get('/api/vaccinations/schedule/:patientId', protect, (req: any, res) => {
  const patientId = req.params.patientId;
  const patient = db.patients.find(p => p.id === patientId);
  
  // RBAC check: only user themselves or staff
  if (req.user.role === 'PATIENT' && patient?.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!patient || !patient.dateOfBirth) {
    return res.json(VACCINE_SCHEDULE.map(v => ({ ...v, status: 'UNKNOWN' })));
  }

  const dob = new Date(patient.dateOfBirth);
  const schedule = VACCINE_SCHEDULE.map(v => {
    const dueDate = new Date(dob);
    dueDate.setMonth(dueDate.getMonth() + v.ageInMonths);
    const record = db.vaccinations.find(vr => vr.patientId === patient.id && vr.vaccineName === v.name);
    return {
      name: v.name,
      dueDate,
      status: record ? 'ADMINISTERED' : (new Date() > dueDate ? 'MISSED' : 'DUE'),
      administeredAt: record?.administeredAt || null
    };
  });

  res.json(schedule);
});

// --- PAYMENT SYSTEM ---
app.post('/api/payments/initiate', protect, (req: any, res) => {
  const { appointmentId, amount, provider, phone } = req.body;
  const transactionId = `TX-${uuidv4().substring(0, 8).toUpperCase()}`;
  const payment = {
    id: uuidv4(),
    appointmentId,
    amount,
    provider,
    status: 'SUCCESSFUL',
    transactionId,
    createdAt: new Date(),
  };

  db.payments.push(payment);
  
  notifyUser(req.user.id, 'PAYMENT_RECEIVED', { amount, transactionId });
  notifyStaff('REVENUE_ALERT', { amount, provider });

  res.json(payment);
});

app.get('/api/records/patient/:email', protect, restrictTo('DOCTOR', 'ADMIN', 'SECRETARY'), (req, res) => {
  const { email } = req.params;
  const history = db.medical_records.filter(r => r.patientEmail === email);
  res.json(history);
});

// --- USER MANAGEMENT (ADMIN ONLY) ---
app.get('/api/users', protect, restrictTo('ADMIN'), (req, res) => {
  res.json(db.users.map(u => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role })));
});

// --- MEDICATION DATABASE ---
app.get('/api/medications', protect, (req, res) => {
  res.json(db.medications);
});

app.post('/api/medications', protect, restrictTo('ADMIN', 'DOCTOR'), (req, res) => {
  const { name, dosage, type } = req.body;
  const medication = { id: uuidv4(), name, dosage, type };
  db.medications.push(medication);
  res.status(201).json(medication);
});

app.delete('/api/medications/:id', protect, restrictTo('ADMIN', 'DOCTOR'), (req, res) => {
  db.medications = db.medications.filter(m => m.id !== req.params.id);
  res.status(204).send();
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', async () => {
    // Seed initial admin if no users exist
    if (db.users.length === 0) {
      const hashedAdminPassword = await bcrypt.hash('123Liber+y', 10);
      db.users.push({
        id: uuidv4(),
        email: 'admin',
        password: hashedAdminPassword,
        fullName: 'Administrateur Principal',
        role: 'ADMIN',
        recoveryEmail: 'gastonylgg@gmail.com',
        mustChangePassword: false,
        createdAt: new Date()
      });
      console.log('[SEED] Master Admin created: admin / 123Liber+y');
    }
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

