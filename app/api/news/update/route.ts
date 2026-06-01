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
    searchLimitDate.setDate(searchLimitDate.getDate() - 20); // 20 dias para garantir volume técnico

    // 1. Fontes Específicas e Técnicas de Fisioterapia
    const rssFeeds = [
      'https://www.coffito.gov.br/nsite/feed/', // COFFITO Oficial
      'https://blogfisioterapia.com.br/feed/', // Blog Fisioterapia (Técnico)
      'https://soufisio.com.br/blog/feed/',    // SouFisio (Carreira/Técnico)
      'https://interfisio.com.br/feed/',       // InterFISIO (Artigos)
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
            source: data.feed?.title || 'Fisio News',
            published_at: new Date(item.pubDate).toISOString()
          }));
          newsItems = [...newsItems, ...processed];
        }
      } catch (e) {
        console.error(`Falha no feed técnico: ${feedUrl}`);
      }
    }

    // Filtro Cirúrgico: Só aceita se for estritamente relacionado à profissão
    const professionalKeywords = [
      'fisioterapeuta', 'fisioterapia', 'coffito', 'crefito', 
      'reabilitação', 'ortopedia', 'traumato', 'neurofuncional', 
      'respiratória', 'manual', 'resolução', 'acórdão', 'concurso',
      'cinesioterapia', 'eletroterapia', 'pilates', 'osteopatia',
      'quiropraxia', 'dermato', 'saúde funcional'
    ];
    
    let filteredNews = newsItems.filter(item => {
      const content = (item.title + item.summary).toLowerCase();
      const isRecent = new Date(item.published_at) >= searchLimitDate;
      const isProfessional = professionalKeywords.some(key => content.includes(key));
      
      // Bloqueia notícias genéricas de saúde que não citam fisioterapia
      return isRecent && isProfessional;
    });

    // 2. Gemini - O Editor Técnico (Foco 100% em Prática Clínica e Conselho)
    if (apiKey) {
      const prompt = `Aja como o Editor-Chefe do "Fisio News". 
      Gere 12 notícias ESTRITAMENTE profissionais para Fisioterapeutas brasileiros.
      TEMAS OBRIGATÓRIOS:
      - Novas resoluções e decisões do COFFITO/CREFITOs.
      - Editais de concursos e residências em Fisioterapia.
      - Avanços em Terapia Manual, Dry Needling, Liberação Miofascial e Pilates.
      - Tecnologias de avaliação (Termografia, Baropodometria, etc).
      - Fisioterapia Esportiva de alto rendimento.
      
      PROIBIDO: Notícias de saúde geral, vacinas, dietas, hospitais em geral ou medicina sem foco em reabilitação.
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

    // Processamento Final (Remover duplicatas)
    const uniqueNews = Array.from(new Map(filteredNews.map(item => [item.url || item.title, item])).values())
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 25);

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
    return NextResponse.json({ error: 'Falha na atualização profissional.' }, { status: 500 });
  }
}
