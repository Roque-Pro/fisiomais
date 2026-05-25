import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  Gauge, 
  Users2, 
  Heart, 
  Zap,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-sky-50">
      {/* Header / Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-200">
            <Zap className="h-6 w-6 fill-white/20" />
          </div>
          <div>
            <span className="block text-xl font-bold tracking-tight text-slate-900 leading-none">FisioSystem</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Portal Interno</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm font-semibold text-slate-600 hover:text-indigo-600 md:block">
            Acessar conta
          </Link>
          <Link href="/login" className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95">
            Entrar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-20 text-center md:pt-20">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
          </span>
          Sistema Oficial de Gestão Clínica
        </div>
        
        <h1 className="text-balance text-4xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-7xl">
          Excelência em cada <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
            atendimento realizado.
          </span>
        </h1>
        
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
          Nossa plataforma foi desenvolvida para potencializar o cuidado. 
          Padronização, agilidade e inteligência de dados para que nossa equipe 
          foque no que realmente importa: a recuperação dos nossos pacientes.
        </p>
        
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login" className="group flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95">
            Iniciar Expediente
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/documentacao" className="rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/50">
            Manual de Uso
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { 
              Icon: Heart, 
              t: 'Atendimento Humanizado',
              d: 'Eliminamos a burocracia para que você dedique mais tempo à atenção direta ao paciente.',
              color: 'text-rose-500',
              bg: 'bg-rose-50'
            },
            { 
              Icon: Sparkles, 
              t: 'Padronização de Excelência',
              d: 'Protocolos integrados que garantem a mesma qualidade técnica em todas as unidades.',
              color: 'text-amber-500',
              bg: 'bg-amber-50'
            },
            { 
              Icon: Gauge, 
              t: 'Decisões Baseadas em Dados',
              d: 'Dashboards e indicadores clínicos que auxiliam no direcionamento terapêutico preciso.',
              color: 'text-emerald-500',
              bg: 'bg-emerald-50'
            },
            { 
              Icon: Users2, 
              t: 'Colaboração em Tempo Real',
              d: 'Compartilhamento seguro de informações entre toda a equipe multidisciplinar.',
              color: 'text-blue-500',
              bg: 'bg-blue-50'
            },
            { 
              Icon: ShieldCheck, 
              t: 'Segurança Institucional',
              d: 'Proteção total de dados sensíveis em conformidade com as normas de saúde vigentes.',
              color: 'text-indigo-500',
              bg: 'bg-indigo-50'
            },
            { 
              Icon: Zap, 
              t: 'Produtividade Ágil',
              d: 'Interface otimizada para registros rápidos, evoluções e geração instantânea de laudos.',
              color: 'text-violet-500',
              bg: 'bg-violet-50'
            }
          ].map(({ Icon, t, d, color, bg }) => (
            <div key={t} className="group relative overflow-hidden rounded-3xl border border-white bg-white/50 p-8 shadow-sm transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-100/50">
              <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t}</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200/60 bg-white/40 py-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} FisioSystem · Sistema de Gestão Interna · Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
