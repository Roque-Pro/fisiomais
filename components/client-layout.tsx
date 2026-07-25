'use client';

import { LanguageProvider } from '@/lib/i18n/language-context';
import { LanguageBar } from '@/components/language-bar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LanguageBar />
      <div className="pt-7">
        {children}
      </div>
    </LanguageProvider>
  );
}
