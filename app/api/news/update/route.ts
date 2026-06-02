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

    // 1. Fontes Internacionais e Nacionais
    const rssFeeds = [
      { url: 'https://www.coffito.gov.br/nsite/feed/', country: 'BR' },
      { url: 'https://blogfisioterapia.com.br/feed/', country: 'BR' },
      { url: 'https://www.jospt.org/action/showFeed?ui=0&mi=39p6v&ai=sy&jc=jospt&type=etoc&feed=rss', country: 'US' },
      { url: 'https://www.physiospot.com/feed/', country: 'Global' },
      { url: 'https://academic.oup.com/ptj/rss', country: 'US' },
      { url: 'https://www.crefito4.org.br/site/index.php/noticias?format=feed&type=rss', country: 'BR' }
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
            // IMPORTANTE: Manter o padrão 'PAÍS | Fonte' para o frontend filtrar corretamente
            source: `${feed.country} | ${data.feed?.title || 'Fisio News'}`,
            published_at: new Date(item.pubDate).toISOString()
          }));
          newsItems = [...newsItems, ...processed];
        }
      } catch (e) {
        console.error(`Falha no feed: ${feed.url}`, e);
      }
    }

    // Filtro profissional (Removendo 'saúde' e 'health' para ser mais específico)
    const keywords = ['fisio', 'reabilita', 'physical', 'therapy', 'rehab', 'clinical', 'patient', 'injury', 'crefito', 'coffito'];
    let filteredNews = newsItems.filter(item => {
      const content = (item.title + item.summary).toLowerCase();
      return keywords.some(key => content.includes(key));
    });

    // 2. GEMINI - O Garantidor Absoluto (REFINADO PARA IDIOMA)
    if (apiKey) {
      const prompt = `Aja como o Editor-Chefe do "Fisio News". 
      Você DEVE retornar um array JSON com 20 notícias REAIS e TÉCNICAS de Fisioterapia (maio/junho 2026).
      
      REGRAS DE IDIOMA E FONTE:
      - 10 notícias do BRASIL: O título e o resumo DEVEM estar em PORTUGUÊS. A fonte deve começar com "BR | ".
      - 10 notícias INTERNACIONAIS: O título e o resumo DEVEM estar em INGLÊS. A fonte deve começar com "US | " ou "GLOBAL | ".
      
      IMPORTANTE: Não traduza as notícias internacionais. Mantenha-as em Inglês técnico.
      
      Retorne APENAS o JSON puro no formato:
      [{"title":"...","summary":"...","url":"...","source":"PAÍS | Fonte","published_at":"..."}]`;

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
            // Garantir que a fonte do Gemini siga o padrão para o filtro do frontend
            const validatedAi = parsed.map(item => ({
              ...item,
              published_at: item.published_at || new Date().toISOString()
            }));
            filteredNews = [...filteredNews, ...validatedAi];
          }
        }
      } catch (e) {
        console.error('Erro Gemini:', e);
      }
    }

    // Processamento Final
    const uniqueNews = Array.from(new Map(filteredNews.map(item => [item.url || item.title, item])).values())
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 50);

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
    console.error('ERRO CRÍTICO NA ROTA:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
