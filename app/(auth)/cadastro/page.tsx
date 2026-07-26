'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="card">Carregando…</div>}>
      <CadastroForm />
    </Suspense>
  );
}

function CadastroForm() {
  const router = useRouter();
  const search = useSearchParams();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [crefito, setCrefito] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = search.get('ref');
    if (!ref) return;
    supabase.from('profiles').select('id').eq('referral_code', ref).maybeSingle()
      .then(({ data }) => data?.id && setReferredBy(data.id));
  }, [search, supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          crefito,
          whatsapp,
          referred_by: referredBy ?? ''
        }
      }
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push('/dashboard');
  }

  return (
    <div className="card">
      <h1 className="mb-1 text-2xl font-bold text-brand-900">Crie sua conta</h1>
      <p className="mb-6 text-sm text-slate-600">14 dias grátis. Depois apenas <strong>R$ 39,90/mês</strong>. Sem cartão de crédito agora.</p>

      <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
        <strong>🕐 Teste grátis de 14 dias!</strong> Você terá acesso completo ao sistema. Quando o trial acabar, assine por apenas R$ 39,90/mês para continuar.
      </div>

      {referredBy && (
        <div className="mb-4 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">
          🎉 Você foi indicada(o) por um(a) colega. Aproveite seu período grátis!
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Nome completo</label>
          <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">CREFITO</label>
            <input className="input" required placeholder="123456-F" value={crefito}
              onChange={(e) => setCrefito(e.target.value)} />
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input className="input" required placeholder="(11) 99999-9999" value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">E-mail</label>
          <input className="input" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Senha</label>
          <div className="relative">
            <input 
              className="input pr-10" 
              type={showPassword ? "text" : "password"} 
              required 
              minLength={6} 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          <UserPlus className="h-4 w-4" />
          {loading ? 'Criando conta…' : 'Criar minha conta'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Já tem conta? <Link href="/login" className="font-medium text-brand-700 hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
