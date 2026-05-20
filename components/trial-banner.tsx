'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function TrialBanner() {
  const supabase = createClient();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [planStatus, setPlanStatus] = useState<string>('trial');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('trial_started_at, plan_status').eq('id', user.id).single()
        .then(({ data }) => {
          if (!data) return;
          setPlanStatus(data.plan_status);
          const start = new Date(data.trial_started_at).getTime();
          const days = 30 - Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
          setDaysLeft(Math.max(0, days));
        });
    });
  }, [supabase]);

  if (daysLeft === null || planStatus === 'active') return null;

  const expired = daysLeft <= 0;

  if (expired) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-2">
            <Clock className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Período de teste encerrado</h2>
            <p className="text-slate-500 px-4">
              Seu período de 30 dias de uso gratuito chegou ao fim. Para continuar evoluindo seu consultório, assine agora.
            </p>
          </div>
          
          <div className="rounded-2xl bg-brand-50/50 p-6 border border-brand-100/50">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Assinatura Mensal</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-brand-900 tracking-tight">R$ 0,00</span>
              <span className="text-slate-400 font-medium">/mês</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                Entre em contato para liberação:
                <br />
                <strong className="text-brand-900 block mt-1 text-base">fisiomais.jf@gmail.com</strong>
              </p>
            </div>
            
            <a 
              href="mailto:fisiomais.jf@gmail.com?subject=Renovação de Assinatura"
              className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand-200 active:scale-[0.98]"
            >
              Solicitar Liberação
            </a>
            
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
              Sua conta será liberada em instantes após o contato
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs font-medium shadow-soft">
      <div className="flex items-center gap-2 text-slate-700">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Clock className="h-3.5 w-3.5" />
        </div>
        <span>Restam <b>{daysLeft} dias</b> do seu teste grátis - <span className="font-bold text-brand-900">Após, R$ 0,00.</span></span>
      </div>
      <div className="text-slate-500 font-normal">
        <span className="hidden sm:inline">·</span> <strong className="text-slate-600">fisiomais.jf@gmail.com</strong> - solicite a continuação sem interrupções.
      </div>
    </div>
  );
}
