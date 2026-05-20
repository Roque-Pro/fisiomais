import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient();
  
  // 1. Verificar se é admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  try {
    let newsItems: any[] = [];

    // TENTATIVA 1: Buscar via RSS Público (Mais confiável que IA pura para busca web)
    // Usamos o Google News RSS convertido para JSON via serviço gratuito
    console.log('Buscando notícias via RSS...');
    const rssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://news.google.com/rss/search?q=fisioterapia+when:3d&hl=pt-BR&gl=BR&ceid=BR:pt-419')}`);
    const rssData = await rssRes.json();

    if (rssData.status === 'ok' && rssData.items?.length > 0) {
      newsItems = rssData.items.map(item => ({
        title: item.title,
        summary: item.content?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
        url: item.link,
        source: item.author || 'Google News',
        published_at: new Date(item.pubDate).toISOString()
      }));
    }

    // TENTATIVA 2: Se o RSS falhar e tivermos API KEY, tentamos Gemini
    if (newsItems.length === 0 && apiKey) {
      console.log('RSS vazio ou falhou, tentando Gemini...');
      const prompt = `Liste 10 notícias recentes e reais de hoje sobre fisioterapia no Brasil. 
      Retorne apenas um array JSON válido: [{"title":"...","summary":"...","url":"...","source":"...","published_at":"..."}].
      Não use blocos de código markdown, retorne apenas o JSON puro.`;
      
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
            // Limpeza robusta de JSON se o Gemini ignorar a instrução de "JSON puro"
            const cleanJson = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (Array.isArray(parsed)) {
              newsItems = parsed;
            }
          }
        } else {
          const errorDetail = await aiRes.text();
          console.error('Erro na API Gemini:', aiRes.status, errorDetail);
        }
      } catch (aiErr) {
        console.error('Erro ao processar IA:', aiErr);
      }
    }

    if (newsItems.length > 0) {
      // 3. Salvar no Banco de Dados
      const { error: dbError } = await supabase
        .from('news')
        .upsert(
          newsItems.map(item => ({
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

    return NextResponse.json({ success: true, count: newsItems.length });

  } catch (error) {
    console.error('Erro na atualização:', error);
    const message = error instanceof Error ? error.message : 'Falha ao buscar notícias. Verifique a conexão.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
