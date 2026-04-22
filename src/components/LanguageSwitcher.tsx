import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
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

export default LanguageSwitcher;
