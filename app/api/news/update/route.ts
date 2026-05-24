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
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // 1. RSS Search - Query Ultra-Focada em Fisioterapia mas Ampla em Temas
    const physioNiches = [
      'fisioterapia ortopédica', 'fisioterapia esportiva', 'fisioterapia neurofuncional', 
      'fisioterapia pélvica', 'fisioterapia respiratória', 'fisioterapia dermatofuncional',
      'COFFITO', 'CREFITO', 'concurso fisioterapia', 'fisioterapia terapia manual',
      'fisioterapia gerontologia', 'fisioterapia osteopatia', 'fisioterapia quiropraxia'
    ];
    
    // Sorteia 3 nichos para garantir variedade a cada clique
    const selectedNiches = [...physioNiches].sort(() => 0.5 - Math.random()).slice(0, 3);
    const searchQuery = `("${selectedNiches.join('" OR "')}") when:7d`;
    
    console.log(`Buscando RSS com foco em: ${selectedNiches.join(', ')}`);
    
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
      const rssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
      const rssData = await rssRes.json();

      if (rssData.status === 'ok' && rssData.items?.length > 0) {
        const filteredRss = rssData.items
          .map((item: any) => ({
            title: item.title,
            summary: item.content?.replace(/<[^>]*>?/gm, '').substring(0, 220) + '...',
            url: item.link,
            source: item.author || 'Notícias Fisio',
            published_at: new Date(item.pubDate).toISOString()
          }))
          .filter((item: any) => {
            const titleLower = item.title.toLowerCase();
            const summaryLower = item.summary.toLowerCase();
            // Filtro de segurança: precisa ter "fisioterapia", "fisioterapeuta", "fisio", "coffito" ou "crefito"
            return (new Date(item.published_at) >= twoDaysAgo) && 
                   (titleLower.includes('fisio') || titleLower.includes('crefito') || titleLower.includes('coffito') || 
                    summaryLower.includes('fisio') || summaryLower.includes('crefito'));
          });
        
        newsItems = [...newsItems, ...filteredRss];
      }
    } catch (e) {
      console.error('Erro no RSS:', e);
    }

    // 2. Gemini - Prompt Especialista em Fisioterapia
    if (apiKey) {
      console.log('Solicitando curadoria técnica ao Gemini...');
      const prompt = `Aja como o Editor-Chefe do "Fisio News". Sua missão é fornecer 10 notícias EXCLUSIVAMENTE sobre Fisioterapia ocorridas no Brasil nos últimos 2 dias.

      O QUE BUSCAR (Seja Amplo):
      - Decisões e resoluções do COFFITO e CREFITOs.
      - Novos concursos públicos para fisioterapeutas.
      - Avanços em pesquisas científicas (pubmed, scielo) aplicados à fisioterapia.
      - Lançamento de tecnologias, softwares ou equipamentos para clínicas de fisio.
      - Eventos, congressos e cursos de especialização de destaque.
      - Notícias de fisioterapia esportiva (lesões de atletas famosos, etc).

      REGRAS CRÍTICAS:
      1. PROIBIDO qualquer notícia que não mencione fisioterapia ou o conselho de classe.
      2. PROIBIDO notícias genéricas de "saúde" ou "medicina" que não tenham o fisioterapeuta como protagonista.
      3. Verifique a veracidade. Use fontes como portais de conselhos, sites de notícias e blogs especializados.
      4. O campo "published_at" deve ser entre ontem e hoje.
      5. RETORNE APENAS O ARRAY JSON PURO.

      Formato: [{"title":"...","summary":"...","url":"...","source":"...","published_at":"..."}]`;

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
                .filter(it => {
                  const content = (it.title + it.summary).toLowerCase();
                  return content.includes('fisio') || content.includes('crefito') || content.includes('coffito');
                })
                .map(it => ({
                  ...it,
                  published_at: it.published_at || new Date().toISOString()
                }))
                .filter(it => new Date(it.published_at) >= twoDaysAgo);
              
              newsItems = [...newsItems, ...validatedAi];
            }
          }
        }
      } catch (aiErr) {
        console.error('Erro Gemini:', aiErr);
      }
    }

    // Processamento Final
    const uniqueNews = Array.from(new Map(newsItems.map(item => [item.url, item])).values())
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 15);

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
    return NextResponse.json({ error: 'Falha na atualização. Tente novamente.' }, { status: 500 });
  }
}
