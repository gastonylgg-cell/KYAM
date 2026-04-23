import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { 
  Bell, 
  Send,
  Paperclip,
  FileText,
  User,
  Activity,
  X
} from 'lucide-react';
import { useAuth } from '../../App';

const InternalChat = () => {
  const { t } = useTranslation();
  const { user, socket } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<any>(null);
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
    fetchMessages();
    
    if (socket) {
      socket.on('new_chat_message', (msg: any) => {
        setMessages(prev => [...prev, msg]);
      });

      return () => {
        socket.off('new_chat_message');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    const body: any = { content: newMessage };
    if (attachment) {
      body.attachment = attachment.data;
      body.attachmentName = attachment.name;
      body.attachmentType = attachment.type;
    }

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kyam_token')}` 
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setNewMessage('');
      setAttachment(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachment({
          name: file.name,
          type: file.type,
          data: ev.target?.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-tighter italic">{t('internal_collaboration')}</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            {t('staff_only')}
          </p>
        </div>
        <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 relative">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">2</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.senderId === user?.id ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={msg.id} 
            className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-2">
              {msg.senderName} • {msg.senderRole}
            </span>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm ${
              msg.senderId === user?.id 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {msg.content}
              {msg.attachment && (
                <div className={`mt-3 p-3 rounded-xl flex items-center gap-3 ${msg.senderId === user?.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                  <FileText className="w-5 h-5" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black truncate">{msg.attachmentName}</p>
                    <a href={msg.attachment} download={msg.attachmentName} className="text-[8px] font-black uppercase underline tracking-widest opacity-70">
                      {t('download')}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[8px] text-slate-300 font-bold mt-1 px-2 uppercase tracking-tighter">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-slate-50 border-t border-slate-100">
        {attachment && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Paperclip className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-blue-700 truncate max-w-[200px]">{attachment.name}</span>
            </div>
            <button onClick={() => setAttachment(null)} className="text-blue-400 hover:text-blue-600">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 cursor-pointer transition-all active:scale-95">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <Paperclip className="w-5 h-5" />
          </label>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('type_message')} 
            className="flex-1 bg-white border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium" 
          />
          <button type="submit" className="p-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default InternalChat;
