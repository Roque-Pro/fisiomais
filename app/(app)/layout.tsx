'use client';

import { useEffect, useState } from 'react';
import { MobileTabbar, MobileTopbar, Sidebar } from '@/components/sidebar';
import { ThemeApplier } from '@/components/theme-applier';
import { TrialBanner } from '@/components/trial-banner';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, Sparkles, Ban, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [planStatus, setPlanStatus] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase.from('profiles').select('plan_status, role, blocked').eq('id', user.id).single()
        .then(({ data }) => {
          setPlanStatus(data?.plan_status ?? null);
          setIsAdmin(data?.role === 'admin');
          setIsBlocked(data?.blocked === true);
          setLoading(false);
        });
    });
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
      </div>
    );
  }

  const isExpired = planStatus === 'expired' || planStatus === 'canceled';
  const isTrial = planStatus === 'trial';
  const isActive = planStatus === 'active';

  if (isBlocked && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 p-6 text-center">
        <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-slate-900 shadow-soft text-white">
          <Ban className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-brand-900">Acesso Bloqueado</h1>
        <p className="mt-2 max-w-sm text-slate-600">
          Sua conta foi bloqueada pelo administrador. Entre em contato para mais informações.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="mailto:suporte@fisioapp.com"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-700 hover:shadow-lg"
          >
            <Mail className="h-4 w-4" /> Falar com Suporte
          </a>
          <button
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
            className="text-sm font-bold text-rose-600 hover:underline"
          >
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  if ((isExpired || (isTrial === false && isActive === false && planStatus !== null)) && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 p-6 text-center">
        <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-white shadow-soft text-rose-500">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-brand-900">Acesso Expirado</h1>
        <p className="mt-2 max-w-sm text-slate-600">
          Seu período de teste gratuito de 30 dias encerrou. Assine agora por apenas <strong>R$ 19,90/mês</strong> para continuar usando todos os recursos.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/planos"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-700 hover:shadow-lg"
          >
            <Sparkles className="h-4 w-4" /> Assinar Agora
          </Link>
          <button
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
            className="text-sm font-bold text-rose-600 hover:underline"
          >
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <ThemeApplier />
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar onOpenMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl space-y-5 fade-up">
            {isTrial && <TrialBanner />}
            {children}
          </div>
        </main>
        <MobileTabbar />
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
