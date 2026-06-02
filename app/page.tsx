'use client';

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
  ChevronRight,
  Share2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  published_at: string;
}

export default function Home() {
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('news')
        .select('id, title, summary, source, published_at')
        .order('published_at', { ascending: false })
        .limit(3);
      if (data) setRecentNews(data);
    }
    load();
  }, []);

  const handleShare = (title: string) => {
    const text = encodeURIComponent(`Acabei de ver essa notícia no Fisio+: ${title}\n\nConfira no sistema: `);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://wa.me/?text=${text}${url}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-white to-rose-50">
      {/* Header / Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 md:py-8">
        <div className="flex items-center gap-3 md:gap-4">
          <img src="/logo.jpg" alt="Logo" className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl object-cover shadow-soft" />
          <div className="flex flex-col">
            <span className="text-lg md:text-2xl font-black tracking-tight text-slate-900 leading-none">Fisio Saúde</span>
            <span className="mt-0.5 md:mt-1 flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-sky-600">
              <Zap className="h-2.5 w-2.5 md:h-3 md:w-3 fill-sky-600" /> <span className="hidden xs:inline">Sistema</span> Fisio+
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/login" className="flex items-center gap-2 rounded-xl md:rounded-2xl bg-slate-900 px-4 py-2 md:px-7 md:py-3 text-xs md:text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
            <span className="hidden xs:inline">Acessar Sistema</span>
            <span className="xs:hidden">Entrar</span>
            <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-16 md:px-6 md:pt-16 md:pb-24 text-center">
        <h1 className="text-balance text-3xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-7xl">
          Tecnologia para um <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 bg-clip-text text-transparent">
            atendimento mais humano.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 md:mt-10 max-w-2xl text-base leading-relaxed text-slate-600 md:text-xl font-medium">
          Este é o <span className="text-slate-900 font-bold underline decoration-sky-400 decoration-4">Fisio+</span>, o sistema exclusivo da 
          <span className="text-slate-900 font-bold"> Fisio Saúde</span>. Criamos esta plataforma para que nossa equipe tenha as melhores ferramentas 
          e nossos pacientes recebam um cuidado ágil, moderno e totalmente personalizado.
        </p>
        
        <div className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-5">
          <Link href="/cadastro" className="group flex items-center gap-2 md:gap-3 rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 md:px-10 md:py-5 text-lg md:text-xl font-black text-white shadow-2xl shadow-sky-200 transition-all hover:scale-105 active:scale-95">
            Criar minha conta grátis
            <ArrowRight className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Fisio News Hub - External Preview */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-20 md:pb-32">
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 md:pb-8 gap-4">
          <div className="space-y-2">
            <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
              <span className="bg-brand-500 p-2 rounded-xl text-white"><Newspaper className="h-5 w-5 md:h-6 md:w-6" /></span>
              FISIO NEWS <span className="text-brand-500 italic">HUB</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-md">Fique por dentro das atualizações do mundo da fisioterapia.</p>
          </div>
          <Link href="/cadastro" className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
            Ver todas no sistema <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentNews.length > 0 ? (
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recentNews.map((item) => (
              <div key={item.id} className="group flex flex-col h-full rounded-3xl p-6 md:p-8 transition-all duration-300 border border-white bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-sm hover:shadow-2xl hover:bg-white hover:-translate-y-2 relative overflow-hidden">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-tighter px-2 md:px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 truncate">
                      <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                      <span className="truncate">{item.source}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                      <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      {new Date(item.published_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Link href="/cadastro" className="block group/title">
                    <h3 className="font-bold text-lg md:text-xl leading-tight text-slate-900 group-hover/title:text-brand-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs md:text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex items-center justify-between">
                  <Link href="/cadastro" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black text-brand-600 transition-all hover:translate-x-1">
                    LER NO SISTEMA
                    <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Link>
                  <button 
                    onClick={() => handleShare(item.title)}
                    className="p-2 bg-slate-100 hover:bg-brand-500 hover:text-white rounded-full transition-all"
                    title="Compartilhar"
                  >
                    <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-20 bg-white/40 rounded-[2rem] md:rounded-[2.5rem] border-4 border-dashed border-white px-6">
            <p className="text-slate-400 font-bold">As últimas novidades estão sendo preparadas...</p>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-20 md:pb-32">
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
            <div key={t} className="group relative rounded-[2rem] md:rounded-[2.5rem] border-4 border-white bg-white/40 p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className={`mb-6 md:mb-8 inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl md:rounded-3xl ${bg} ${color} transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                <Icon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{t}</h3>
              <p className="mt-3 md:mt-4 text-sm md:text-base font-medium leading-relaxed text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t-4 border-white bg-white/30 py-8 md:py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 rounded-xl object-cover" />
            <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              Fisio Saúde <span className="mx-1 hidden md:inline">·</span> <br className="md:hidden" /> 
              Sistema Interno Fisio+
            </p>
          </div>
          <p className="text-xs md:text-sm font-bold text-slate-400">
            © {new Date().getFullYear()} · Orgulhosamente servindo nossos pacientes.
          </p>
        </div>
      </footer>
    </main>
  );
}
