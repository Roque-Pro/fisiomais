'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CompartilharPage() {
  const supabase = createClient();
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(0);
  const [targetPhone, setTargetPhone] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('referral_code').eq('id', user.id).single();
      if (data?.referral_code) setCode(data.referral_code);
      const { count: c } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('referred_by', user.id);
      setCount(c ?? 0);
    });
  }, [supabase]);

  const base = typeof window !== 'undefined' ? window.location.origin : 'https://fisioplus.app';
  const link = code ? `${base}/cadastro?ref=${code}` : '';
  const shareMsg = `Oi! Estou usando o Fisio+ para organizar minhas avaliações e evolução de pacientes. Vale super a pena, dá uma olhada: ${link}`;

  async function shareWhatsApp() {
    if (!targetPhone) {
      alert('Por favor, insira o número de WhatsApp do colega.');
      return;
    }
    const cleanPhone = targetPhone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(shareMsg)}`, '_blank');
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-900">
        <Share2 className="h-6 w-6" /> Indicar colegas
      </h1>

      <div className="card">
        <h3 className="text-base font-semibold text-brand-900">Indicação Direta por WhatsApp</h3>
        <p className="mt-1 text-sm text-slate-600">
          Insira o número do seu colega abaixo para enviar o convite diretamente para o WhatsApp dele.
        </p>
        
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="label">WhatsApp do colega</label>
            <input 
              className="input" 
              placeholder="DDD + Número (Ex: 11999999999)" 
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button onClick={shareWhatsApp} className="btn-primary w-full sm:w-auto">
              Enviar Convite agora
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700">Ou compartilhe seu link manual</h3>
        <div className="mt-3 flex gap-2">
          <input className="input text-xs" readOnly value={link} />
          <button onClick={copy} className="btn-secondary py-2 text-xs">
            {copied ? <><Check className="h-3 w-3" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar Link</>}
          </button>
        </div>
      </div>

      <div className="card border-2 border-emerald-100 bg-emerald-50/50 flex flex-col justify-center items-center text-center p-8 relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
          OFERTA ESPECIAL
        </div>
        <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
          <span className="text-3xl">🚀</span>
        </div>
        <h3 className="text-xl font-bold text-emerald-900 leading-tight">
          Indique 10 Colegas
        </h3>
        <p className="text-base text-emerald-700 mt-2 font-medium">e ganhe <span className="text-3xl block text-emerald-600 font-black mt-2">2 MESES GRÁTIS</span></p>
      </div>

      <div className="card">
        <div className="text-xs uppercase tracking-wide text-slate-500">Colegas que entraram pela sua rede</div>
        <div className="mt-1 text-4xl font-extrabold text-brand-900">{count}</div>
        <p className="mt-1 text-sm text-slate-600">
          Sua rede cresce e ajuda outros profissionais a serem mais produtivos com o Fisio+.
        </p>
      </div>
    </>
  );
}
