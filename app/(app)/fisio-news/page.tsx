'use client';

import { Newspaper, ExternalLink, Calendar, MapPin, ChevronRight, Plus, RefreshCw } from 'lucide-react';
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  const supabase = createClient();

  async function loadNews() {
    setLoading(true);
    const { data } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(60);
    
    if (data) setNews(data);
    setLoading(false);
  }

  useEffect(() => {
    loadNews();
  }, []);

  const NewsCard = ({ item }: { item: NewsItem }) => {
    return (
      <article className="group flex flex-col h-full rounded-2xl p-6 transition-all duration-300 border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-brand-200 relative overflow-hidden">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              <MapPin className="h-3 w-3" />
              <span>{item.source.replace(/^BR \| /, '')}</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Calendar className="h-3 w-3" />
              {new Date(item.published_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 text-slate-900 group-hover:text-brand-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {item.summary}
          </p>
        </div>
        <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 text-xs font-black text-brand-600 hover:text-brand-700 transition-all group-hover:translate-x-1"
          >
            LER NOTÍCIA COMPLETA
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </article>
    );
  };

  if (loading && news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-slate-500 font-medium animate-pulse">Carregando as últimas da Fisioterapia...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black text-brand-900 md:text-3xl tracking-tight">
            <div className="h-8 w-1.5 bg-brand-500 rounded-full"></div>
            Fisio News
          </h1>
          <p className="text-sm text-slate-500 font-medium">As notícias mais relevantes da fisioterapia brasileira.</p>
        </div>
        <button 
          onClick={loadNews}
          className="btn-secondary shadow-sm"
          title="Atualizar lista"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">
            Destaques Recentes
          </h2>
        </div>
        
        {news.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold text-lg">Buscando novas atualizações...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, visibleCount).map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
            
            {visibleCount < news.length && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="w-full py-6 bg-white border-2 border-slate-100 rounded-3xl text-slate-900 font-black text-sm hover:border-brand-500 hover:text-brand-600 hover:shadow-xl transition-all flex items-center justify-center gap-3 group shadow-sm"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform text-brand-500" />
                VER MAIS NOTÍCIAS DA FISIOTERAPIA
              </button>
            )}
          </div>
        )}
      </section>

      <footer className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          Curadoria inteligente processada em tempo real por IA
        </p>
      </footer>
    </div>
  );
}
