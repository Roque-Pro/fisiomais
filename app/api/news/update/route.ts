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
  
  try {
    let newsItems: any[] = [];
    const searchLimitDate = new Date();
    searchLimitDate.setDate(searchLimitDate.getDate() - 30); // 30 dias para garantir volume internacional

    // 1. Fontes Nacionais e INTERNACIONAIS (Inglês)
    const rssFeeds = [
      // Nacionais
      { url: 'https://www.coffito.gov.br/nsite/feed/', lang: 'PT', country: 'BR' },
      { url: 'https://blogfisioterapia.com.br/feed/', lang: 'PT', country: 'BR' },
      { url: 'https://soufisio.com.br/blog/feed/', lang: 'PT', country: 'BR' },
      // Internacionais (EUA / Global)
      { url: 'https://www.jospt.org/action/showFeed?ui=0&mi=39p6v&ai=sy&jc=jospt&type=etoc&feed=rss', lang: 'EN', country: 'US' }, // JOSPT
      { url: 'https://www.physiospot.com/feed/', lang: 'EN', country: 'Global' }, // Physiospot
      { url: 'https://www.physicaltherapy.com/rss/news/', lang: 'EN', country: 'US' },
      { url: 'https://academic.oup.com/ptj/rss', lang: 'EN', country: 'US' }, // Physical Therapy Journal
    ];
    
    for (const feed of rssFeeds) {
      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&api_key=${process.env.RSS2JSON_API_KEY || ''}`;
        const res = await fetch(apiUrl);
        if (!res.ok) continue;
        
        const data = await res.json();
        if (data.status === 'ok' && data.items?.length > 0) {
          const processed = data.items.map((item: any) => ({
            title: item.title,
            summary: item.description?.replace(/<[^>]*>?/gm, '').substring(0, 250) || '',
            url: item.link,
            source: `${feed.country} | ${data.feed?.title || 'Fisio News'}`,
            published_at: new Date(item.pubDate).toISOString()
          }));
          newsItems = [...newsItems, ...processed];
        }
      } catch (e) {
        console.error(`Falha no feed: ${feed.url}`);
      }
    }

    // Filtro Profissional (Português e Inglês)
    const keywords = [
      'fisio', 'reabilita', 'coffito', 'crefito', 'ortopedia', 'traumato', 'manual', 'concurso',
      'physical therapy', 'physiotherapy', 'rehabilitation', 'orthopedic', 'manual therapy', 
      'clinical', 'evidence', 'patient', 'injury', 'exercise', 'sports medicine'
    ];
    
    let filteredNews = newsItems.filter(item => {
      const content = (item.title + item.summary).toLowerCase();
      const isRecent = new Date(item.published_at) >= searchLimitDate;
      const isProfessional = keywords.some(key => content.includes(key));
      return isRecent && isProfessional;
    });

    // 2. Gemini - O Editor Global (Gera mix de notícias PT e EN)
    if (apiKey) {
      const prompt = `Aja como Editor-Chefe do "Fisio News Global". 
      Gere 15 notícias REAIS e TÉCNICAS sobre Fisioterapia.
      - 7 notícias do Brasil (PT-BR) sobre COFFITO, concursos e técnicas.
      - 8 notícias INTERNACIONAIS (EUA, UK, Austrália) em INGLÊS sobre pesquisas científicas e novas diretrizes clínicas.
      
      Formato JSON: [{"title":"...","summary":"...","url":"...","source":"PAÍS | Fonte","published_at":"..."}]
      Exemplo internacional: {"title": "New guidelines for ACL recovery", "source": "USA | JOSPT", ...}
      Retorne APENAS o array JSON.`;

      try {
        const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleanJson = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (Array.isArray(parsed)) {
              filteredNews = [...filteredNews, ...parsed];
            }
          }
        }
      } catch (e) {}
    }

    // Processamento Final
    const uniqueNews = Array.from(new Map(filteredNews.map(item => [item.url || item.title, item])).values())
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 30);

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

  } catch (error) {
    return NextResponse.json({ error: 'Falha na atualização global.' }, { status: 500 });
  }
}
