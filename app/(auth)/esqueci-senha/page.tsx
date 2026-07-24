'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';

export default function EsqueciSenhaPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <Mail className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="mb-1 text-2xl font-bold text-brand-900">E-mail enviado!</h1>
        <p className="mb-6 text-sm text-slate-600">
          Enviamos um link de redefinição para <strong className="text-slate-800">{email}</strong>. 
          Verifique sua caixa de entrada e spam.
        </p>
        <Link href="/login" className="text-sm font-medium text-brand-700 hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="mb-1 text-2xl font-bold text-brand-900">Esqueceu a senha?</h1>
      <p className="mb-6 text-sm text-slate-600">
        Digite seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">E-mail</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          <Mail className="h-4 w-4" />
          {loading ? 'Enviando…' : 'Enviar link de redefinição'}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-5 flex items-center justify-center gap-1 text-sm text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar para o login
      </Link>
    </div>
  );
}