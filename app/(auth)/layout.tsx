import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-white to-rose-50">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-8">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="overflow-hidden rounded-2xl shadow-lg ring-4 ring-white transition-transform group-hover:scale-105 active:scale-95">
            <img src="/logo.jpg" alt="Fisio Saúde" className="h-12 w-12 object-cover" />
          </div>
          <div>
            <span className="block text-2xl font-black tracking-tight text-slate-900 leading-none group-hover:text-sky-600 transition-colors">Fisio Saúde</span>
            <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Sistema Fisio+</span>
          </div>
        </Link>
      </div>
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-8 fade-up">
        {children}
      </div>
    </main>
  );
}
