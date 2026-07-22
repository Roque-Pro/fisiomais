import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BR_NEWS_SOURCES = [
  { url: 'https://www.coffito.gov.br/nsite/feed/', source: 'COFFITO' },
  { url: 'https://soufisio.com.br/blog/feed/', source: 'SouFisio' },
  { url: 'https://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml', source: 'G1 Saúde' },
];

function parseRSS(xml: string, source: string) {
  const items: { title: string; summary: string; url: string; source: string; published_at: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = content.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || '';
    const link = content.match(/<link[^>]*>([^<]*)<\/link>/i)?.[1]?.trim() || '';
    const desc = content.match(/<description[^>]*>([^<]*)<\/description>/i)?.[1]?.trim() || '';
    const pubDate = content.match(/<pubDate[^>]*>([^<]*)<\/pubDate>/i)?.[1]?.trim() || '';

    if (title && link) {
      items.push({
        title,
        summary: desc.replace(/<[^>]*>/g, '').substring(0, 250),
        url: link,
        source,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }
  return items;
}

export async function POST() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const searchLimitDate = new Date();
  searchLimitDate.setDate(searchLimitDate.getDate() - 60);

  try {
    let newsItems: any[] = [];

    // 1. RSS feeds diretos (sem depender de rss2json)
    for (const feed of BR_NEWS_SOURCES) {
      try {
        const res = await fetch(feed.url, {
          signal: AbortSignal.timeout(8000),
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (res.ok) {
          const xml = await res.text();
          const parsed = parseRSS(xml, feed.source);
          newsItems.push(...parsed);
        }
      } catch (e) {
        console.warn(`RSS ${feed.source} falhou:`, e);
      }
    }

    // 2. Gemini gera notícias atualizadas
    if (apiKey) {
      const hoje = new Date().toLocaleDateString('pt-BR');
      const prompt = `Você é um editor de notícias de fisioterapia. Gere 20 notícias REAIS e RECENTES sobre fisioterapia no Brasil (data atual: ${hoje}).
        
REGRAS:
- Notícias devem ser sobre: COFFITO, CREFITOs, concursos, leis, avanços científicos, eventos, congressos, mercado de trabalho
- Cada notícia deve ter título, resumo (até 200 caracteres), fonte (ex: "COFFITO", "SouFisio", "Portal Fisioterapia"), data (formato ISO 8601)
- URLs podem ser genéricas como "https://www.coffito.gov.br" ou "https://soufisio.com.br"
- IDIOMA: Português do Brasil

Retorne APENAS um array JSON válido (sem markdown, sem explicacões):
[{"title":"...","summary":"...","url":"...","source":"...","published_at":"2026-07-20T10:00:00.000Z"}]`;

      try {
        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            signal: AbortSignal.timeout(30000),
          }
        );

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanJson = text.replace(/```json|```|```/g, '').trim();
          const start = cleanJson.indexOf('[');
          const end = cleanJson.lastIndexOf(']');
          if (start !== -1 && end !== -1) {
            const parsed = JSON.parse(cleanJson.substring(start, end + 1));
            if (Array.isArray(parsed)) {
              newsItems.push(...parsed);
            }
          }
        } else {
          const errText = await aiRes.text();
          console.warn('Gemini API error:', aiRes.status, errText);
        }
      } catch (e) {
        console.warn('Gemini fetch failed:', e);
      }
    }

    // 3. Filtrar e deduplicar
    const keywords = ['fisio', 'reabilita', 'crefito', 'coffito', 'saúde', 'fisioterapia', 'paciente', 'tratamento', 'clínica', 'dor', 'movimento', 'ortopedia', 'neurologia', 'pilates', 'terapia'];
    const filtered = newsItems.filter(item => {
      const content = (item.title + ' ' + (item.summary || '')).toLowerCase();
      return keywords.some(k => content.includes(k));
    });

    const unique = Array.from(
      new Map(filtered.map(item => [item.title?.toLowerCase().trim(), item])).values()
    )
      .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())
      .slice(0, 60);

    if (unique.length === 0) {
      return NextResponse.json({ success: false, count: 0, error: 'Nenhuma notícia encontrada no momento.' });
    }

    const { error: dbError } = await supabase
      .from('news')
      .upsert(
        unique.map(item => ({
          title: item.title,
          summary: (item.summary || '').substring(0, 250),
          url: item.url || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
          source: item.source || 'Fisio+',
          published_at: item.published_at || new Date().toISOString(),
        })),
        { onConflict: 'url', ignoreDuplicates: false }
      );

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, count: unique.length });
  } catch (error: any) {
    console.error('News update error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar notícias: ' + (error?.message || 'Erro interno') }, { status: 500 });
  }
}
