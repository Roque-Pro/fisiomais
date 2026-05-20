import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-brand-900">Fisio+</span>
        </Link>
      </div>
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-8 fade-up">
        {children}
      </div>
    </main>
  );
}
