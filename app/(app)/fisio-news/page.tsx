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
    .limit(15);

  const isRecent = (date: string) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    return diff < (1000 * 60 * 60 * 24 * 2); // 2 dias
  };

  return (
    <div className="space-y-6 pb-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-900">
        <Newspaper className="h-6 w-6" /> Fisio News
      </h1>

      <p className="text-slate-600 text-sm">
        As últimas notícias e avanços científicos da Fisioterapia, selecionados por nossa IA nos últimos dias.
      </p>

      {(!news || news.length === 0) ? (
        <div className="card text-center py-12">
          <p className="text-slate-500">Nenhuma notícia encontrada no momento.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item: NewsItem) => {
            const recent = isRecent(item.published_at);
            return (
              <article 
                key={item.id} 
                className={`group flex flex-col h-full bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
                  recent 
                    ? 'border-brand-200 ring-1 ring-brand-100/50 shadow-brand-50' 
                    : 'border-slate-100'
                } hover:border-brand-300 hover:shadow-md relative overflow-hidden`}
              >
                {recent && (
                  <div className="absolute -right-12 top-4 rotate-45 bg-brand-500 text-white text-[9px] font-black py-1 px-12 shadow-sm uppercase tracking-tighter">
                    Novidade
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-600 uppercase tracking-widest">
                      <span className={recent ? 'text-brand-700' : ''}>{item.source}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.published_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className={`font-bold leading-tight group-hover:text-brand-600 transition-colors line-clamp-2 ${
                    recent ? 'text-brand-950' : 'text-slate-900'
                  }`}>
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
            );
          })}
        </div>
      )}
    </div>
  );
  }
