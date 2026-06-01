import { Newspaper, ExternalLink, Calendar, Globe, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
}

export const dynamic = 'force-dynamic';

export default async function FisioNewsPage() {
  const supabase = createClient();
  
  const { data: allNews } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(40);

  const brNews = allNews?.filter(n => n.source.startsWith('BR')) || [];
  const intlNews = allNews?.filter(n => !n.source.startsWith('BR')) || [];

  const NewsCard = ({ item }: { item: NewsItem }) => {
    const isIntl = !item.source.startsWith('BR');
    return (
      <article className={`group flex flex-col h-full bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:border-brand-300 hover:shadow-md relative overflow-hidden ${isIntl ? 'border-blue-100' : 'border-slate-100'}`}>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isIntl ? 'text-blue-600' : 'text-brand-600'}`}>
              {isIntl ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
              <span>{item.source}</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
              <Calendar className="h-3 w-3" />
              {new Date(item.published_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <h3 className="font-bold leading-tight group-hover:text-brand-600 transition-colors line-clamp-2 text-slate-900">
            {item.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {item.summary}
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors">
            {isIntl ? 'Read full article' : 'Ler notícia completa'}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-10 pb-12">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-900">
          <Newspaper className="h-6 w-6" /> Fisio News Global
        </h1>
        <p className="text-slate-600 text-sm">
          Curadoria técnica nacional e internacional para o fisioterapeuta moderno.
        </p>
      </header>

      {/* Seção Internacional */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-blue-900 border-l-4 border-blue-500 pl-3">
          <Globe className="h-5 w-5" /> International Highlights (English)
        </h2>
        {intlNews.length === 0 ? (
          <p className="text-slate-400 text-sm italic">Buscando atualizações globais...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {intlNews.map(item => <NewsCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      {/* Seção Nacional */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand-900 border-l-4 border-brand-500 pl-3">
          <MapPin className="h-5 w-5" /> Notícias do Brasil
        </h2>
        {brNews.length === 0 ? (
          <p className="text-slate-400 text-sm italic">Nenhuma notícia nacional encontrada.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brNews.map(item => <NewsCard key={item.id} item={item} />)}
          </div>
        )}
      </section>
    </div>
  );
}
