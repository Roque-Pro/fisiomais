'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push('/dashboard');
  }

  return (
    <div className="card">
      <h1 className="mb-1 text-2xl font-bold text-brand-900">Bem-vinda(o) de volta</h1>
      <p className="mb-6 text-sm text-slate-600">Acesse sua área de trabalho.</p>

      <form onSubmit={onSubmit} className="space-y-4">
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
          <LogIn className="h-4 w-4" />
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Não tem conta? <Link href="/cadastro" className="font-medium text-brand-700 hover:underline">Cadastre-se</Link>
      </p>
    </div>
  );
}
