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
    <main className="min-h-screen bg-white">
      {/* Elementos Decorativos de Fundo Global */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-rose-100/40 blur-[120px] rounded-full" />
      </div>

      {/* Header / Nav - Slim and Elegant */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.jpg" alt="Logo" className="h-9 w-9 md:h-10 md:w-10 rounded-lg object-cover shadow-sm transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Fisio+</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="relative group overflow-hidden rounded-full p-[1px] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-sky-100">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 animate-gradient-x"></div>
              <div className="relative flex items-center gap-2 rounded-full bg-white px-5 py-1.5 md:px-6 md:py-2 text-sm font-bold text-slate-900 transition-colors group-hover:bg-transparent group-hover:text-white">
                Acessar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Integrated and Elegant */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-bold uppercase tracking-wider animate-fade-in">
                <Zap className="h-3 w-3 fill-sky-600" /> Sistema Exclusivo Fisio Saúde
              </div>
              
              <h1 className="text-balance text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
                Tecnologia para um <br />
                <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-rose-600 bg-clip-text text-transparent">
                  atendimento humano.
                </span>
              </h1>
              
              <p className="max-w-xl text-lg leading-relaxed text-slate-600 font-medium">
                O <span className="text-slate-900 font-bold underline decoration-sky-400 decoration-4">Fisio+</span> foi criado para transformar a gestão clínica em uma experiência ágil, moderna e totalmente focada no que importa: <span className="text-slate-900 font-bold">o seu paciente</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                <Link href="/cadastro" className="group flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 active:scale-95">
                  Começar agora grátis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="relative order-first lg:order-last">
              {/* Efeito de Vidro e Moldura */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" 
                    alt="Fisioterapia Moderna" 
                    className="w-full h-full object-cover aspect-[4/3] sm:aspect-video lg:aspect-[4/5]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 via-transparent to-transparent"></div>
                  
                  {/* Floating Info Card */}
                  <div className="absolute bottom-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-[200px] animate-float">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Tempo Real</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">Evolução clínica monitorada instantaneamente.</p>
                  </div>
                </div>

                {/* Decorative Shapes */}
                <div className="absolute -top-6 -right-6 h-24 w-24 bg-rose-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-sky-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
              </div>
            </div>
          </div>
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
