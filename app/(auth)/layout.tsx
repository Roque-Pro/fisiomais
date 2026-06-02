import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-white to-rose-50">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-4 md:px-6 md:py-8">
        <Link href="/" className="flex items-center gap-3 md:gap-4 group">
          <div className="overflow-hidden rounded-xl md:rounded-2xl shadow-lg ring-2 md:ring-4 ring-white transition-transform group-hover:scale-105 active:scale-95">
            <img src="/logo.jpg" alt="Fisio Saúde" className="h-10 w-10 md:h-12 md:w-12 object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-2xl font-black tracking-tight text-slate-900 leading-none group-hover:text-sky-600 transition-colors">Fisio Saúde</span>
            <span className="mt-0.5 md:mt-1 block text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-sky-600">
              <span className="hidden xs:inline">Sistema</span> Fisio+
            </span>
          </div>
        </Link>
      </div>
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-8 fade-up">
        {children}
      </div>
    </main>
  );
}
