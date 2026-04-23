import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Plus, 
  Users, 
  Calendar, 
  X, 
  Clock, 
  Activity,
  CreditCard,
  Signal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { format } from 'date-fns';
import Logo from '../Logo';
import { useAuth } from '../../App'; // Import from App if defined there, or create a hook file
import QueueView from './QueueView';

// Assuming these are needed for Dashboard. Ideally extracted too, but kept here for now if they are dashboard-specific
const PractitionerCard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'DOCTOR') {
      fetch('/api/doctor/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.error) setProfile(data);
      })
      .catch(() => setProfile(null));
    }
  }, [user]);

  if (user?.role !== 'DOCTOR' || !profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group mb-10 border border-slate-800"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-600/20 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row gap-10 lg:items-center">
        <div className="relative shrink-0">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-1 shadow-2xl">
            <div className="w-full h-full bg-slate-900 rounded-[1.8rem] overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
              {t('practitioner_card')}
            </span>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic leading-none mb-6">
            {user.fullName}
          </h1>
          
          <div className="flex flex-wrap gap-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('specialty')}</p>
              <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                {profile.specialty}
              </p>
            </div>
            <div className="w-px h-10 bg-slate-800 hidden md:block"></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('practitioner_number')}</p>
              <p className="text-sm font-bold text-slate-100 font-mono tracking-wider">{profile.registrationNumber}</p>
            </div>
          </div>
        </div>

        <div className="lg:ml-auto">
           <div className={`p-6 rounded-3xl border backdrop-blur-xl ${profile.currentActivity === 'VACCINATION' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'} flex flex-col items-center justify-center gap-2`}>
              <Activity className="w-6 h-6 mb-1" />
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Activité Actuelle</p>
                <p className="text-xs font-black uppercase tracking-tight">{profile.currentActivity === 'VACCINATION' ? t('type_vaccination') : t('type_consultation')}</p>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const { t } = useTranslation();

  const fetchAppts = () => {
    fetch('/api/appointments/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setAppointments(Array.isArray(data) ? data : []))
    .catch(() => setAppointments([]));
  };

  useEffect(() => {
    fetchAppts();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return;
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    });
    if (res.ok) fetchAppts();
    else {
      const data = await res.json();
      alert(data.message);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-display font-black uppercase tracking-tighter italic text-slate-800">Mes Rendez-vous</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Planification Électronique</p>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
           <Calendar className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.filter(a => a.status !== 'CANCELLED').map(appt => {
          const appDate = new Date(appt.startTime);
          const now = new Date();
          const dayStart = new Date(appDate);
          dayStart.setHours(0,0,0,0);
          const limitTime = dayStart.getTime() - (12 * 60 * 60 * 1000);
          const canAction = now.getTime() < limitTime;

          return (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={appt.id} 
              className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-100 shrink-0">
                   <span className="text-[8px] font-black uppercase text-blue-600">{format(appDate, 'MMM')}</span>
                   <span className="text-lg font-black text-slate-800 leading-none">{format(appDate, 'dd')}</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {appt.type === 'VACCINATION' ? 'Vaccination' : 'Consultation'}
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{appt.reason}</p>
                  <p className="text-[11px] font-mono font-black text-blue-600 mt-1">{format(appDate, 'HH:mm')}</p>
                </div>
              </div>
              <div className="ml-4">
                {canAction ? (
                  <button onClick={() => handleCancel(appt.id)} className="p-3 bg-white text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-slate-100">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => alert("Veuillez contacter le centre médical pour toute modification.")}
                    className="p-3 bg-slate-200 text-slate-400 rounded-2xl cursor-help hover:bg-slate-300 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
        {appointments.filter(a => a.status !== 'CANCELLED').length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em]">{t('no_events')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [liveStats, setLiveStats] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('kyam_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    fetch('/api/stats', { headers })
      .then(res => res.ok ? res.json() : null)
      .then(setLiveStats)
      .catch(() => setLiveStats(null));

    fetch('/api/analytics/activity', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(setActivityData)
      .catch(() => setActivityData([]));
  }, []);

  const stats = [
    { label: t('today_revenue'), value: liveStats?.revenue !== undefined ? liveStats.revenue.toLocaleString() : '...', detail: 'GNF', icon: CreditCard, color: 'emerald' },
    { label: t('stats_attendance'), value: liveStats?.attendance !== undefined ? liveStats.attendance : '...', detail: 'PATIENTS', icon: Users, color: 'blue' },
    { label: t('avg_wait'), value: liveStats?.avgWait !== undefined ? liveStats.avgWait : '...', detail: 'MINUTES', icon: Clock, color: 'indigo' },
    { label: t('stats_momo'), value: liveStats?.momoRevenue !== undefined ? (liveStats.momoRevenue / 1000).toFixed(0) + 'k' : '...', detail: 'GNF', icon: Signal, color: 'orange' },
  ];

  return (
    <div className="p-8 md:p-12 pb-32 max-w-7xl mx-auto">
      <PractitionerCard />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-[40px] rounded-full -mr-10 -mt-10 group-hover:bg-${stat.color}-500/10 transition-all`}></div>
            <div className="flex justify-between items-start mb-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
               <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tighter italic">
                {stat.value}
              </h3>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.detail}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {['ADMIN', 'DOCTOR', 'SECRETARY'].includes(user?.role || '') && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tighter italic">Performance Clinique</h3>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Analyse des flux en temps réel</p>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">LIVE SYNC</span>
                  </div>
               </div>
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8', fontFamily: 'Outfit' }} 
                        dy={15}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '24px', 
                          border: '1px solid #f1f5f9', 
                          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', 
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '12px 20px',
                          fontFamily: 'Outfit'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          )}

          {['ADMIN', 'DOCTOR', 'SECRETARY'].includes(user?.role || '') ? (
             <QueueView />
          ) : (
            <div className="flex flex-col gap-8">
              <div className="bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                 <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                       <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter mb-4">
                      Votre Espace Santé
                    </h3>
                    <p className="text-sm text-slate-400 font-medium max-w-sm leading-relaxed mb-10">
                      Accédez à vos services médicaux personnalisés : carnet de santé digital, suivi vaccinal et messagerie sécurisée.
                    </p>
                    <div className="flex gap-4">
                       <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">Détails du dossier</button>
                    </div>
                 </div>
              </div>
              <MyAppointments />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Analyse Bio-IA</h2>
              <div className="w-8 h-8 bg-orange-500/10 rounded-xl flex items-center justify-center">
                 <Activity className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center gap-6 mb-10">
              <div className="relative shrink-0">
                <svg className="w-24 h-24">
                  <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                  <circle 
                    cx="48" cy="48" r="40" stroke="#f97316" strokeWidth="8" fill="none" 
                    strokeDasharray="251.2" strokeDashoffset="40" strokeLinecap="round"
                    className="animate-[dash_2s_ease-out]"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-display font-black text-slate-900 italic">84</div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">Index Préventif</p>
                <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase">Saisonnalité active : Risque Paludisme modéré.</p>
              </div>
            </div>
            <button className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
               Actualiser l'analyse
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="font-display font-black text-slate-900 text-sm uppercase tracking-tighter italic">Paiements Récents</h2>
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-50"></div>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-20"></div>
              </div>
            </div>
            <div className="p-8 space-y-6 flex-1">
              {[
                { provider: 'Orange Money', tx: 'TX_9942A', amount: '45k', color: 'orange' },
                { provider: 'MTN Mobile', tx: 'TX_3310X', amount: '120k', color: 'yellow' }
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${tx.color}-500/10 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                       <CreditCard className={`w-5 h-5 text-${tx.color}-600`} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{tx.provider}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{tx.tx}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 font-mono">{tx.amount}</p>
                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Validé</p>
                  </div>
                </div>
              ))}
            </div>
             <div className="p-8 mt-auto bg-slate-50 border-t border-slate-100">
               <button className="w-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">Voir l'historique complet</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
