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
    searchLimitDate.setDate(searchLimitDate.getDate() - 15); // Aumentado para 15 dias para máxima cobertura

    // 1. Fontes RSS Diversificadas (Tratando falhas de 500 da API externa)
    const rssFeeds = [
      'https://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml',
      'https://www.saude.ba.gov.br/feed/',
      'https://portaldafisioterapia.com.br/feed/',
      'https://www.crefito4.org.br/site/index.php/noticias?format=feed&type=rss'
    ];
    
    for (const feedUrl of rssFeeds) {
      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=${process.env.RSS2JSON_API_KEY || ''}`;
        const res = await fetch(apiUrl);
        if (!res.ok) continue;
        
        const data = await res.json();
        if (data.status === 'ok' && data.items?.length > 0) {
          const processed = data.items.map((item: any) => ({
            title: item.title,
            summary: item.description?.replace(/<[^>]*>?/gm, '').substring(0, 250) || '',
            url: item.link,
            source: data.feed?.title || 'Notícias Saúde',
            published_at: new Date(item.pubDate).toISOString()
          }));
          newsItems = [...newsItems, ...processed];
        }
      } catch (e) {
        console.error(`Falha no feed: ${feedUrl}`);
      }
    }

    // Filtro Inteligente: Prioridade total para Fisioterapia
    const strictPhysioKeywords = ['fisio', 'reabilita', 'crefito', 'coffito', 'osteopatia', 'quiropraxia', 'pilates', 'cinesioterapia', 'eletroterapia'];
    const secondaryKeywords = ['saúde', 'paciente', 'médic', 'hospital', 'tratamento'];
    
    let filteredNews = newsItems.filter(item => {
      const content = (item.title + item.summary).toLowerCase();
      const isRecent = new Date(item.published_at) >= searchLimitDate;
      
      // Peso 2 para termos de fisio, peso 1 para saúde geral
      const hasStrictKey = strictPhysioKeywords.some(key => content.includes(key));
      const hasSecondaryKey = secondaryKeywords.some(key => content.includes(key));
      
      // Só aceita saúde geral se tiver pelo menos um termo que lembre reabilitação ou se for muito relevante
      return isRecent && (hasStrictKey || (hasSecondaryKey && (content.includes('recupera') || content.includes('clínica'))));
    });

    // 2. Gemini - O Curador Especialista (Foco 100% Profissional)
    if (apiKey) {
      const prompt = `Aja como Editor-Chefe do "Fisio News". 
      Gere 12 notícias REAIS e ESTRITAMENTE sobre o mercado de FISIOTERAPIA no Brasil.
      Foco: Resoluções COFFITO/CREFITO, novas técnicas de reabilitação, concursos para fisioterapeutas e avanços em fisioterapia esportiva/neuro/ Traumato-Ortopédica.
      NÃO inclua notícias genéricas de saúde (vacinas, dietas, etc).
      Retorne APENAS o array JSON: [{"title":"...","summary":"...","url":"...","source":"...","published_at":"..."}]`;

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
      .slice(0, 20);

    if (uniqueNews.length > 0) {
      const { error: dbError } = await supabase
        .from('news')
        .upsert(
          uniqueNews.map(item => ({
            title: item.title,
            summary: item.summary,
            url: item.url || `https://google.com/search?q=${encodeURIComponent(item.title)}`,
            source: item.source,
            published_at: item.published_at || new Date().toISOString(),
          })),
          { onConflict: 'url' }
        );

      if (dbError) throw dbError;
    }

    return NextResponse.json({ success: true, count: uniqueNews.length });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}
