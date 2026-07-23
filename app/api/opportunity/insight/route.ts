import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, state, specialty, population, elderlyPopulation, physiotherapists, establishments, opportunityIndex, opportunityLevel } = body;

    if (!city || !state || !specialty) {
      return NextResponse.json({ insight: null, error: 'Missing required fields' }, { status: 400 });
    }

    const elderlyPct = ((elderlyPopulation / population) * 100).toFixed(1);

    const prompt = `Com base nos dados reais abaixo, gere UM parágrafo curto de no máximo 4 frases com uma orientação profissional direta e motivadora para um fisioterapeuta que acabou de consultar o Mapa de Oportunidades.

CIDADE: ${city} / ${state}
ESPECIALIDADE: ${specialty}
- População total: ${population.toLocaleString('pt-BR')} habitantes
- População idosa: ${elderlyPopulation.toLocaleString('pt-BR')} (${elderlyPct}%)
- Fisioterapeutas estimados: ${physiotherapists}
- Estabelecimentos de saúde: ${establishments}
- Índice de Oportunidade: ${opportunityIndex}
- Nível: ${opportunityLevel}

REGRAS:
- Use os números para embasar a orientação
- Seja específico sobre a cidade e especialidade
- Tom profissional, direto e encorajador, como um mentor
- Termine com uma frase de incentivo ou provocação reflexiva
- Escreva APENAS o parágrafo, sem introduções, sem aspas, sem markdown
- No máximo 4 frases
- Idioma: Português do Brasil`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ insight: null, error: 'AI API key not configured' }, { status: 503 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ insight: null, error: 'AI API request failed' }, { status: 502 });
    }

    const result = await response.json();
    const insight: string | null =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Insight generation error:', error);
    return NextResponse.json({ insight: null, error: 'Internal error' }, { status: 500 });
  }
}
