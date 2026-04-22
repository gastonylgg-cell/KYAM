import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../../App';

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
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('family_members')}</p>
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

export default FamilyView;
