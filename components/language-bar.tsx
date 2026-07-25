'use client';

import { useLanguage, type Language } from '@/lib/i18n/language-context';

const flags: Record<Language, { label: string; flag: string }> = {
  'pt-BR': { label: 'PT', flag: '🇧🇷' },
  'en': { label: 'EN', flag: '🇺🇸' },
  'es': { label: 'ES', flag: '🇪🇸' },
};

export function LanguageBar() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-1 bg-slate-900/90 backdrop-blur-sm py-1">
      <span className="text-[10px] font-medium text-white/60 mr-1 uppercase tracking-wider">
        Idioma:
      </span>
      {(Object.keys(flags) as Language[]).map((lang) => {
        const isActive = language === lang;
        return (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`
              inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold
              transition-all duration-200
              ${isActive
                ? 'bg-white text-slate-900 shadow-sm scale-105'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span className="text-sm leading-none">{flags[lang].flag}</span>
            <span>{flags[lang].label}</span>
          </button>
        );
      })}
    </div>
  );
}
