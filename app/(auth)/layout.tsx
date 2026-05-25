import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-sky-50">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-200 transition-transform hover:scale-105 active:scale-95">
            <Zap className="h-6 w-6 fill-white/20" />
          </div>
          <div>
            <span className="block text-xl font-bold tracking-tight text-slate-900 leading-none transition-colors hover:text-indigo-600">FisioSystem</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Portal Interno</span>
          </div>
        </Link>
      </div>
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-8 fade-up">
        {children}
      </div>
    </main>
  );
}
