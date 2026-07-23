'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Clock, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function TrialBanner() {
  const [planStatus, setPlanStatus] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('plan_status, trial_started_at').eq('id', user.id).single()
        .then(({ data }) => {
          if (!data) return;
          setPlanStatus(data.plan_status);
          if (data.trial_started_at) {
            const end = new Date(data.trial_started_at);
            end.setDate(end.getDate() + 30);
            setTrialEndDate(end);

            const now = new Date();
            const diff = end.getTime() - now.getTime();
            const remaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
            setDaysLeft(remaining);
          }
        });
    });
  }, [supabase]);

  if (!planStatus || planStatus === 'active') return null;

  if (planStatus === 'expired' || planStatus === 'canceled') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-rose-900">Acesso Expirado</h3>
            <p className="mt-1 text-sm text-rose-700">
              Seu período de teste gratuito encerrou. Assine agora por apenas <strong>R$ 39,90/mês</strong> e continue usando todos os recursos.
            </p>
            <Link
              href="/planos"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-rose-700 hover:shadow-lg"
            >
              <Sparkles className="h-4 w-4" /> Assinar Agora
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (daysLeft <= 0) return null;

  const isUrgent = daysLeft <= 5;

  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${isUrgent ? 'border-amber-200 bg-amber-50' : 'border-brand-200 bg-brand-50'}`}>
      <div className="flex items-start gap-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isUrgent ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>
          <Clock className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-bold ${isUrgent ? 'text-amber-900' : 'text-brand-900'}`}>
            Período de Teste Gratuito
          </h3>
          <p className={`mt-1 text-sm ${isUrgent ? 'text-amber-700' : 'text-brand-700'}`}>
            Você tem <strong className="text-lg">{daysLeft}</strong> {daysLeft === 1 ? 'dia' : 'dias'} restantes do seu trial de 30 dias.
            {isUrgent && ' Após o término, assine por apenas R$ 39,90/mês para continuar.'}
          </p>
          {trialEndDate && (
            <p className={`mt-0.5 text-xs ${isUrgent ? 'text-amber-500' : 'text-brand-500'}`}>
              Expira em {trialEndDate.toLocaleDateString('pt-BR')}
            </p>
          )}
          <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white">
            <div
              className={`h-full rounded-full transition-all ${isUrgent ? 'bg-amber-500' : 'bg-brand-500'}`}
              style={{ width: `${Math.max(0, (daysLeft / 30) * 100)}%` }}
            />
          </div>
        </div>
        <Link
          href="/planos"
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${isUrgent ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
        >
          Ver Planos
        </Link>
      </div>
    </div>
  );
}
