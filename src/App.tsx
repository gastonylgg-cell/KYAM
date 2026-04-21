import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  Clipboard, 
  Activity, 
  Bell, 
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Syringe,
  Home,
  ChevronRight,
  Plus,
  Search,
  Settings,
  UserPlus,
  Globe,
  Baby,
  Signal,
  Facebook,
  Instagram,
  Youtube,
  Sun,
  Cloud,
  Music2,
  MessageCircle,
  Camera,
  FileText,
  Paperclip,
  Send,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  format, 
  startOfToday, 
  addDays, 
  eachDayOfInterval, 
  isSameDay, 
  parseISO, 
  addMinutes, 
  setHours, 
  setMinutes, 
  isBefore
} from 'date-fns';
import Logo from './components/Logo';

// --- TYPES ---
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'DOCTOR' | 'SECRETARY' | 'PATIENT';
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  notifications: any[];
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- COMPONENTS ---

const Navigation = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  onClose 
}: { 
  activeTab: string; 
  setActiveTab: (t: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: ['ADMIN', 'DOCTOR', 'SECRETARY', 'PATIENT'] },
    { id: 'appointments', label: t('appointments'), icon: Calendar, roles: ['ADMIN', 'DOCTOR', 'SECRETARY', 'PATIENT'] },
    { id: 'vaccinations', label: t('vaccinations'), icon: ShieldCheck, roles: ['ADMIN', 'DOCTOR', 'SECRETARY', 'PATIENT'] },
    {id: 'records', label: t('records'), icon: Clipboard, roles: ['ADMIN', 'DOCTOR', 'SECRETARY']},
    {id: 'my-records', label: t('my_records'), icon: Clipboard, roles: ['PATIENT']},
    {id: 'family', label: t('family_folder'), icon: Users, roles: ['PATIENT']},
    {id: 'payments', label: t('revenue'), icon: CreditCard, roles: ['ADMIN']},
    { id: 'billing', label: t('billing'), icon: CreditCard, roles: ['PATIENT'] },
    { id: 'users', label: t('users'), icon: Users, roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-400 flex flex-col shrink-0 z-[70] transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-56 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex lg:hidden justify-between items-center bg-slate-900/50 border-b border-white/5">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center p-1.5">
               <Logo className="text-white w-full h-full" />
             </div>
             <span className="text-xs font-black text-white uppercase tracking-tighter italic">KYAM PORTAL</span>
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
           </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('main_menu')}</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`flex items-center gap-3 w-full px-4 py-4 transition-all duration-200 text-left cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-900/50' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-[10px] text-slate-400 mb-1 font-bold">{t('offline_ready')}</p>
            <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 tracking-tight">{t('local_storage_opt')}</p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-6 text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition-all border-t border-slate-800 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">{t('logout')}</span>
        </button>
      </aside>
    </>
  );
};

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === 'fr' ? 'en' : 'fr');
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold transition-all h-11"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase tracking-tighter">{currentLang === 'fr' ? 'English' : 'Français'}</span>
    </button>
  );
};

const NotificationCenter = ({ notifications }: { notifications: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all relative"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t('notifications_title')}</h3>
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">{notifications.length > 0 ? t('new_events') : ''} {notifications.length}</span>
              </div>
              <div className="max-h-96 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">{t('no_events')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((n, i) => (
                      <div key={i} className="p-4 hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-right-1">
                        <p className="text-xs font-bold text-slate-800 mb-1">{n.event.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed truncate">{JSON.stringify(n.data)}</p>
                        <p className="text-[9px] text-slate-300 font-mono mt-1 font-bold">{new Date(n.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState({ temp: 29, condition: 'Sunny' });
  const { t } = useTranslation();

  useEffect(() => {
    // Simulated weather fetch for Conakry
    const timer = setTimeout(() => {
      setWeather({ temp: 31, condition: 'Mainly Sunny' });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
      <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-amber-900 shadow-lg shadow-amber-500/20">
        <Sun className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase text-blue-200 leading-none mb-1">Conakry</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-white">{weather.temp}°C</span>
          <span className="text-[9px] font-bold text-white/60 uppercase">{weather.condition}</span>
        </div>
      </div>
    </div>
  );
};

const QueueView = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);

  const fetchQueue = () => {
    fetch('/api/queue', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setQueue(Array.isArray(data) ? data : []))
    .catch(() => setQueue([]));
  };

  useEffect(() => {
    fetchQueue();
    const timer = setInterval(fetchQueue, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleComplete = async (queueId: string) => {
    await fetch('/api/queue/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` },
      body: JSON.stringify({ queueId })
    });
    fetchQueue();
  };

  const handleNoShow = async (appointmentId: string) => {
    if (!confirm("Marquer ce rendez-vous comme non honoré ? (Le patient sera bloqué après 3 absences)")) return;
    const res = await fetch(`/api/appointments/${appointmentId}/no-show`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    });
    if (res.ok) {
      alert("Absence enregistrée.");
      fetchQueue();
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6">
      <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        {t('waiting_list')}
      </h3>
      <div className="space-y-4">
        {queue.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold border border-slate-200 shadow-sm">
                {item.patientName?.[0] || 'P'}
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">{item.patientName}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">{item.type}</span>
                  <span className="text-[8px] text-slate-400 font-mono font-bold uppercase">{new Date(item.checkedInAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {item.status === 'WAITING' && (user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
                <>
                  <button 
                    onClick={() => handleNoShow(item.appointmentId)}
                    className="px-3 py-2 bg-white border border-red-100 text-red-500 text-[9px] font-black uppercase rounded-lg shadow-sm hover:bg-red-50 transition-all"
                  >
                    Absence
                  </button>
                  <button 
                    onClick={() => handleComplete(item.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    {t('mark_treated')}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {queue.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('no_one_waiting')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InternalChat = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch('/api/messages', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setMessages(Array.isArray(data) ? data : []))
    .catch(() => setMessages([]));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  useEffect(() => {
    const socket = io({ auth: { token: localStorage.getItem('kyam_token') } });
    socket.on('new_chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, attachmentData?: any) => {
    e?.preventDefault();
    if (!content && !attachmentData) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` },
      body: JSON.stringify({ 
        content,
        ...attachmentData
      })
    });
    setContent('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      handleSendMessage(undefined, {
        attachment: reader.result,
        attachmentName: file.name,
        attachmentType: file.type
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (!user || !['ADMIN', 'DOCTOR', 'SECRETARY'].includes(user.role)) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
      >
        {isOpen ? <X /> : <MessageCircle className="w-8 h-8" />}
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {t('internal_chat')}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-48px)] bg-white rounded-[40px] shadow-2xl border border-slate-200 z-[100] overflow-hidden flex flex-col h-[600px] max-h-[calc(100vh-140px)]"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tighter italic">{t('internal_chat')}</h3>
                <p className="text-[8px] font-bold uppercase text-slate-400 mt-1">{t('chat_history_notice')}</p>
              </div>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-auto p-6 bg-slate-50 space-y-4 custom-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.senderId === user.id ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase text-slate-400">{m.senderName}</span>
                    <span className="text-[8px] font-black uppercase bg-slate-200 text-slate-500 px-1 rounded">{m.senderRole}</span>
                  </div>
                  <div className={`p-4 rounded-[24px] max-w-[85%] text-xs font-medium shadow-sm ${m.senderId === user.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                    {m.content && <p className="leading-relaxed">{m.content}</p>}
                    {m.attachment && (
                      <div className={`mt-2 p-3 rounded-xl border ${m.senderId === user.id ? 'bg-blue-700 border-blue-500' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                           {m.attachmentType?.includes('image') ? <Camera className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black truncate">{m.attachmentName}</p>
                              <a href={m.attachment} download={m.attachmentName} className="text-[9px] font-bold uppercase underline pointer-events-auto">Télécharger</a>
                           </div>
                        </div>
                      </div>
                    )}
                    <span className={`block text-[8px] font-bold uppercase mt-2 opacity-40`}>{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder="Tapez un message..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none max-h-32"
                    rows={1}
                  />
                  <div className="absolute right-3 bottom-3 flex gap-2">
                    <label className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors">
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                      <Paperclip className={`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`} />
                    </label>
                  </div>
                </div>
                <button type="submit" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const FamilyView = () => {
  const { t } = useTranslation();
  const [family, setFamily] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyId, setFamilyId] = useState('');

  const fetchFamily = () => {
    fetch('/api/family/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => setFamily(data?.error ? null : data))
    .catch(() => setFamily(null));
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/family/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` },
      body: JSON.stringify({ name: familyName })
    });
    setIsCreating(false);
    fetchFamily();
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/family/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` },
      body: JSON.stringify({ familyId })
    });
    setIsJoining(false);
    fetchFamily();
  };

  return (
    <div className="p-6">
      <header className="mb-8">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">{t('family_folder')}</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('patient_info_general')}</p>
      </header>

      {!family ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-3xl border border-dotted border-slate-200 flex flex-col items-center justify-center text-center shadow-lg shadow-slate-100 transition-all">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Plus className="w-8 h-8" />
             </div>
             <h3 className="text-sm font-black text-slate-800 uppercase mb-2">{t('create_family')}</h3>
             <button onClick={() => setIsCreating(true)} className="mt-4 px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-blue-100">{t('create_one')}</button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-3xl border border-dotted border-slate-200 flex flex-col items-center justify-center text-center shadow-lg shadow-slate-100 transition-all">
             <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
             </div>
             <h3 className="text-sm font-black text-slate-800 uppercase mb-2">{t('join_family')}</h3>
             <button onClick={() => setIsJoining(true)} className="mt-4 px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-slate-100">{t('signin_now')}</button>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-2">{family.name}</h3>
              <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">{t('family_members')}</p>
              <div className="mt-6 flex flex-wrap gap-4">
                 {family.members.map((m: any, i: number) => (
                   <div key={i} className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.email}`} alt="" className="w-8 h-8 rounded-full bg-white/20" />
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">{m.fullName}</p>
                        <p className="text-[8px] opacity-60 font-mono mt-0.5">{m.email}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">ID FAMILIAL (PARTAGE)</p>
                <div className="font-mono text-sm font-bold text-slate-700">{family.id}</div>
              </div>
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(family.id);
                   alert('ID Copié !');
                }} 
                className="px-4 py-2 bg-slate-50 text-slate-600 text-[9px] font-black uppercase rounded-lg hover:bg-slate-100 transition-all"
              >
                Copier l'ID
              </button>
           </div>
        </div>
      )}

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-white">
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-6">{t('create_family')}</h3>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nom du dossier familial</label>
                   <input required value={familyName} onChange={e => setFamilyName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold" placeholder="ex: Famille Keita" />
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100">Confirmer la création</button>
              </form>
            </motion.div>
          </div>
        )}
        {isJoining && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsJoining(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-white">
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-6">{t('join_family')}</h3>
              <form onSubmit={handleJoin} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Code ID de la famille</label>
                   <input required value={familyId} onChange={e => setFamilyId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-mono font-bold" placeholder={t('family_id_placeholder')} />
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-100">Rejoindre le dossier</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SocialLinks = ({ vertical = false }: { vertical?: boolean }) => {
  const links = [
    { icon: Facebook, color: 'hover:text-blue-600', url: '#' },
    { icon: Instagram, color: 'hover:text-pink-500', url: '#' },
    { icon: Music2, color: 'hover:text-black', url: '#' }, // TikTok
    { icon: Youtube, color: 'hover:text-red-600', url: '#' },
  ];

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-4`}>
      {links.map((link, i) => {
        const Icon = link.icon;
        return (
          <a key={i} href={link.url} className={`p-3.5 bg-slate-50 rounded-xl text-slate-400 ${link.color} transition-all hover:scale-110 shadow-sm border border-slate-100 flex items-center justify-center min-w-[44px] min-h-[44px]`}>
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
};

const ActivityModeSwitcher = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'DOCTOR') {
      fetch('/api/doctor/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => setDoctorProfile(data?.error ? null : data))
      .catch(() => setDoctorProfile(null));
    }
  }, [user]);

  const switchActivity = async (activity: 'CONSULTATION' | 'VACCINATION') => {
    setLoading(true);
    const res = await fetch('/api/doctor/activity', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kyam_token')}`
      },
      body: JSON.stringify({ activity })
    });
    if (res.ok) {
      const updated = await res.json();
      setDoctorProfile(updated);
      window.location.reload(); // Refresh to trigger filtered fetches
    }
    setLoading(false);
  };

  if (user?.role !== 'DOCTOR' || !doctorProfile) return null;

  return (
    <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
      <button 
        disabled={loading}
        onClick={() => switchActivity('CONSULTATION')}
        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${doctorProfile.currentActivity === 'CONSULTATION' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
      >
        {t('switch_to_consultation')}
      </button>
      <button 
        disabled={loading}
        onClick={() => switchActivity('VACCINATION')}
        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${doctorProfile.currentActivity === 'VACCINATION' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
      >
        {t('switch_to_vaccination')}
      </button>
    </div>
  );
};


const VACCINE_LIST = {
  CHILD: ['BCG', 'Polio', 'Pentavalent', 'Pneumocoque', 'Rotavirus', 'Rougeole', 'Fièvre jaune'],
  ADULT: ['Hépatite B', 'Typhoïde', 'Tétanos', 'HPV', 'Grippe', 'Rage', 'Pneumocoque'],
  TRAVELER: ['Fièvre jaune', 'Choléra']
};

const AppointmentView = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<any[]>([]);
  const [settings, setSettings] = useState({ openTime: '08:00', closeTime: '18:00', slotDurationMinutes: 30 });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const { t } = useTranslation();
  const { user } = useAuth();

  // Form State
  const [type, setType] = useState('CONSULTATION');
  const [reason, setReason] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const handleCheckIn = async (appointmentId: string) => {
    const res = await fetch('/api/queue/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` },
      body: JSON.stringify({ appointmentId })
    });
    if (res.ok) alert(t('connected'));
  };

  // Settings Form State
  const [editingSettings, setEditingSettings] = useState(settings);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` };
      const [resApps, resSettings, resBlocked] = await Promise.all([
        fetch('/api/appointments/me', { headers }),
        fetch('/api/agenda/settings', { headers }),
        fetch('/api/agenda/blocked', { headers })
      ]);
      const [apps, sett, block] = await Promise.all([resApps.json(), resSettings.json(), resBlocked.json()]);
      setAppointments(Array.isArray(apps) ? apps : []);
      setSettings(sett);
      setEditingSettings(sett);
      setBlocked(Array.isArray(block) ? block : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kyam_token')}`
      },
      body: JSON.stringify({
        doctorId: 'demo-doctor-id',
        startTime: selectedSlot.toISOString(),
        reason: reason || type,
        type
      })
    });

    if (res.ok) {
      setSelectedSlot(null);
      setReason('');
      fetchData();
    } else {
      const data = await res.json();
      if (data.blocked) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    }
  };

  const handleBlockSlot = async (slot: Date) => {
    const res = await fetch('/api/agenda/blocked', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kyam_token')}`
      },
      body: JSON.stringify({
        start: slot.toISOString(),
        end: addMinutes(slot, settings.slotDurationMinutes).toISOString(),
        reason: 'Manually Blocked'
      })
    });
    if (res.ok) fetchData();
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/agenda/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kyam_token')}`
      },
      body: JSON.stringify(editingSettings)
    });
    if (res.ok) {
      setSettings(editingSettings);
      setShowSettings(false);
      fetchData();
    }
  };

  const generateSlots = () => {
    const slots = [];
    const [openH, openM] = settings.openTime.split(':').map(Number);
    const [closeH, closeM] = settings.closeTime.split(':').map(Number);
    
    let current = setMinutes(setHours(selectedDate, openH), openM);
    const end = setMinutes(setHours(selectedDate, closeH), closeM);

    while (isBefore(current, end)) {
      slots.push(new Date(current));
      current = addMinutes(current, settings.slotDurationMinutes);
    }
    return slots;
  };

  const getSlotStatus = (slot: Date) => {
    const app = appointments.find(a => isSameDay(new Date(a.startTime), selectedDate) && format(new Date(a.startTime), 'HH:mm') === format(slot, 'HH:mm'));
    const block = blocked.find(b => isSameDay(new Date(b.start), selectedDate) && format(new Date(b.start), 'HH:mm') === format(slot, 'HH:mm'));
    if (block) return { type: 'BLOCKED', data: block };
    if (app) return { type: 'BOOKED', data: app };
    return { type: 'FREE', data: null };
  };

  const nextDays = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 14)
  });

  return (
    <div className="p-6 h-full overflow-auto custom-scrollbar pb-32">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{t('appointments')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('electronic_scheduling')}</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
           <button 
           onClick={() => setShowSettings(!showSettings)}
           className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
         >
           <Settings className="w-4 h-4" />
           {t('opening_hours')}
         </button>
        )}
      </header>

      {showSettings && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 max-w-xl shadow-sm">
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t('opening_hours')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">{t('open_time')}</label>
                <input type="time" value={editingSettings.openTime} onChange={e => setEditingSettings({...editingSettings, openTime: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">{t('close_time')}</label>
                <input type="time" value={editingSettings.closeTime} onChange={e => setEditingSettings({...editingSettings, closeTime: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowSettings(false)} className="text-[10px] font-bold text-slate-400 uppercase">{t('cancel')}</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest">{t('confirm_booking')}</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
        {nextDays.map(date => (
          <button 
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`min-w-[80px] p-4 rounded-[24px] border transition-all flex flex-col items-center gap-1 ${isSameDay(date, selectedDate) ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-105' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
          >
            <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">{format(date, 'EEE')}</span>
            <span className="text-xl font-black font-mono">{format(date, 'dd')}</span>
            <span className="text-[9px] font-bold uppercase opacity-50">{format(date, 'MMM')}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex justify-between items-center">
              <span>{t('available_slots')} - {format(selectedDate, 'PPP')}</span>
              <span className="text-slate-300 font-mono text-[10px]">{settings.openTime} - {settings.closeTime}</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {generateSlots().map(slot => {
                const status = getSlotStatus(slot);
                const timeStr = format(slot, 'HH:mm');
                
                return (
                  <div key={slot.toISOString()} className="relative group">
                    <button 
                      disabled={status.type !== 'FREE'}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all h-24 flex flex-col justify-between ${
                        status.type === 'FREE' ? (selectedSlot && isSameDay(selectedSlot, slot) && format(selectedSlot, 'HH:mm') === timeStr ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 hover:border-blue-300') :
                        status.type === 'BLOCKED' ? 'bg-slate-200 border-slate-200 opacity-60 cursor-not-allowed' :
                        status.data.type === 'VACCINATION' ? 'bg-amber-100 border-amber-200 text-amber-900 cursor-not-allowed text-xs' :
                        'bg-blue-100 border-blue-200 text-blue-900 cursor-not-allowed text-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-sm font-black font-mono">{timeStr}</span>
                        {status.type !== 'FREE' && (
                          status.type === 'BLOCKED' ? <X className="w-3 h-3 text-slate-400" /> : <ShieldCheck className="w-3 h-3 text-current opacity-50" />
                        )}
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-tighter truncate w-full">
                        {status.type === 'FREE' ? (selectedSlot && isSameDay(selectedSlot, slot) && format(selectedSlot, 'HH:mm') === timeStr ? 'Selected' : t('available_slots')) :
                         status.type === 'BLOCKED' ? t('type_blocked') :
                         status.data.reason || (status.data.type === 'VACCINATION' ? t('type_vaccination') : t('type_consultation'))}
                      </div>
                    </button>
                    {(status.type === 'BOOKED' && (user?.role === 'ADMIN' || user?.role === 'SECRETARY')) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCheckIn(status.data.id); }} 
                        className="absolute inset-0 bg-blue-600/90 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-2 text-center"
                      >
                         <UserCheck className="w-5 h-5 mb-1" />
                         <span className="text-[8px] font-black uppercase leading-tight">{t('check_in')}</span>
                      </button>
                    )}
                    {(status.type === 'FREE' && (user?.role === 'ADMIN' || user?.role === 'DOCTOR')) && (
                      <button onClick={(e) => { e.stopPropagation(); handleBlockSlot(slot); }} className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {selectedSlot ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-blue-900 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-100 sticky top-2 border border-blue-800">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-8">{t('confirm_booking')}</h4>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/20">
                    <span className="text-[10px] font-bold uppercase">{format(selectedSlot, 'MMM')}</span>
                    <span className="text-xl font-black">{format(selectedSlot, 'dd')}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black font-mono">{format(selectedSlot, 'HH:mm')}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">{format(selectedSlot, 'EEEE')}</p>
                  </div>
                </div>
                <form onSubmit={handleSchedule} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">{t('appointment_type')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setType('CONSULTATION')} className={`py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${type === 'CONSULTATION' ? 'bg-white text-blue-900 border-white' : 'bg-blue-800 border-blue-700 text-blue-100 hover:bg-blue-700'}`}>{t('type_consultation')}</button>
                      <button type="button" onClick={() => setType('VACCINATION')} className={`py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${type === 'VACCINATION' ? 'bg-white text-blue-900 border-white' : 'bg-blue-800 border-blue-700 text-blue-100 hover:bg-blue-700'}`}>{t('type_vaccination')}</button>
                    </div>
                  </div>
                  {type === 'VACCINATION' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Choix du Vaccin</label>
                      <select 
                        value={reason} 
                        onChange={e => setReason(e.target.value)}
                        className="w-full bg-blue-800 border border-blue-700 p-3 rounded-xl text-xs outline-none focus:border-white transition-all text-white appearance-none"
                        required
                      >
                        <option value="">Sélectionnez un vaccin...</option>
                        {Object.entries(VACCINE_LIST).map(([cat, vaccines]) => (
                          <optgroup label={t(cat.toLowerCase() + '_vaccines')} key={cat} className="bg-blue-900">
                            {vaccines.map(v => <option key={`${cat}-${v}`} value={`${v} (${cat})`}>{v}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">{t('reason')}</label>
                      <input value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-blue-800 border border-blue-700 p-3 rounded-xl text-xs placeholder:text-blue-500 outline-none focus:border-white transition-all text-white" placeholder="Complément d'info..." />
                    </div>
                  )}
                  <div className="pt-4 space-y-3">
                    <button type="submit" className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-800/20 active:scale-95 transition-all">{t('confirm_booking')}</button>
                    <button type="button" onClick={() => setSelectedSlot(null)} className="w-full py-2 text-[10px] font-black uppercase opacity-60 hover:opacity-100 transition-all">{t('cancel')}</button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[32px] border border-slate-200 p-8 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                  <Calendar className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{t('select_date')}</h4>
                <p className="text-[10px] text-slate-400 font-medium max-w-[180px] leading-relaxed">{t('electronic_scheduling')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const VaccinationView = () => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetch(`/api/vaccinations/schedule/${user.id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.json())
    .then(data => setSchedule(Array.isArray(data) ? data : []))
    .catch(() => setSchedule([]));
  }, [user]);

  const categories = ['CHILD', 'ADULT', 'TRAVELER'];
  const doneCount = schedule.filter(s => s.status === 'ADMINISTERED').length;
  const totalCount = schedule.length;
  const score = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="p-6">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{t('vaccinations')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('age_based_engine')}</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2">
              <Clipboard className="w-3.5 h-3.5" />
              {t('digital_card')}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-10">
          {categories.map(cat => {
            const filtered = schedule.filter(v => v.category === cat);
            if (filtered.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  {t(cat.toLowerCase() + '_vaccines')}
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map(v => (
                    <div key={v.name} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          v.status === 'MISSED' ? 'bg-red-50 text-red-500 border-red-100' : 
                          v.status === 'ADMINISTERED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {v.status === 'ADMINISTERED' ? <ShieldCheck className="w-5 h-5" /> : <Syringe className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{v.name}</h4>
                          <p className="text-[9px] text-slate-400 font-mono uppercase tracking-tighter">
                            {v.status === 'ADMINISTERED' ? `${t('vaccine_done')}: ${new Date(v.administeredAt).toLocaleDateString()}` : `${t('vaccine_due')}: ${new Date(v.dueDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                        v.status === 'MISSED' ? 'bg-red-100 text-red-700 border-red-200' : 
                        v.status === 'ADMINISTERED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>{v.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full"></div>
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">{t('immunity_score')}</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{t('ai_bio_analysis')}</p>
              </div>
            </div>
            <div className="mb-8 relative z-10">
              <div className="flex justify-between items-end mb-3">
                <span className="text-5xl font-black text-white font-mono tracking-tighter">{score}<span className="text-sm text-slate-600 ml-1">/100</span></span>
                <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{score > 80 ? t('optimal') : 'À RENFORCER'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_#2563eb]"
                />
              </div>
            </div>
            <div className="p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-slate-400 font-medium text-[11px] leading-relaxed italic">
                "{t('digital_card_synced')}"
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('local_specifics')}</h4>
             <div className="space-y-4">
                <div className="flex items-start gap-4">
                   <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-800">{t('orange_momo')} / MTN</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{t('momo_payments')}</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <Signal className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-800">{t('low_bandwidth')}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{t('network_optimized')}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const RecordsView = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [medsList, setMedsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('ALL');
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<{email: string, acts: any[]} | null>(null);
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [showMedsManager, setShowMedsManager] = useState(false);
  
  // Form State
  const [patientEmail, setPatientEmail] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [service, setService] = useState('ADULT');
  const [selectedMeds, setSelectedMeds] = useState<{name: string, dosage: string, instructions: string}[]>([]);
  
  // Meds Manager State
  const [newMed, setNewMed] = useState({ name: '', dosage: '', type: 'Comprimé' });

  const fetchRecords = () => {
    const endpoint = user?.role === 'PATIENT' ? '/api/records/me' : '/api/records';
    fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.json())
    .then(data => setRecords(Array.isArray(data) ? data : []))
    .catch(() => setRecords([]));
  };

  const fetchMeds = () => {
    fetch('/api/medications', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.json())
    .then(data => setMedsList(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchRecords();
    fetchMeds();
  }, [user]);

  const toggleMed = (med: any) => {
    const exists = selectedMeds.find(m => m.name === med.name);
    if (exists) {
      setSelectedMeds(selectedMeds.filter(m => m.name !== med.name));
    } else {
      setSelectedMeds([...selectedMeds, { name: med.name, dosage: med.dosage, instructions: '' }]);
    }
  };

  const handleUpdateMedInstruction = (index: number, instruction: string) => {
    const updated = [...selectedMeds];
    updated[index].instructions = instruction;
    setSelectedMeds(updated);
  };

  const handleAddMedToBase = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/medications', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kyam_token')}`
      },
      body: JSON.stringify(newMed)
    });
    if (res.ok) {
      setNewMed({ name: '', dosage: '', type: 'Comprimé' });
      fetchMeds();
    }
  };

  const generatePDFBase64 = (recordData: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(242, 245, 249);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("CENTRE MÉDICAL KYAM", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Excellence en Santé & Soins Modernes", 105, 30, { align: 'center' });
    
    // Patient Info
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`Patient: ${recordData.patientEmail || 'Non spécifié'}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 60);
    doc.text(`Praticien: Dr. ${user?.fullName}`, 20, 70);
    
    // Diagnosis & Treatment
    doc.setFontSize(14);
    doc.text("DIAGNOSTIC & TRAITEMENT", 20, 90);
    doc.setFontSize(10);
    doc.text(recordData.diagnosis, 20, 100);
    doc.text(recordData.treatment, 20, 110);
    
    // Prescription Table
    if (recordData.meds && recordData.meds.length > 0) {
      doc.setFontSize(14);
      doc.text("ORDONNANCE MÉDICALE", 20, 130);
      autoTable(doc, {
        startY: 140,
        head: [['Médicament', 'Dosage', 'Instructions']],
        body: recordData.meds.map((m: any) => [m.name, m.dosage, m.instructions]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });
    }
    
    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 130;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Ce document est un duplicata numérique officiel du Centre Médical KYAM.", 105, 280, { align: 'center' });
    
    return doc.output('datauristring');
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const prescriptionPDF = generatePDFBase64({
      patientEmail,
      diagnosis: `[${service}] ${diagnosis}`,
      treatment,
      meds: selectedMeds
    });

    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kyam_token')}`
      },
      body: JSON.stringify({
        patientId: 'demo-patient-id', // In real app, search for patientId by email
        diagnosis: `[${service}] ${diagnosis}`,
        treatment,
        prescription: selectedMeds.map(m => `${m.name} (${m.dosage}): ${m.instructions}`).join('\n'),
        prescriptionPDF,
        meds: selectedMeds
      })
    });
    if (res.ok) {
      setIsAdding(false);
      setDiagnosis('');
      setTreatment('');
      setPatientEmail('');
      setSelectedMeds([]);
      fetchRecords();
    }
  };

  const downloadPDF = (pdfData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = filename;
    link.click();
  };

  const fetchPatientHistory = (email: string) => {
    fetch(`/api/records/patient/${email}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.json())
    .then(acts => setSelectedPatientHistory({ email, acts }));
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      (r.patientEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.treatment || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = filterService === 'ALL' || (r.diagnosis && r.diagnosis.includes(`[${filterService}]`));
    
    return matchesSearch && matchesService;
  });

  return (
    <div className="p-6">
      {/* Patient History Modal */}
      <AnimatePresence>
        {selectedPatientHistory && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Historique Patient</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedPatientHistory.email}</p>
                </div>
                <button onClick={() => setSelectedPatientHistory(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-all border border-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {selectedPatientHistory.acts.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 font-bold uppercase text-[10px] tracking-widest">Aucun historique disponible</p>
                ) : (
                  selectedPatientHistory.acts.map((act: any) => (
                    <div key={act.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-slate-200 last:before:hidden">
                      <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-200"></div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 border-l-4 border-l-blue-600">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{act.diagnosis}</h4>
                           <span className="text-[9px] font-mono text-slate-400">{new Date(act.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3">{act.treatment}</p>
                        {act.meds && act.meds.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {act.meds.map((m: any, j: number) => (
                              <span key={j} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-bold text-slate-600">
                                {m.name} {m.dosage}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 bg-slate-900 border-t border-slate-800 text-center">
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-loose">Fin de l'historique longitudinal • KYAM Health v4</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{t('records')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('digital_clinical_repo')}</p>
        </div>
        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
          <div className="flex gap-3">
             <button 
              onClick={() => setShowMedsManager(!showMedsManager)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded shadow-sm hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {t('medications_base')}
            </button>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {t('medical_act')}
            </button>
          </div>
        )}
      </header>

      {/* Advanced Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher un patient ou un diagnostic..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold shadow-sm focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {['ALL', 'ADULT', 'CHILD', 'TRAVELER'].map(s => (
            <button
              key={s}
              onClick={() => setFilterService(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterService === s ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
            >
              {s === 'ALL' ? 'Tous' : t(s.toLowerCase() + '_vaccines').split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {showMedsManager && (
         <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 overflow-hidden"
         >
            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest">{t('medications_base')}</h3>
            <form onSubmit={handleAddMedToBase} className="flex gap-4 mb-6">
               <input 
                  placeholder={t('med_name')}
                  className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded text-xs"
                  value={newMed.name}
                  onChange={e => setNewMed({...newMed, name: e.target.value})}
                  required
               />
               <input 
                  placeholder={t('med_dosage')}
                  className="w-32 p-2 bg-slate-50 border border-slate-100 rounded text-xs"
                  value={newMed.dosage}
                  onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                  required
               />
               <button type="submit" className="px-4 bg-blue-600 text-white rounded text-[10px] font-black uppercase">
                  {t('add_medication')}
               </button>
            </form>
            <div className="grid grid-cols-4 gap-2">
               {medsList.map(m => (
                  <div key={m.id} className="p-2 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-600 flex justify-between">
                     <span>{m.name} - {m.dosage}</span>
                     <button className="text-red-400 hover:text-red-600" onClick={async () => {
                        await fetch(`/api/medications/${m.id}`, { 
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
                        });
                        fetchMeds();
                     }}><X className="w-3 h-3" /></button>
                  </div>
               ))}
            </div>
         </motion.div>
      )}

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[32px] border border-blue-100 shadow-2xl mb-12 max-w-4xl mx-auto border-t-4 border-t-blue-500"
        >
          <form onSubmit={handleCreateRecord} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('appointment_type')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setService('ADULT')} className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${service === 'ADULT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{t('consultation_adult')}</button>
                  <button type="button" onClick={() => setService('PEDIATRIC')} className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${service === 'PEDIATRIC' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{t('consultation_pediatric')}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('patient_email')}</label>
                <input value={patientEmail} onChange={e => setPatientEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all font-mono" placeholder={t('seach_patient_email')} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('diagnosis')}</label>
                <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all" required />
              </div>
            </div>
            
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('medications_base')}</label>
               <div className="flex flex-wrap gap-2 mb-4">
                  {medsList.map(m => (
                     <button 
                        key={m.id}
                        type="button"
                        onClick={() => toggleMed(m)}
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${selectedMeds.find(sm => sm.name === m.name) ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200'}`}
                     >
                        {m.name} {m.dosage}
                     </button>
                  ))}
               </div>
               {selectedMeds.length > 0 && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     {selectedMeds.map((m, i) => (
                        <div key={i} className="flex gap-4 items-center">
                           <span className="text-[11px] font-black w-32 truncate">{m.name}</span>
                           <input 
                              placeholder={t('med_instructions')}
                              className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                              value={m.instructions}
                              onChange={e => handleUpdateMedInstruction(i, e.target.value)}
                           />
                           <button type="button" onClick={() => toggleMed({name: m.name})} className="text-red-400"><X className="w-4 h-4" /></button>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('treatment')}</label>
              <textarea value={treatment} onChange={e => setTreatment(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all h-24 resize-none" required />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
               <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">{t('cancel')}</button>
               <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                  <div className="flex items-center gap-2">
                     <Clipboard className="w-4 h-4" />
                     {t('save_medical_act')} & {t('generate_pdf')}
                  </div>
               </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {(!Array.isArray(filteredRecords) || filteredRecords.length === 0) ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-loose">Aucun dossier trouvé pour cette recherche</p>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:border-blue-200 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Logo className="w-16 h-16" />
               </div>
               <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <button 
                         onClick={() => fetchPatientHistory(record.patientEmail)}
                         className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                       >
                          {record.patientEmail || 'Patient'}
                       </button>
                    </div>
                    <h4 className={`font-black text-slate-800 tracking-tight ${record.diagnosis === '[CONFIDENTIEL]' ? 'italic text-slate-400 opacity-50' : ''}`}>
                      {record.diagnosis}
                    </h4>
                    <p className={`text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 ${record.treatment === '[CONFIDENTIEL]' ? 'italic opacity-50' : ''}`}>
                      {record.treatment}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-400">{new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString()}</p>
                    {record.prescriptionPDF && (
                       <button 
                        onClick={() => downloadPDF(record.prescriptionPDF, `Ordonnance_KYAM_${record.id.substring(0, 5)}.pdf`)}
                        className="mt-2 text-[9px] font-black uppercase text-blue-600 hover:underline flex items-center gap-1 ml-auto"
                       >
                         <CreditCard className="w-3 h-3" />
                         {t('download_prescription')}
                       </button>
                    )}
                  </div>
               </div>
               {record.prescription && (
                 <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-700 uppercase mb-2 tracking-widest">{t('prescription_title')}</p>
                    <p className="text-xs text-slate-600 font-medium whitespace-pre-line leading-relaxed">{record.prescription}</p>
                 </div>
               )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PaymentsView = () => {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <header className="mb-10">
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{t('billing')}</h2>
        <p className="text-xs text-slate-500 font-medium">{t('billing_manager')}</p>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-8">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{t('total_outstanding')}</p>
        <h3 className="text-5xl font-black text-slate-800 font-mono mb-8">45,000 <span className="text-xl text-slate-400 uppercase">GNF</span></h3>
        <div className="flex gap-4">
          <button className="px-5 py-3 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all">
            <Activity className="w-4 h-4" />
            {t('initiate_orange')}
          </button>
          <button className="px-5 py-3 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-100 flex items-center gap-2 hover:bg-blue-600 transition-all">
            <CreditCard className="w-4 h-4" />
            {t('initiate_mtn')}
          </button>
        </div>
      </div>

      <h3 className="text-[10px] font-bold text-slate-400 mb-6 font-mono uppercase tracking-[0.2em] border-b border-slate-100 pb-2">{t('verified_tx_pulse')}</h3>
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-white px-6 py-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                <Clock className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('consultation_log')} #{i}</h4>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{t('language') === 'Langue' ? 'Sept' : 'Sept'} {10 + i}, 2024</p>
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="text-sm font-black text-slate-800 font-mono">45,000 GNF</p>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em] font-mono">STATUS: {t('verified')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChangePasswordView = ({ onSuccess }: { onSuccess: () => void }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kyam_token')}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t('change_password')}</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase mt-2 leading-relaxed">
            Pour votre sécurité, vous devez modifier le mot de passe temporaire fourni par l'administrateur lors de votre première connexion.
          </p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau Mot de Passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer le Mot de Passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const UsersView = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('kyam2024');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [specialty, setSpecialty] = useState('');
  const [practitionerNumber, setPractitionerNumber] = useState('');
  const [familyId, setFamilyId] = useState('');

  const fetchUsers = () => {
    fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setUsers(Array.isArray(data) ? data : []))
    .catch(() => setUsers([]));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kyam_token')}`
        },
        body: JSON.stringify({ 
          email, 
          password, 
          fullName, 
          role,
          specialty,
          registrationNumber: practitionerNumber,
          familyId
        }),
      });
      if (res.ok) {
        setIsProvisioning(false);
        fetchUsers();
        // Reset
        setEmail('');
        setFullName('');
        setSpecialty('');
        setPractitionerNumber('');
        setFamilyId('');
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{t('user_directory')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('manage_accounts')}</p>
        </div>
        <button 
          onClick={() => setIsProvisioning(true)}
          className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('provision_user')}</span>
        </button>
      </header>

      {isProvisioning && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[32px] border border-blue-100 shadow-2xl mb-8 max-w-2xl">
          <form onSubmit={handleProvision} className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">{t('provision_user')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('full_name')}</label>
                <input required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" placeholder="Nom Complet" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('email_address')}</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" placeholder="email@exemple.com" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('role')}</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                  <option value="PATIENT">PATIENT</option>
                  <option value="DOCTOR">DOCTOR</option>
                  <option value="SECRETARY">SECRETARY</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('password')}</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('link_family')}</label>
                <input value={familyId} onChange={e => setFamilyId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold font-mono" placeholder="ID Famille (Optionnel)" />
              </div>
            </div>

            {role === 'DOCTOR' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('specialty')}</label>
                  <input required value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full p-3 bg-white border border-blue-200 rounded-xl text-xs font-bold" placeholder="Ex: Cardiologue" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('practitioner_number')}</label>
                  <input required value={practitionerNumber} onChange={e => setPractitionerNumber(e.target.value)} className="w-full p-3 bg-white border border-blue-200 rounded-xl text-xs font-bold font-mono" placeholder="RPPS-..." />
                </div>
              </motion.div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsProvisioning(false)} className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase">{t('cancel')}</button>
              <button disabled={loading} type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100">{loading ? '...' : t('confirm_booking')}</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">{t('full_name')}</th>
              <th className="px-6 py-4">{t('email_address')}</th>
              <th className="px-6 py-4">{t('role')}</th>
              <th className="px-6 py-4 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{u.fullName}</td>
                <td className="px-6 py-4 text-slate-500 font-mono">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    u.role === 'ADMIN' ? 'bg-red-50 text-red-700 border border-red-100' :
                    u.role === 'DOCTOR' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 transition-all"><Settings className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LandingPage = ({ onEnterPortal }: { onEnterPortal: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-100 bg-blue-600 flex items-center justify-center p-2">
            <Logo className="text-white w-full h-full" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase whitespace-nowrap leading-none mb-1">{t('app_name')}</h1>
            <div className="flex items-center gap-1.5 opacity-60">
               <div className="flex w-3.5 h-2.5 overflow-hidden rounded-[1px] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                  <div className="flex-1 bg-[#CE1126]"></div>
                  <div className="flex-1 bg-[#FCD116]"></div>
                  <div className="flex-1 bg-[#009460]"></div>
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest">Guinée</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex items-center gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
               <WeatherWidget />
            </div>
            <button onClick={onEnterPortal} className="text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">{t('patients')}</button>
          </div>
          <LanguageSwitcher />
          <button 
            onClick={onEnterPortal}
            className="px-5 py-2 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-105 transition-all"
          >
            {t('landing_btn_portal')}
          </button>
        </div>
      </nav>

      {/* Floating Social Bar */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-xl flex flex-col gap-1">
          <SocialLinks vertical />
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-100">
            <ShieldCheck className="w-3 h-3" />
            {t('app_catchphrase')}
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-8 italic">
            {t('landing_hero_title')}
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
            {t('landing_hero_subtitle')}
          </p>
          <div className="flex gap-4">
            <button onClick={onEnterPortal} className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all">
              {t('landing_btn_portal')}
            </button>
            <button className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              {t('landing_btn_contact')}
            </button>
          </div>
        </motion.div>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full"></div>
          <div className="relative bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl">
             <div className="grid grid-cols-2 gap-4">
               <div className="h-48 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                  <Activity className="w-10 h-10 text-blue-500 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center px-4">{t('surveillance_247')}</p>
               </div>
               <div className="h-48 bg-blue-600 rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-blue-100">
                  <Syringe className="w-10 h-10 text-white mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white text-center px-4">{t('experts_vaccination')}</p>
               </div>
               <div className="col-span-2 h-40 bg-slate-900 rounded-2xl p-8 flex justify-between items-center overflow-hidden relative">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 blur-2xl rounded-full"></div>
                  <div>
                    <h4 className="text-white text-xl font-black mb-1 leading-none tracking-tight">{t('portal_digital')}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('total_connectivity')}</p>
                  </div>
                  <button onClick={onEnterPortal} className="px-4 py-2 bg-white rounded-lg text-[9px] font-black uppercase text-slate-900">{t('manage')}</button>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-amber-50/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[40px] shadow-sm border border-amber-100"
          >
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4">{t('mission_title')}</h4>
            <p className="text-slate-600 font-medium leading-relaxed italic">{t('mission_text')}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-900 p-10 rounded-[40px] shadow-sm border border-blue-800"
          >
            <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-4">{t('vision_title')}</h4>
            <p className="text-white font-medium leading-relaxed italic">{t('vision_text')}</p>
          </motion.div>
        </div>
      </section>

      {/* Presentation */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
             <div className="relative aspect-square rounded-[60px] bg-slate-100 overflow-hidden border-8 border-white shadow-2xl">
                <img src="https://picsum.photos/seed/clinic/800/800" alt="Clinic" className="object-cover w-full h-full opacity-80" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
             </div>
          </div>
          <div className="order-1 lg:order-2">
             <div className="w-12 h-1 bg-blue-600 mb-8 rounded-full"></div>
             <h3 className="text-4xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
               {t('landing_presentation_title')}
             </h3>
             <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
               {t('landing_presentation_text')}
             </p>
             <div className="grid grid-cols-1 gap-6 mb-10">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-blue-600 text-xs uppercase tracking-widest mb-2">{t('values_title')}</h4>
                  <p className="text-sm text-slate-600 font-bold">{t('values_list')}</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase mb-2">{t('omnipraticiens')}</h4>
                  <p className="text-xs text-slate-500">{t('omnipraticiens_desc')}</p>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase mb-2">{t('urgence_queue')}</h4>
                  <p className="text-xs text-slate-500">{t('urgence_queue_desc')}</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto text-center">
         <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">{t('landing_features_title')}</h3>
         <h2 className="text-5xl font-black text-slate-900 mb-20 tracking-tighter">{t('intelligent_care')}</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t('agenda_intelligent'), desc: t('agenda_intelligent_desc'), icon: Calendar },
              { title: t('dossier_digital'), desc: t('dossier_digital_desc'), icon: Clipboard },
              { title: t('ia_preventive'), desc: t('ia_preventive_desc'), icon: Activity }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group"
                >
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all mx-auto">
                      <Icon className="w-8 h-8" />
                   </div>
                   <h4 className="text-xl font-bold text-slate-900 mb-4">{f.title}</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
         </div>
      </section>

      {/* Multi-category Vaccinal Guide */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 blur-[100px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">{t('vaccination')}</h4>
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter italic">{t('vaccine_info_title')}</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">{t('vaccine_info_subtitle')}</p>
          </div>

          <div className="space-y-24">
            {/* Children Section */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Baby className="w-4 h-4 text-amber-500" />
                  {t('child_vaccines')}
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                {[
                  { name: 'BCG', badge: t('birth'), desc: t('bcg_desc'), dose: '1 injection' },
                  { name: 'Polio', badge: t('6_weeks'), desc: t('polio_desc'), dose: 'Multiples + rappels' },
                  { name: 'Pentavalent', badge: t('6_weeks'), desc: t('penta_desc'), dose: '3 injections' },
                  { name: 'Pneumocoque', badge: t('6_weeks'), desc: t('pneumo_desc') },
                  { name: 'Rotavirus', badge: t('6_weeks'), desc: t('rota_desc'), form: 'Orale' },
                  { name: 'Rougeole', badge: t('9_months'), desc: t('rougeole_desc') },
                  { name: 'Fièvre jaune', badge: t('9_months'), desc: t('yellow_fever_desc') },
                ].map((v, i) => (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={v.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase tracking-widest mb-3 border border-blue-100">{v.badge}</span>
                    <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight italic">{v.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{v.desc}</p>
                    {(v.dose || v.form) && (
                      <div className="pt-4 border-t border-slate-50 flex items-center gap-4">
                        {v.dose && <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter"><span className="text-slate-200 mr-1">/</span> {v.dose}</p>}
                        {v.form && <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter"><span className="text-slate-200 mr-1">/</span> {v.form}</p>}
                      </div>
                    )}
                    <a href="#" className="mt-6 block text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors">{t('view_details')} →</a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Adults Section */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  {t('adult_vaccines')}
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                {[
                  { name: 'Hépatite B', desc: t('hep_b_desc'), dose: '3 injections' },
                  { name: 'Typhoïde', desc: t('typhoid_desc') },
                  { name: 'Tétanos', desc: t('tetanus_desc'), reminder: t('10_years') },
                  { name: 'HPV', desc: t('hpv_desc') },
                  { name: 'Grippe', desc: t('flu_desc'), reminder: 'Annuel' },
                  { name: 'Rage', desc: t('rage_desc') },
                  { name: 'Pneumocoque', desc: t('pneumo_desc') },
                ].map((v, i) => (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={v.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group">
                    <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors uppercase tracking-tight italic">{v.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{v.desc}</p>
                    {(v.dose || v.reminder) && (
                      <div className="pt-4 border-t border-slate-50 flex items-center gap-4">
                        {v.dose && <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter"><span className="text-slate-200 mr-1">/</span> {v.dose}</p>}
                        {v.reminder && <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter"><span className="text-slate-200 mr-1">/</span> {v.reminder}</p>}
                      </div>
                    )}
                    <a href="#" className="mt-6 block text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-700 transition-colors">{t('view_details')} →</a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Travelers Section */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Globe className="w-4 h-4 text-purple-500" />
                  {t('traveler_vaccines')}
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                {[
                  { name: 'Fièvre jaune', desc: 'Souvent obligatoire pour voyager. Protection à vie préconisée.' },
                  { name: 'Choléra', desc: t('cholera_desc') },
                ].map((v, i) => (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={v.name} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:border-purple-300 transition-all group flex gap-6 items-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 shrink-0 border border-purple-100">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-1 leading-none uppercase tracking-tight italic group-hover:text-purple-600 transition-colors">{v.name}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{v.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20">
             <button onClick={onEnterPortal} className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all">
                {t('confirm_booking')}
             </button>
          </div>

          <div className="mt-24 p-12 bg-white rounded-[40px] border border-slate-200 shadow-sm text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <FileText className="w-40 h-40" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-8 italic flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                Informations & Recommandations
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <div>
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">L'importance des Rappels</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        L'immunité conférée par certains vaccins peut diminuer avec le temps. Les rappels (comme pour le Tétanos tous les 10 ans) sont essentiels pour maintenir une protection optimale tout au long de la vie.
                      </p>
                   </div>
                   <div>
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Protocoles par Âge</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Le système immunitaire évolue. Les nourrissons reçoivent des vaccins fondamentaux (BCG, Polio) tandis que les adolescents et adultes ont des besoins spécifiques liés à leur environnement (HPV, Grippe).
                      </p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Besoin d'un conseil ?</p>
                      <p className="text-sm text-slate-700 font-bold mb-4 italic leading-snug">
                        "Prenez rendez-vous avec nos omnipraticiens pour établir un calendrier vaccinal personnalisé."
                      </p>
                      <button onClick={onEnterPortal} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                        Consulter un médecin →
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-4">{t('patient_reviews')}</h4>
            <h3 className="text-4xl font-black text-white tracking-tight">{t('community_trust')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Moussa Camara", text: t('review_1'), rating: 5, date: "2 jours" },
              { name: "Fatoumata Diallo", text: t('review_2'), rating: 5, date: "1 semaine" },
              { name: "Ousmane Keita", text: t('review_3'), rating: 4, date: "3 jours" }
            ].map((rev, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-[40px] hover:border-blue-500/30 transition-all group"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(rev.rating)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] text-amber-900 font-bold">★</div>
                  ))}
                </div>
                <p className="text-slate-300 font-medium italic mb-8 leading-relaxed">"{rev.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-xs font-black text-slate-400 uppercase overflow-hidden border border-slate-600">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.name}`} alt="avatar" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">{rev.name}</h5>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{rev.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-600 flex items-center justify-center p-2 shadow-lg shadow-blue-100">
              <Logo className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-800 tracking-tighter uppercase leading-none mb-1">{t('app_name')}</span>
              <div className="flex items-center gap-1 opacity-40">
                 <div className="flex w-3 h-2 overflow-hidden rounded-[1px]">
                    <div className="flex-1 bg-[#CE1126]"></div>
                    <div className="flex-1 bg-[#FCD116]"></div>
                    <div className="flex-1 bg-[#009460]"></div>
                 </div>
                 <span className="text-[7px] font-black uppercase tracking-widest leading-none">Conakry, Guinée</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <SocialLinks />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center italic">
              {t('app_catchphrase')}
            </p>
          </div>

          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">@2026 KYAM MEDICAL CENTER. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

const Login = ({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = requires2FA ? '/api/auth/verify-2fa' : '/api/auth/login';
      const body = requires2FA ? { email, code } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.requires2FA) {
        setRequires2FA(true);
      } else {
        login(data.token, data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-100/50 border border-white"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
            <Logo className="text-white w-14 h-14" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{t('app_name')}</h2>
          <p className="text-gray-400 font-medium text-[10px] mt-2 uppercase tracking-widest">{t('app_catchphrase')}</p>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        {requires2FA ? (
           <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
               <p className="text-xs text-blue-800 font-bold leading-relaxed">
                  Un code de vérification a été envoyé sur votre messagerie sécurisée. Veuillez le saisir pour finaliser votre connexion.
               </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Code 2FA (6 chiffres)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-mono text-xl tracking-widest text-center font-black"
                placeholder="000 000"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Valider le code'}
            </button>
            <button type="button" onClick={() => setRequires2FA(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Retour</button>
           </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t('email_address')}</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? t('authenticating') : t('signin_now')}
            </button>
          </form>
        )}

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-400 font-medium">{t('dont_have_account')} <button className="text-blue-600 font-bold hover:underline" onClick={onRegister}>{t('create_one')}</button></p>
          <button onClick={onBack} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-all">← {t('back_to_presentation')}</button>
        </div>
      </motion.div>
    </div>
  );
};

const Register = ({ onBack }: { onBack: () => void }) => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role: 'PATIENT' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-100/50 border border-white"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Inscription Patient</h2>
          <p className="text-gray-400 font-medium text-[10px] mt-2 uppercase tracking-widest">{t('app_catchphrase')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('full_name')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium text-xs"
              placeholder="Votre nom complet"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('email_address')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium text-xs"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium text-xs"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Création...' : 'Créer mon compte patient'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={onBack} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-all">← Retour à la connexion</button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kyam_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('kyam_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisitingLanding, setIsVisitingLanding] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Auto-logout after 2 hours of inactivity
  useEffect(() => {
    if (!user) return;

    let timeout: any;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout();
        alert("Session expirée après 2 heures d'inactivité pour votre sécurité.");
      }, 2 * 60 * 60 * 1000); // 2 hours
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      clearTimeout(timeout);
    };
  }, [user]);

  useEffect(() => {
    if (token && user) {
      const newSocket = io({
        auth: { token }
      });
      
      newSocket.on('connect', () => {
        newSocket.emit('authenticate', token);
      });

      newSocket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 50));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, user]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newToken ? newUser : null);
    localStorage.setItem('kyam_token', newToken);
    localStorage.setItem('kyam_user', JSON.stringify(newUser));
  };

  const handlePasswordSuccess = () => {
    if (user) {
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem('kyam_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('kyam_token');
    localStorage.removeItem('kyam_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, notifications }}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col h-screen overflow-hidden">
        {!user ? (
          isRegistering ? (
             <Register onBack={() => setIsRegistering(false)} />
          ) : (
            isVisitingLanding ? (
              <LandingPage onEnterPortal={() => setIsVisitingLanding(false)} />
            ) : (
              <Login onBack={() => setIsVisitingLanding(true)} onRegister={() => setIsRegistering(true)} />
            )
          )
        ) : (
          <>
            {user.mustChangePassword && <ChangePasswordView onSuccess={handlePasswordSuccess} />}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold p-1 overflow-hidden shadow-md">
                   <Logo className="w-full h-full text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">{t('app_name')}</h1>
                <span className="ml-4 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                  {t('system_live')}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <LanguageSwitcher />
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{t('server_pulse')}</p>
                    <p className="text-xs font-mono font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{t('live_connection')}</p>
                    <p className={`text-xs font-bold ${socket?.connected ? 'text-blue-600' : 'text-slate-400'}`}>{socket?.connected ? t('active') : t('ready')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                  <ActivityModeSwitcher />
                  <NotificationCenter notifications={notifications} />
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <Navigation 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
              />
              <main className="flex-1 overflow-auto bg-slate-50 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'appointments' && <AppointmentView />}
                    {activeTab === 'vaccinations' && <VaccinationView />}
                    {activeTab === 'records' && <RecordsView />}
                    {activeTab === 'my-records' && <RecordsView />}
                    {activeTab === 'payments' && <PaymentsView />}
                    {activeTab === 'billing' && <PaymentsView />}
                    {activeTab === 'users' && <UsersView />}
                    {activeTab === 'family' && <FamilyView />}
                  </motion.div>
                </AnimatePresence>
              </main>
              <InternalChat />
            </div>

            <footer className="bg-white border-t border-slate-200 h-8 flex items-center justify-between px-6 shrink-0 z-50">
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> {t('whatsapp_api')}: {t('online')}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {t('sms_fallback')}: {t('ready')}</span>
                <span className="flex items-center gap-1.5"><span className={`w-2 h-2 ${socket?.connected ? 'bg-blue-500' : 'bg-slate-300'} rounded-full`}></span> {socket?.connected ? `${t('real_time')}: ${t('connected')}` : `${t('offline_sync')}: 100%`}</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                {t('core_engine')}: v4.12.0-STABLE_PROD
              </div>
            </footer>
          </>
        )}
      </div>
    </AuthContext.Provider>
  );
}
