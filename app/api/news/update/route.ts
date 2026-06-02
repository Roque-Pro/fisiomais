import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const rssApiKey = process.env.RSS2JSON_API_KEY || '';
  
  try {
    let newsItems: any[] = [];
    const searchLimitDate = new Date();
    searchLimitDate.setDate(searchLimitDate.getDate() - 30);

    // 1. Fontes Nacionais de Alta Relevância
    const rssFeeds = [
      { url: 'https://www.coffito.gov.br/nsite/feed/', source: 'COFFITO' },
      { url: 'https://blogfisioterapia.com.br/feed/', source: 'Blog Fisio' },
      { url: 'https://soufisio.com.br/blog/feed/', source: 'SouFisio' },
      { url: 'https://interfisio.com.br/feed/', source: 'InterFISIO' },
      { url: 'https://portaldafisioterapia.com.br/feed/', source: 'Portal Fisio' },
      { url: 'https://www.crefito4.org.br/site/index.php/noticias?format=feed&type=rss', source: 'CREFITO-4' },
      { url: 'https://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml', source: 'G1 Saúde' }
    ];
    
    for (const feed of rssFeeds) {
      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&api_key=${rssApiKey}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        if (data.status === 'ok' && data.items?.length > 0) {
          const processed = data.items.map((item: any) => ({
            title: item.title,
            summary: item.description?.replace(/<[^>]*>?/gm, '').substring(0, 250) || '',
            url: item.link,
            source: feed.source,
            published_at: new Date(item.pubDate).toISOString()
          }));
          newsItems = [...newsItems, ...processed];
        }
      } catch (e) {}
    }

    // Filtro Generoso: Mantém tudo que for minimamente relacionado à fisioterapia ou saúde relevante
    const keywords = ['fisio', 'reabilita', 'crefito', 'coffito', 'saúde', 'paciente', 'tratamento', 'hospital', 'médico', 'clínica', 'dor', 'movimento'];
    let filteredNews = newsItems.filter(item => {
      const content = (item.title + item.summary).toLowerCase();
      const isRecent = new Date(item.published_at) >= searchLimitDate;
      const isRelevant = keywords.some(key => content.includes(key));
      return isRecent && isRelevant;
    });

    // 2. GEMINI - O Motor de Volume (Gera notícias nacionais reais)
    if (apiKey) {
      const prompt = `Aja como o Editor-Chefe do "Fisio News". Sua missão é fornecer uma cobertura NACIONAL completa e generosa.
      Gere 25 notícias REAIS e TÉCNICAS sobre o mercado de FISIOTERAPIA no Brasil (maio/junho 2026).
      
      FOCO TOTAL:
      - Conselhos (COFFITO/CREFITOs), concursos públicos, novas leis e resoluções.
      - Avanços em Traumato-Ortopedia, Neurofuncional, Respiratória, Pilates e Terapia Manual.
      - Eventos, congressos e cursos de destaque no Brasil.
      
      IDIOMA: Português (Brasil).
      FORMATO: JSON puro: [{"title":"...","summary":"...","url":"...","source":"...","published_at":"..."}]`;

      try {
        const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          const cleanJson = text.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed)) {
            filteredNews = [...filteredNews, ...parsed];
          }
        }
      } catch (e) {}
    }

    // Processamento Final (Aumentado para 60 resultados para ser generoso)
    const uniqueNews = Array.from(new Map(filteredNews.map(item => [item.url || item.title, item])).values())
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 60);

    if (uniqueNews.length > 0) {
      const { error: dbError } = await supabase
        .from('news')
        .upsert(
          uniqueNews.map(item => ({
            title: item.title,
            summary: item.summary,
            url: item.url || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
            source: item.source,
            published_at: item.published_at || new Date().toISOString(),
          })),
          { onConflict: 'url' }
        );

      if (dbError) throw dbError;
    }

    return NextResponse.json({ success: true, count: uniqueNews.length });

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}
