import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users2, 
  Heart, 
  ClipboardCheck,
  ArrowRight,
  Smile
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-white to-rose-50">
      {/* Header / Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="overflow-hidden rounded-2xl shadow-lg ring-4 ring-white transition-transform hover:scale-105">
            <img src="/logo.jpg" alt="Fisio Saúde" className="h-12 w-12 object-cover" />
          </div>
          <div>
            <span className="block text-2xl font-black tracking-tight text-slate-900 leading-none">Fisio Saúde</span>
            <span className="mt-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
              <Zap className="h-3 w-3 fill-sky-600" /> Sistema Fisio+
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
            Acessar Sistema <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full bg-rose-100 px-5 py-2 text-sm font-bold text-rose-600 ring-4 ring-rose-50">
          <Smile className="h-4 w-4" /> Bem-vindo ao nosso espaço digital
        </div>
        
        <h1 className="text-balance text-5xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-7xl">
          Tecnologia para um <br />
          <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 bg-clip-text text-transparent">
            atendimento mais humano.
          </span>
        </h1>
        
        <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl font-medium">
          Este é o <span className="text-slate-900 font-bold underline decoration-sky-400 decoration-4">Fisio+</span>, o sistema exclusivo da 
          <span className="text-slate-900 font-bold"> Fisio Saúde</span>. Criamos esta plataforma para que nossa equipe tenha as melhores ferramentas 
          e nossos pacientes recebam um cuidado ágil, moderno e totalmente personalizado.
        </p>
        
        <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
          <Link href="/login" className="group flex items-center gap-3 rounded-[2rem] bg-gradient-to-r from-sky-600 to-indigo-600 px-10 py-5 text-xl font-black text-white shadow-2xl shadow-sky-200 transition-all hover:scale-105 active:scale-95">
            Entrar no Sistema
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { 
              Icon: Heart, 
              t: 'Foco no Paciente',
              d: 'O sistema organiza os dados para que o fisioterapeuta possa focar 100% na sua recuperação e bem-estar.',
              color: 'text-rose-500',
              bg: 'bg-rose-100/50'
            },
            { 
              Icon: ClipboardCheck, 
              t: 'Evolução Transparente',
              d: 'Acompanhamos cada pequeno progresso com registros precisos, garantindo a melhor conduta clínica.',
              color: 'text-sky-500', 
              bg: 'bg-sky-100/50'
            },
            { 
              Icon: Sparkles, 
              t: 'Excelência Fisio Saúde',
              d: 'Padronizamos nossa qualidade de atendimento através de ferramentas digitais de última geração.',
              color: 'text-amber-500',
              bg: 'bg-amber-100/50'
            },
            { 
              Icon: Users2, 
              t: 'Equipe Conectada',
              d: 'Informações integradas que permitem uma visão completa do seu histórico em nossa clínica.',
              color: 'text-indigo-500',
              bg: 'bg-indigo-100/50'
            },
            { 
              Icon: ShieldCheck, 
              t: 'Dados Protegidos',
              d: 'Sua privacidade é nossa prioridade. Todos os registros clínicos são guardados com segurança máxima.',
              color: 'text-emerald-500',
              bg: 'bg-emerald-100/50'
            },
            { 
              Icon: Zap, 
              t: 'Agilidade que Liberta',
              d: 'Menos tempo preenchendo papéis, mais tempo realizando o que amamos: cuidar de você.',
              color: 'text-violet-500',
              bg: 'bg-violet-100/50'
            }
          ].map(({ Icon, t, d, color, bg }) => (
            <div key={t} className="group relative rounded-[2.5rem] border-4 border-white bg-white/40 p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-3xl ${bg} ${color} transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{t}</h3>
              <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t-4 border-white bg-white/30 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-xl grayscale opacity-50" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Fisio Saúde · Sistema Interno Fisio+
            </p>
          </div>
          <p className="text-sm font-bold text-slate-400">
            © {new Date().getFullYear()} · Orgulhosamente servindo nossos pacientes.
          </p>
        </div>
      </footer>
    </main>
  );
}
