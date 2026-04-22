import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Clock
} from 'lucide-react';
import { useAuth } from '../../App';

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

export default QueueView;
