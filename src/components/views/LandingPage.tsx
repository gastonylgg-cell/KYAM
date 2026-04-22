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
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../Logo';

import { MessageSquare, Camera, Music2, Play, Sun, X } from 'lucide-react';

const LandingSocialLinks = ({ vertical = false }: { vertical?: boolean }) => {
  const links = [
    { icon: MessageSquare, color: 'hover:text-blue-600', url: '#' },
    { icon: Camera, color: 'hover:text-pink-500', url: '#' },
    { icon: Music2, color: 'hover:text-black', url: '#' },
    { icon: Play, color: 'hover:text-red-600', url: '#' },
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

const WeatherWidget = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-amber-900 shadow-lg shadow-amber-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-blue-200 leading-none mb-1">Conakry</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-white">31°C</span>
              <span className="text-[9px] font-bold text-white/60 uppercase">Ensoleillé</span>
            </div>
          </div>
        </div>
      );
};

// LanguageSwitcher would usually be shared, but I'll define a simple one here for Landing or import it.
// In the original App.tsx, LanguageSwitcher was a separate component. I should move it to a shared place too.
// For now, I'll keep the landing page self-contained or import what's needed.

interface LandingPageProps {
  onEnterPortal: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

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
            <WeatherWidget />
            <button onClick={onEnterPortal} className="text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">{t('patients')}</button>
          </div>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold transition-all h-11"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase tracking-tighter">{i18n.language === 'fr' ? 'English' : 'Français'}</span>
          </button>
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
          <LandingSocialLinks vertical />
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

          <div className="mt-20 text-center">
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
            <LandingSocialLinks />
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

export default LandingPage;
