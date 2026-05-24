'use client';

import { useEffect, useState } from 'react';
import { MobileTabbar, MobileTopbar, Sidebar } from '@/components/sidebar';
import { ThemeApplier } from '@/components/theme-applier';
import { createClient } from '@/lib/supabase/client';
import { Clock, ShieldAlert } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('plan_status, role').eq('id', user.id).single()
        .then(({ data }) => {
          setAuthorized(data?.plan_status === 'active');
          setIsAdmin(data?.role === 'admin');
        });
    });
  }, [supabase]);

  if (authorized === false && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 p-6 text-center">
        <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-white shadow-soft text-brand-600">
          <Clock className="h-10 w-10 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-brand-900">Aguardando Autorização</h1>
        <p className="mt-2 max-w-sm text-slate-600">
          Seu cadastro foi realizado com sucesso! Um administrador irá revisar seu acesso em breve.
        </p>
        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
          className="mt-8 text-sm font-bold text-rose-600 hover:underline"
        >
          Sair da conta
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <ThemeApplier />
      {/* Sidebar Desktop e Mobile */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar onOpenMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl space-y-5 fade-up">
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
