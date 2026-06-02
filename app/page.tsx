import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users2, 
  Heart, 
  ClipboardCheck,
  ArrowRight,
  Newspaper,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient();
  const { data: recentNews } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-white to-rose-50">
      {/* Header / Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="Logo" className="h-14 w-14 rounded-2xl object-cover shadow-soft" />
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

      {/* Fisio News Hub - External Preview */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="mb-12 flex items-end justify-between border-b border-slate-200 pb-8">
          <div className="space-y-2">
            <h2 className="flex items-center gap-3 text-3xl font-black text-slate-900 tracking-tighter">
              <span className="bg-brand-500 p-2 rounded-xl text-white"><Newspaper className="h-6 w-6" /></span>
              FISIO NEWS <span className="text-brand-500 italic">HUB</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">Fique por dentro das atualizações do mundo da fisioterapia.</p>
          </div>
          <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
            Ver todas no sistema <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentNews && recentNews.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recentNews.map((item) => (
              <Link key={item.id} href="/login" className="group flex flex-col h-full rounded-3xl p-8 transition-all duration-300 border border-white bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-sm hover:shadow-2xl hover:bg-white hover:-translate-y-2 relative overflow-hidden">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                      <MapPin className="h-3 w-3" />
                      <span>{item.source}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.published_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl leading-tight text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-black text-brand-600 transition-all group-hover:translate-x-1">
                    ACESSAR CONTEÚDO COMPLETO
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-[2.5rem] border-4 border-dashed border-white">
            <p className="text-slate-400 font-bold">Sincronizando novas notícias...</p>
          </div>
        )}
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
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
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
