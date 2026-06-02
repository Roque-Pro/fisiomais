'use client';

import { Newspaper, ExternalLink, Calendar, Globe, MapPin, ChevronRight, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
}

export default function FisioNewsPage() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleIntl, setVisibleIntl] = useState(3);
  const [visibleBr, setVisibleBr] = useState(3);

  const supabase = createClient();

  useEffect(() => {
    async function loadNews() {
      const { data } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(60);
      
      if (data) setAllNews(data);
      setLoading(false);
    }
    loadNews();
  }, []);

  const brNews = allNews.filter(n => n.source.startsWith('BR'));
  const intlNews = allNews.filter(n => !n.source.startsWith('BR'));

  const NewsCard = ({ item, variant }: { item: NewsItem, variant: 'intl' | 'br' }) => {
    const isIntl = variant === 'intl';
    return (
      <article className={`group flex flex-col h-full rounded-2xl p-5 transition-all duration-300 border shadow-sm hover:shadow-xl relative overflow-hidden ${
        isIntl 
          ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100 hover:border-blue-400' 
          : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:border-emerald-400'
      }`}>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
              isIntl ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isIntl ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
              <span>{item.source}</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Calendar className="h-3 w-3" />
              {new Date(item.published_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <h3 className={`font-bold leading-tight line-clamp-2 transition-colors ${
            isIntl ? 'text-blue-950 group-hover:text-blue-700' : 'text-emerald-950 group-hover:text-emerald-700'
          }`}>
            {item.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {item.summary}
          </p>
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 text-xs font-bold transition-transform group-hover:translate-x-1 ${
            isIntl ? 'text-blue-600' : 'text-emerald-600'
          }`}>
            {isIntl ? 'Full Access' : 'Acesso Completo'}
            <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-slate-500 font-medium animate-pulse">Sincronizando novidades globais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="relative p-8 rounded-3xl bg-slate-900 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Newspaper className="h-40 w-40 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="bg-brand-500 p-2 rounded-xl"><Newspaper className="h-7 w-7 text-white" /></span>
            FISIO NEWS <span className="text-brand-400 italic">HUB</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-md font-medium">
            Inteligência e curadoria técnica em tempo real. O conhecimento que move a sua carreira.
          </p>
        </div>
      </header>

      {/* Seção Internacional */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-blue-100 pb-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-black text-blue-900 uppercase tracking-tight">
              <Globe className="h-6 w-6 text-blue-600" /> Global Research
            </h2>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Scientific Evidence & Trends</p>
          </div>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            {intlNews.length} articles
          </span>
        </div>
        
        {intlNews.length === 0 ? (
          <div className="bg-blue-50/50 rounded-2xl p-10 text-center border border-dashed border-blue-200">
             <p className="text-blue-400 font-medium">No international news at the moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {intlNews.slice(0, visibleIntl).map(item => (
                <NewsCard key={item.id} item={item} variant="intl" />
              ))}
            </div>
            {visibleIntl < intlNews.length && (
              <button 
                onClick={() => setVisibleIntl(prev => prev + 6)}
                className="w-full py-4 bg-white border-2 border-blue-100 rounded-2xl text-blue-600 font-black text-sm hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                EXIBIR MAIS CONTEÚDO GLOBAL
              </button>
            )}
          </div>
        )}
      </section>

      {/* Seção Nacional */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-black text-emerald-900 uppercase tracking-tight">
              <MapPin className="h-6 w-6 text-emerald-600" /> Brasil Profissional
            </h2>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Conselhos, Carreira e Técnica</p>
          </div>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
            {brNews.length} artigos
          </span>
        </div>
        
        {brNews.length === 0 ? (
          <div className="bg-emerald-50/50 rounded-2xl p-10 text-center border border-dashed border-emerald-200">
             <p className="text-emerald-400 font-medium">Nenhuma notícia nacional encontrada.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brNews.slice(0, visibleBr).map(item => (
                <NewsCard key={item.id} item={item} variant="br" />
              ))}
            </div>
            {visibleBr < brNews.length && (
              <button 
                onClick={() => setVisibleBr(prev => prev + 6)}
                className="w-full py-4 bg-white border-2 border-emerald-100 rounded-2xl text-emerald-600 font-black text-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                VER MAIS NOTÍCIAS DO BRASIL
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
