import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function parseRSS(xml: string, sourcePrefix: string) {
  const items: { title: string; summary: string; url: string; source: string; published_at: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const c = match[1];
    const title = c.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || '';
    const link = c.match(/<link[^>]*>([^<]*)<\/link>/i)?.[1]?.trim() || '';
    const desc = c.match(/<description[^>]*>([^<]*)<\/description>/i)?.[1]?.trim() || '';
    const source = c.match(/<source[^>]*>([^<]*)<\/source>/i)?.[1]?.trim() || sourcePrefix;
    const pubDate = c.match(/<pubDate[^>]*>([^<]*)<\/pubDate>/i)?.[1]?.trim() || '';

    if (title && link) {
      const d = pubDate ? new Date(pubDate) : null;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 15);
      if (d && d < cutoff) continue;

      items.push({
        title,
        summary: desc.replace(/<[^>]*>/g, '').substring(0, 250),
        url: link,
        source,
        published_at: d ? d.toISOString() : new Date().toISOString(),
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
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 15);

  try {
    let allItems: any[] = [];

    // 1. Google News RSS (notícias REAIS e ATUAIS)
    const googleQueries = [
      'fisioterapia Brasil',
      'COFFITO CREFITO',
      'fisioterapeuta mercado trabalho',
      'reabilitação física tratamento',
    ];

    for (const q of googleQueries) {
      try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
        const res = await fetch(url, {
          signal: AbortSignal.timeout(10000),
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (res.ok) {
          const xml = await res.text();
          const parsed = parseRSS(xml, 'Google News');
          allItems.push(...parsed);
        }
      } catch (e) {
        console.warn(`Google News RSS "${q}" falhou:`, e);
      }
    }

    // 2. RSS direto de fontes brasileiras
    const brFeeds = [
      { url: 'https://www.coffito.gov.br/nsite/feed/', source: 'COFFITO' },
      { url: 'https://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml', source: 'G1 Saúde' },
    ];
    for (const feed of brFeeds) {
      try {
        const res = await fetch(feed.url, {
          signal: AbortSignal.timeout(8000),
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (res.ok) {
          const xml = await res.text();
          allItems.push(...parseRSS(xml, feed.source));
        }
      } catch (e) {
        console.warn(`RSS ${feed.source} falhou:`, e);
      }
    }

    // 3. Gemini como reforço (com data atual forçada)
    if (apiKey) {
      const hoje = new Date().toISOString().split('T')[0];
      const prompt = `Você é um editor de notícias de fisioterapia. 

DATA ATUAL: ${hoje}

Gere 15 notícias REAIS e ATUAIS sobre fisioterapia no Brasil com data de publicação entre ${hoje} e 15 dias atrás.

TÓPICOS: COFFITO, CREFITOs, concursos públicos, novas leis, avanços científicos, eventos, congressos, mercado de trabalho, traumato-ortopedia, neurofuncional, pilates, terapia manual, fisioterapia respiratória.

REGRAS:
- Todas as notícias devem ter data de publicação REAL (entre ${hoje} e 15 dias atrás, formato ISO)
- Cada URL deve ser ÚNICO e realista
- Fonte: nome real (ex: "COFFITO", "Portal da Fisioterapia", "SouFisio")
- IDIOMA: Português do Brasil

Retorne APENAS JSON puro (sem markdown):
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
          const clean = text.replace(/```json|```/g, '').trim();
          const start = clean.indexOf('[');
          const end = clean.lastIndexOf(']');
          if (start !== -1 && end !== -1) {
            const parsed = JSON.parse(clean.substring(start, end + 1));
            if (Array.isArray(parsed)) {
              allItems.push(...parsed);
            }
          }
        } else {
          console.warn('Gemini erro:', await aiRes.text());
        }
      } catch (e) {
        console.warn('Gemini falhou:', e);
      }
    }

    if (allItems.length === 0) {
      return NextResponse.json({ success: false, count: 0, error: 'Nenhuma notícia encontrada.' });
    }

    // 4. Limpar tabela e inserir só notícias RECENTES
    const recentes = allItems
      .filter(item => {
        const d = new Date(item.published_at);
        return !isNaN(d.getTime()) && d >= cutoff;
      })
      .filter(item => {
        const txt = (item.title + ' ' + (item.summary || '')).toLowerCase();
        return ['fisio', 'reabilita', 'crefito', 'coffito', 'saúde', 'fisioterapia', 'paciente', 'tratamento', 'clínica', 'dor', 'movimento', 'ortopedia', 'neurologia', 'pilates', 'terapia', 'médico', 'hospital', 'congresso', 'curso'].some(k => txt.includes(k));
      });

    // Deduplicar por título
    const unique = Array.from(
      new Map(recentes.map(item => [item.title?.toLowerCase().trim(), item])).values()
    )
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 40);

    if (unique.length === 0) {
      // Se não achou recentes, força Gemini com data de HOJE
      return NextResponse.json({ success: false, count: 0, error: 'Nenhuma notícia recente encontrada. Tente novamente.' });
    }

    // Gerar URLs únicas
    const urlIndex = new Map<string, number>();
    const finalItems = unique.map(item => {
      const baseUrl = item.url || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
      const count = urlIndex.get(baseUrl) || 0;
      urlIndex.set(baseUrl, count + 1);
      if (count > 0) {
        const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
        return { ...item, url: `https://fisio.news/${slug}-${count}` };
      }
      return { ...item, url: baseUrl };
    });

    // Deletar TODAS as notícias antigas
    await supabase.from('news').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Inserir as novas
    const { error: dbError } = await supabase.from('news').insert(
      finalItems.map(item => ({
        title: item.title,
        summary: (item.summary || '').substring(0, 250),
        url: item.url,
        source: item.source || 'Fisio+',
        published_at: item.published_at || new Date().toISOString(),
      }))
    );

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, count: finalItems.length });
  } catch (error: any) {
    console.error('News update error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar: ' + (error?.message || 'Erro interno') }, { status: 500 });
  }
}
