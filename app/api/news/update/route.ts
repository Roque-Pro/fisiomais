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
    searchLimitDate.setDate(searchLimitDate.getDate() - 7); // Aumentado para 7 dias para garantir volume

    // 1. Múltiplas Fontes RSS (Forma simplificada e direta)
    const rssFeeds = [
      // Google News - Fisioterapia Geral
      `https://news.google.com/rss/search?q=${encodeURIComponent('fisioterapia OR "reabilitação física"')} when:7d&hl=pt-BR&gl=BR&ceid=BR:pt-419`,
      // G1 Saúde
      `https://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml`,
      // Google News - Conselhos e Órgãos
      `https://news.google.com/rss/search?q=${encodeURIComponent('COFFITO OR CREFITO')} when:7d&hl=pt-BR&gl=BR&ceid=BR:pt-419`
    ];
    
    for (const feedUrl of rssFeeds) {
      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status === 'ok' && data.items?.length > 0) {
          const processed = data.items.map((item: any) => ({
            title: item.title,
            summary: item.content?.replace(/<[^>]*>?/gm, '').substring(0, 220) + '...',
            url: item.link,
            source: item.author || data.feed?.title || 'Notícias Fisio',
            published_at: new Date(item.pubDate).toISOString()
          }));
          newsItems = [...newsItems, ...processed];
        }
      } catch (e) {
        console.error(`Erro no feed ${feedUrl}:`, e);
      }
    }

    // Filtro de relevância relaxado para garantir que apareçam notícias
    newsItems = newsItems.filter((item: any) => {
      const content = (item.title + item.summary).toLowerCase();
      const isRecent = new Date(item.published_at) >= searchLimitDate;
      // Aceita qualquer coisa que lembre saúde/fisio se vier de fontes confiáveis
      const isRelevant = content.includes('fisio') || 
                        content.includes('reabilita') || 
                        content.includes('saúde') || 
                        content.includes('paciente') ||
                        content.includes('médic');
      return isRecent && isRelevant;
    });

    // 2. Gemini - Curadoria Técnica
    if (apiKey) {
      const prompt = `Aja como o Editor-Chefe do "Fisio News". Sua missão é fornecer 10-15 notícias recentes e EXCLUSIVAMENTE sobre Fisioterapia no Brasil.
      Foque em: COFFITO, CREFITO, concursos, pesquisas e novas técnicas.
      Retorne APENAS um array JSON: [{"title":"...","summary":"...","url":"...","source":"...","published_at":"..."}]`;

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
              const validatedAi = parsed
                .map(it => ({
                  ...it,
                  published_at: it.published_at || new Date().toISOString()
                }))
                .filter(it => new Date(it.published_at) >= searchLimitDate);
              
              newsItems = [...newsItems, ...validatedAi];
            }
          }
        }
      } catch (aiErr) {
        console.error('Erro Gemini:', aiErr);
      }
    }

    // Processamento Final (Remover duplicatas por URL)
    const uniqueNews = Array.from(new Map(newsItems.map(item => [item.url, item])).values())
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 30); // Aumentado o limite para 30

    if (uniqueNews.length > 0) {
      const { error: dbError } = await supabase
        .from('news')
        .upsert(
          uniqueNews.map(item => ({
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source,
            published_at: item.published_at,
          })),
          { onConflict: 'url' }
        );

      if (dbError) throw dbError;
    }

    return NextResponse.json({ success: true, count: uniqueNews.length });

  } catch (error) {
    console.error('Erro Crítico:', error);
    return NextResponse.json({ error: 'Falha na atualização.' }, { status: 500 });
  }
}
