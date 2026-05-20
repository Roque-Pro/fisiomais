import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
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
  
  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6 pb-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-900">
        <Newspaper className="h-6 w-6" /> Fisio News
      </h1>

      <p className="text-slate-600 text-sm">
        As últimas notícias e avanços científicos da Fisioterapia, selecionados por nossa IA nos últimos 3 dias.
      </p>

      {(!news || news.length === 0) ? (
        <div className="card text-center py-12">
          <p className="text-slate-500">Nenhuma notícia encontrada no momento.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item: NewsItem) => (
            <article 
              key={item.id} 
              className="group flex flex-col h-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-brand-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-brand-600 uppercase tracking-widest">
                    <span>{item.source}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.published_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Ler notícia completa 
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
