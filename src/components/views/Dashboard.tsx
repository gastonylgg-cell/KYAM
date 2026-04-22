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
  Activity 
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
      .then(data => setProfile(data?.error ? null : data))
      .catch(() => setProfile(null));
    }
  }, [user]);

  if (user?.role !== 'DOCTOR' || !profile) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden group mb-8">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
         <Logo className="w-32 h-32 text-white" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center">
        <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 flex items-center justify-center shrink-0">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" className="w-16 h-16" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-1">{t('practitioner_card')}</h4>
          <p className="text-xl font-black tracking-tight uppercase">{user.fullName}</p>
          <div className="grid grid-cols-2 gap-4 md:flex md:gap-8 mt-4">
            <div>
              <p className="text-[8px] font-black uppercase opacity-50 text-blue-100 mb-0.5">{t('specialty')}</p>
              <p className="text-[10px] font-bold text-white">{profile.specialty}</p>
            </div>
            <div className="md:border-l md:border-white/10 md:pl-8">
              <p className="text-[8px] font-black uppercase opacity-50 text-blue-100 mb-0.5">{t('practitioner_number')}</p>
              <p className="text-[10px] font-bold text-white font-mono">{profile.registrationNumber}</p>
            </div>
          </div>
        </div>
        <div className="md:ml-auto relative z-10">
           <div className={`px-4 py-3 rounded-xl border ${profile.currentActivity === 'VACCINATION' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'} text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit`}>
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${profile.currentActivity === 'VACCINATION' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              {profile.currentActivity === 'VACCINATION' ? t('type_vaccination') : t('type_consultation')}
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
    .then(res => res.json())
    .then(data => setAppointments(Array.isArray(data) ? data : []));
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
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 overflow-hidden mt-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-600" />
        {t('my_appointments')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.filter(a => a.status !== 'CANCELLED').map(appt => {
          const appDate = new Date(appt.startTime);
          const now = new Date();
          const dayStart = new Date(appDate);
          dayStart.setHours(0,0,0,0);
          const limitTime = dayStart.getTime() - (12 * 60 * 60 * 1000);
          const canAction = now.getTime() < limitTime;

          return (
            <div key={appt.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{appt.type === 'VACCINATION' ? 'Vaccination' : 'Consultation'}</p>
                <p className="text-[11px] text-slate-500 font-bold truncate max-w-[150px]">{appt.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px] font-mono font-bold tracking-tighter">
                    {format(appDate, 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canAction ? (
                  <button onClick={() => handleCancel(appt.id)} className="p-2.5 bg-white text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => alert("Veuillez contacter directement le secrétariat du centre médical pour toute annulation ou modification moins de 12h avant le rendez-vous.")}
                    className="p-2 bg-slate-200 text-slate-400 rounded-xl hover:bg-slate-300 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {appointments.filter(a => a.status !== 'CANCELLED').length === 0 && (
          <div className="col-span-full py-10 text-center">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{t('no_events')}</p>
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
    { label: t('today_revenue'), value: liveStats?.revenue !== undefined ? liveStats.revenue.toLocaleString() : '...', detail: 'GNF', color: 'blue', sub: `↑ ${liveStats ? 'LIFETIME' : ''}`, mono: true },
    { label: t('stats_attendance'), value: liveStats?.attendance !== undefined ? liveStats.attendance : '...', detail: 'PATIENTS', color: 'blue', sub: t('active_active') },
    { label: t('avg_wait'), value: liveStats?.avgWait !== undefined ? liveStats.avgWait : '...', detail: t('optimized_queue'), color: 'slate' },
    { label: t('stats_momo'), value: liveStats?.momoRevenue !== undefined ? (liveStats.momoRevenue / 1000).toFixed(0) + 'k' : '...', detail: 'GNF', color: 'orange', sub: t('momo_guinee') },
  ];

  return (
    <div className="p-4 md:p-6 pb-24">
      <PractitionerCard />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label} 
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tight">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <h3 className={`text-2xl font-bold text-slate-800 ${stat.mono ? 'font-mono' : ''}`}>{stat.value}</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{stat.detail}</span>
            </div>
            {stat.sub && (
              <div className={`text-[10px] font-bold mt-2 ${stat.color === 'red' ? 'text-red-500 underline' : 'text-emerald-600'}`}>
                {stat.sub}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {['ADMIN', 'DOCTOR', 'SECRETARY'].includes(user?.role || '') && (
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Flux d'Activité Clinique</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temps Réel</span>
                  </div>
               </div>
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
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
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter mb-2">Bienvenue au portail KYAM</h3>
                 <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed mb-6">Votre santé, notre priorité numérique. Gérez vos rendez-vous, accédez à votre carnet vaccinal et communiquez avec vos praticiens en toute sécurité.</p>
              </div>
              <MyAppointments />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t('ai_pulse')}</h2>
              <span className="text-[9px] text-slate-500 font-mono tracking-tighter">{t('ai_engine_v')}</span>
            </div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 border-4 border-orange-500 rounded-full flex items-center justify-center font-black text-xl font-mono text-orange-400 shrink-0">84</div>
              <div>
                <p className="text-xs font-bold mb-1">{t('risk_factor')}</p>
                <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">{t('localized_malaria')}</p>
              </div>
            </div>
            <button className="w-full py-2.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors shadow-inner">
              {t('generate_alerts')}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-700 text-xs uppercase tracking-tight">{t('recent_momo')}</h2>
            </div>
            <div className="p-4 space-y-3 flex-1">
              {[
                { provider: t('mtn_momo'), tx: 'Tx: 9942A82B', amount: '45,000', status: t('verified'), border: 'border-yellow-400' },
                { provider: t('orange_momo'), tx: 'Tx: 3310X04L', amount: '120,000', status: t('verified'), border: 'border-orange-500' }
              ].map((tx, idx) => (
                <div key={idx} className={`flex items-center justify-between border-l-4 ${tx.border} pl-3 py-1`}>
                  <div>
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">{tx.provider}</p>
                    <p className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">{tx.tx}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800 font-mono">{tx.amount}</p>
                    <p className="text-[9px] text-blue-600 font-black tracking-widest uppercase">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
