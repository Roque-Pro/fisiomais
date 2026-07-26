'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, Sparkles, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PlanosPage() {
  const supabase = createClient();
  const router = useRouter();
  const [planStatus, setPlanStatus] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      supabase.from('profiles').select('plan_status, trial_started_at').eq('id', user.id).single()
        .then(({ data }) => {
          if (!data) return;
          setPlanStatus(data.plan_status);
          if (data.trial_started_at) {
            const end = new Date(data.trial_started_at);
            end.setDate(end.getDate() + 14);
            setTrialEndDate(end);
            const now = new Date();
            const diff = end.getTime() - now.getTime();
            setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
          }
          setLoading(false);
        });
    });
  }, [supabase, router]);

  async function handleAssinar() {
    const msg = encodeURIComponent('Olá! Quero assinar o Fisio+ (R$ 39,90/mês). Meu nome: ');
    window.open(`https://wa.me/5532991075164?text=${msg}`, '_blank');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const isSubscribed = planStatus === 'active';

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black text-brand-900 md:text-3xl tracking-tight">
            <div className="h-8 w-1.5 bg-emerald-500 rounded-full"></div>
            Planos e Assinatura
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Escolha o plano ideal para sua clínica.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-brand-600 hover:underline">
          Voltar
        </Link>
      </div>

      {planStatus === 'trial' && trialEndDate && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-brand-600" />
            <div>
              <p className="text-sm font-bold text-brand-900">
                Você ainda tem <span className="text-lg">{daysLeft}</span> dias grátis restantes.
              </p>
              <p className="text-xs text-brand-600">
                Trial expira em {trialEndDate.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {isSubscribed && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Você é assinante!</p>
              <p className="text-xs text-emerald-600">Sua assinatura está ativa. Aproveite todos os recursos.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card relative overflow-hidden border-2 border-brand-200">
          <div className="absolute right-0 top-0 rounded-bl-2xl bg-brand-600 px-4 py-1.5 text-xs font-bold text-white">
            Grátis
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-900">Trial</h2>
              <p className="mt-1 text-sm text-slate-500">Período de avaliação gratuita</p>
            </div>
            <div>
              <span className="text-4xl font-black text-brand-900">R$ 0</span>
              <span className="text-sm text-slate-500"> / 14 dias</span>
            </div>
            <ul className="space-y-3">
              {[
                'Até 10 pacientes',
                'Avaliações ilimitadas',
                'Evoluções ilimitadas',
                'Cartão digital em PDF',
                'Personalização de tema',
                'Fisio News',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-brand-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card relative overflow-hidden border-2 border-emerald-300 shadow-lg shadow-emerald-100">
          <div className="absolute right-0 top-0 rounded-bl-2xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white">
            Popular
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-900">Profissional</h2>
              <p className="mt-1 text-sm text-slate-500">Para uso profissional completo</p>
            </div>
            <div>
              <span className="text-4xl font-black text-brand-900">R$ 39,90</span>
              <span className="text-sm text-slate-500"> / mês</span>
            </div>
            <ul className="space-y-3">
              {[
                'Pacientes ilimitados',
                'Avaliações ilimitadas',
                'Evoluções ilimitadas',
                'Cartão digital em PDF',
                'Personalização de tema',
                'Fisio News',
                'Suporte prioritário',
                'Sem limites de uso',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-emerald-500" /> {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleAssinar}
              disabled={isSubscribed}
              className="btn-primary w-full py-3 text-base"
            >
              {isSubscribed ? (
                'Plano Ativo'
              ) : (
                <><Sparkles className="h-4 w-4" /> Assinar Agora</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-brand-900">Pagamento via WhatsApp</h3>
        <p className="mt-1 text-sm text-slate-500">
          Após clicar em "Assinar Agora", você será direcionado ao nosso WhatsApp para finalizar a contratação. Aceitamos PIX, cartão e boleto.
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="font-bold">📱 Atendimento via WhatsApp</span>
          <span>•</span>
          <span>PIX</span>
          <span>•</span>
          <span>Cartão</span>
          <span>•</span>
          <span>Boleto</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-brand-900">Dúvidas Frequentes</h3>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Posso cancelar a qualquer momento?</h4>
            <p className="mt-1 text-sm text-slate-500">Sim. Você pode cancelar sua assinatura quando quiser, sem multa.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">O que acontece quando o trial acaba?</h4>
            <p className="mt-1 text-sm text-slate-500">Seu acesso será suspenso até que você faça a assinatura. Seus dados ficam salvos.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Formas de pagamento?</h4>
            <p className="mt-1 text-sm text-slate-500">Aceitamos cartão de crédito, boleto bancário e PIX via Mercado Pago.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
