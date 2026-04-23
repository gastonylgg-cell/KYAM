import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Clipboard, 
  Activity, 
  Syringe,
  Globe,
  Baby,
  UserPlus,
  FileText,
  MessageSquare, 
  Camera, 
  Music2, 
  Play, 
  Sun, 
  ChevronRight,
  ArrowRight,
  Star,
  MapPin,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../Logo';

const LandingSocialLinks = ({ vertical = false }: { vertical?: boolean }) => {
  const links = [
    { icon: MessageSquare, color: 'hover:text-blue-600', url: '#' },
    { icon: Camera, color: 'hover:text-pink-500', url: '#' },
    { icon: Music2, color: 'hover:text-black', url: '#' },
    { icon: Play, color: 'hover:text-red-600', url: '#' },
  ];

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-3`}>
      {links.map((link, i) => {
        const Icon = link.icon;
        return (
          <a 
            key={i} 
            href={link.url} 
            className={`p-3 bg-white/20 backdrop-blur-sm rounded-full text-slate-500 ${link.color} transition-all hover:scale-110 border border-white/40 flex items-center justify-center min-w-[40px] min-h-[40px]`}
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, badge }: { title: string, subtitle?: string, badge?: string }) => (
  <div className="mb-16 text-center max-w-4xl mx-auto">
    {badge && (
      <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
        {badge}
      </span>
    )}
    <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 tracking-tighter leading-none mb-6">
      {title}
    </h2>
    {subtitle && <p className="text-slate-500 font-medium text-lg text-balance">{subtitle}</p>}
  </div>
);

interface LandingPageProps {
  onEnterPortal: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[160px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-400/10 blur-[200px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-50 px-6 py-8"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[2.5rem] p-5 shadow-2xl shadow-slate-900/5">
          <div className="flex items-center gap-5 pl-4">
            <motion.div 
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center p-3 shadow-2xl shadow-blue-500/20"
            >
              <Logo className="text-white w-full h-full" />
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-xl font-display font-black text-slate-900 tracking-tighter uppercase leading-none italic">{t('app_name')}</h1>
              <div className="flex items-center gap-2 opacity-40 mt-1">
                 <div className="flex w-4 h-2.5 overflow-hidden rounded-sm">
                    <div className="flex-1 bg-[#CE1126]"></div>
                    <div className="flex-1 bg-[#FCD116]"></div>
                    <div className="flex-1 bg-[#009460]"></div>
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-[0.2em] leading-none">République de Guinée</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="group flex items-center justify-center w-12 h-12 bg-white/40 hover:bg-white rounded-2xl border border-white/60 text-slate-600 shadow-sm transition-all hover:border-blue-200"
              title="Toggle Language"
            >
              <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
            <button 
              onClick={onEnterPortal}
              className="px-8 h-12 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all hover:scale-[1.05] active:scale-95"
            >
              {t('landing_btn_portal')}
            </button>
          </div>
        </div>
      </motion.nav>


      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="z-10"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-10 shadow-sm">
              <HeartPulse className="w-4 h-4 animate-pulse" />
              {t('app_catchphrase')}
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-6xl lg:text-[100px] font-display font-black text-slate-900 leading-[0.85] tracking-tighter mb-10 text-balance">
              {t('landing_hero_title')}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-slate-500 font-medium leading-relaxed mb-12 max-w-xl text-balance">
              {t('landing_hero_subtitle')}
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <button 
                onClick={onEnterPortal} 
                className="group px-10 py-5 bg-blue-600 text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-all hover:translate-y-[-4px] active:translate-y-0 flex items-center gap-3"
              >
                {t('landing_btn_portal')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-3xl text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                {t('landing_btn_contact')}
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl skew-y-[-2deg] border-[12px] border-white">
              <img 
                src="https://picsum.photos/seed/kyam-hero/1200/1500" 
                alt="Clinic Interior" 
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent"></div>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-12 left-12 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600">
                    <Star className="w-6 h-6 fill-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold tracking-tight">Top Rated 2026</h4>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Medical Excellence</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Visual Echoes */}
            <div className="absolute -top-12 -right-12 w-48 h-48 border border-blue-200 rounded-full opacity-20 animate-spin-slow"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-40"></div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-40 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            badge={t('landing_features_title')}
            title={t('intelligent_care')}
            subtitle="Une infrastructure technologique au service de votre santé"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: t('agenda_intelligent'), desc: t('agenda_intelligent_desc'), icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
              { title: t('dossier_digital'), desc: t('dossier_digital_desc'), icon: Clipboard, color: 'bg-blue-50 text-blue-600' },
              { title: t('ia_preventive'), desc: t('ia_preventive_desc'), icon: HeartPulse, color: 'bg-rose-50 text-rose-600' },
              { title: t('surveillance_247'), desc: "Monitorage constant pour une réactivité maximale.", icon: Activity, color: 'bg-amber-50 text-amber-600' }
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] transition-all group"
                >
                  <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:scale-110`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-display font-black text-slate-900 mb-4 tracking-tight leading-tight">{s.title}</h4>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Split Vision Section */}
      <section className="bg-slate-900 py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
          <div className="bg-slate-800 p-16 lg:p-24 rounded-t-[4rem] lg:rounded-l-[4rem] lg:rounded-tr-none border border-slate-700/50">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-8">{t('mission_title')}</h4>
            <h3 className="text-4xl font-display font-bold text-white mb-8 leading-tight tracking-tight italic">
              "L'innovation médicale pour un accès aux soins d'excellence."
            </h3>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              {t('mission_text')}
            </p>
          </div>
          <div className="bg-blue-600 p-16 lg:p-24 rounded-b-[4rem] lg:rounded-r-[4rem] lg:rounded-bl-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-100 mb-8">{t('vision_title')}</h4>
            <h3 className="text-4xl font-display font-bold text-white mb-8 leading-tight tracking-tight italic">
              "Redessiner le futur de la santé en Guinée."
            </h3>
            <p className="text-blue-50 text-lg font-medium leading-relaxed opacity-90">
              {t('vision_text')}
            </p>
          </div>
        </div>
      </section>

      {/* Vaccinal Guide - Premium Grid */}
      <section className="py-40 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            badge={t('vaccination')}
            title={t('vaccine_info_title')}
            subtitle={t('vaccine_info_subtitle')}
          />
          
          <div className="grid grid-cols-1 gap-24">
            {/* Category: Pediatric */}
            <div>
              <div className="flex items-center gap-6 mb-12">
                <span className="flex-1 h-px bg-slate-200"></span>
                <div className="flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                  <Baby className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t('child_vaccines')}</span>
                </div>
                <span className="flex-1 h-px bg-slate-200"></span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'BCG', badge: t('birth'), desc: t('bcg_desc') },
                  { name: 'Polio', badge: t('6_weeks'), desc: t('polio_desc') },
                  { name: 'Pentavalent', badge: t('6_weeks'), desc: t('penta_desc') },
                  { name: 'Rougeole', badge: t('9_months'), desc: t('rougeole_desc') }
                ].map((v, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-slate-100 premium-shadow group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase tracking-widest border border-blue-100">{v.badge}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
                    </div>
                    <h5 className="text-xl font-display font-black text-slate-900 mb-3 tracking-tight italic uppercase">{v.name}</h5>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed italic">{v.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Category: Adult */}
            <div>
              <div className="flex items-center gap-6 mb-12">
                <span className="flex-1 h-px bg-slate-200"></span>
                <div className="flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t('adult_vaccines')}</span>
                </div>
                <span className="flex-1 h-px bg-slate-200"></span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  { name: 'Hépatite B', desc: t('hep_b_desc'), icon: ShieldCheck },
                  { name: 'Typhoïde', desc: t('typhoid_desc'), icon: Activity },
                  { name: 'Tétanos', desc: t('tetanus_desc'), icon: Clock }
                ].map((v, i) => (
                  <div key={i} className="group p-10 bg-white border border-slate-100 rounded-[3rem] premium-shadow hover:border-blue-200 transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-8">
                      <v.icon className="w-6 h-6" />
                    </div>
                    <h5 className="text-2xl font-display font-black text-slate-900 mb-4 tracking-tight italic uppercase">{v.name}</h5>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed italic">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-24 text-center">
            <button onClick={onEnterPortal} className="group relative inline-flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[3rem] text-sm font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95">
              <span className="relative z-10">{t('landing_btn_portal')}</span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
              <ChevronRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials - Immersive Wall */}
      <section className="py-40 bg-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            badge={t('community_trust')}
            title={t('patient_reviews')}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Moussa Camara", text: t('review_1'), color: 'bg-blue-600' },
              { name: "Fatoumata Diallo", text: t('review_2'), color: 'bg-emerald-600' },
              { name: "Ousmane Keita", text: t('review_3'), color: 'bg-amber-600' }
            ].map((rev, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-12 bg-white rounded-[4rem] border border-slate-100 premium-shadow relative"
              >
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xl text-slate-900 font-medium italic mb-10 leading-relaxed">
                  "{rev.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${rev.color} rounded-2xl overflow-hidden p-0.5 border-2 border-white shadow-lg`}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.name}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-lg font-display font-black text-slate-800 tracking-tight leading-none mb-1">{rev.name}</h5>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Patient Certifié</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Content */}
      <footer className="bg-slate-900 rounded-t-[5rem] pt-32 pb-16 px-6 relative mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
            <div>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center p-3 shadow-2xl shadow-blue-600/20">
                  <Logo className="text-white w-full h-full" />
                </div>
                <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">{t('app_name')}</h3>
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400/60 mb-6">Presence Digitale</h4>
              <LandingSocialLinks />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div>
                <h4 className="text-white font-display font-bold text-lg mb-6 tracking-tight">Contact Conakry</h4>
                <div className="space-y-4">
                  <p className="flex items-center gap-3 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Kipe Centre-Emetteur, Conakry, Guinée
                  </p>
                  <p className="flex items-center gap-3 text-slate-400 text-sm">
                    <Mail className="w-4 h-4 text-blue-500" />
                    contact@kyam-medical.gn
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-display font-bold text-lg mb-6 tracking-tight">{t('opening_hours')}</h4>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm font-medium">Lun - Ven: 08:30 - 20:00</p>
                  <p className="text-slate-400 text-sm font-medium">Samedi: 09:00 - 18:00</p>
                  <p className="text-blue-400 text-sm font-bold mt-2 italic">Urgences 24/7</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{t('app_catchphrase')}</p>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest tracking-[0.3em]">© 2026 KYAM MEDICAL CENTER • DESIGNED BY ANTIGRAVITY</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple Mail icon since it wasn't in the import list
const Mail = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

export default LandingPage;
