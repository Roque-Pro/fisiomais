import Link from 'next/link';
import { Activity, ClipboardList, FileText, Palette, Share2, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white shadow-soft">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">Fisio+</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">Entrar</Link>
          <Link href="/cadastro" className="btn-primary">Começar agora</Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 text-center fade-up">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Seus atendimentos e pacientes <br />
          <span className="bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
            na palma da sua mão.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          O acompanhamento completo que você precisa, onde estiver. 
          Avaliações, evolução e relatórios profissionais com a simplicidade que sua rotina exige.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/cadastro" className="btn-primary text-base px-8">
            Começar agora
          </Link>
          <Link href="/login" className="btn-secondary text-base px-8">
            Acessar conta
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { Icon: ClipboardList, t: 'Avaliações completas',
              d: 'Formulários específicos para diversas especialidades, tudo otimizado para celular.' },
            { Icon: Users, t: 'Acompanhamento ágil',
              d: 'Histórico completo do paciente e registro de evolução em poucos cliques.' },
            { Icon: FileText, t: 'Relatórios Profissionais',
              d: 'Gere PDFs de avaliações e evoluções e envie direto para o paciente.' },
            { Icon: Palette, t: 'Sua marca, seu estilo',
              d: 'Personalize a identidade visual do seu atendimento de forma simples e rápida.' },
            { Icon: Share2, t: 'Compartilhamento fácil',
              d: 'Envie documentos e informações importantes via WhatsApp em segundos.' },
            { Icon: Activity, t: 'Sempre com você',
              d: 'Acesse de qualquer dispositivo. Seus dados seguros e sincronizados.' }
          ].map(({ Icon, t, d }) => (
            <div key={t} className="card fade-up">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white/60 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Fisio+ · Acompanhamento inteligente para fisioterapeutas.
      </footer>
    </main>
  );
}
