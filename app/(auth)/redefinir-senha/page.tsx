'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Usuário chegou via link de recuperação - sessão já está ativa
      }
    });
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    }
  }

  if (done) {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="mb-1 text-2xl font-bold text-brand-900">Senha redefinida!</h1>
        <p className="mb-6 text-sm text-slate-600">
          Sua senha foi alterada com sucesso. Redirecionando para o login…
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="mb-1 text-2xl font-bold text-brand-900">Redefinir senha</h1>
      <p className="mb-6 text-sm text-slate-600">Escolha uma nova senha para sua conta.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Nova senha</label>
          <div className="relative">
            <input
              className="input pr-10"
              type={showPassword ? 'text' : 'password'}
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
        <div>
          <label className="label">Confirmar senha</label>
          <input
            className="input"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          <KeyRound className="h-4 w-4" />
          {loading ? 'Redefinindo…' : 'Redefinir senha'}
        </button>
      </form>
    </div>
  );
}