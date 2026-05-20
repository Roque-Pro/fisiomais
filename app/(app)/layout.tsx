'use client';

import { useState } from 'react';
import { MobileTabbar, MobileTopbar, Sidebar } from '@/components/sidebar';
import { TrialBanner } from '@/components/trial-banner';
import { ThemeApplier } from '@/components/theme-applier';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-50">
      <ThemeApplier />
      {/* Sidebar Desktop e Mobile */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar onOpenMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl space-y-5 fade-up">
            <TrialBanner />
            {children}
          </div>
        </main>
        <MobileTabbar />
      </div>

      {/* Overlay para fechar menu mobile ao clicar fora */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
