import { NextRequest, NextResponse } from 'next/server';

function generateFallbackInsight(
  city: string,
  state: string,
  specialty: string,
  population: number,
  elderlyPopulation: number,
  physiotherapists: number,
  establishments: number,
  opportunityIndex: number,
  opportunityLevel: string,
): string {
  const elderlyPct = ((elderlyPopulation / population) * 100).toFixed(1);
  const physioPerCapita = (physiotherapists / population * 10000).toFixed(1);

  if (opportunityLevel === 'Alta') {
    return `Com ${population.toLocaleString('pt-BR')} habitantes e apenas ${physiotherapists} fisioterapeutas (${physioPerCapita} por 10 mil hab.), ${city} apresenta baixa concorrência e alta demanda, especialmente em ${specialty.toLowerCase()}. A população idosa de ${elderlyPct}% reforça a necessidade de profissionais na região. Um cenário promissor para quem busca crescimento e impacto profissional.`;
  }
  if (opportunityLevel === 'Média') {
    return `${city} oferece um mercado equilibrado para fisioterapeutas, com ${physiotherapists} profissionais para uma população de ${population.toLocaleString('pt-BR')} habitantes (${physioPerCapita} por 10 mil hab.). Os ${elderlyPct}% de idosos indicam demanda consistente, especialmente em ${specialty.toLowerCase()}. É uma cidade com potencial para construir uma carreira sólida.`;
  }
  return `${city} possui ${physiotherapists} fisioterapeutas para ${population.toLocaleString('pt-BR')} habitantes e ${elderlyPct}% de população idosa. A concorrência é mais elevada, mas a especialidade em ${specialty.toLowerCase()} pode ser seu diferencial competitivo. Considere focar em um nicho específico para se destacar no mercado local.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, state, specialty, population, elderlyPopulation, physiotherapists, establishments, opportunityIndex, opportunityLevel } = body;

    if (!city || !state || !specialty) {
      return NextResponse.json({ insight: null, error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (apiKey) {
      const elderlyPct = ((elderlyPopulation / population) * 100).toFixed(1);

      const prompt = `Dados de mercado para fisioterapeuta em ${city}, ${state}:
- População: ${population.toLocaleString('pt-BR')}
- Idosos: ${elderlyPopulation.toLocaleString('pt-BR')} (${elderlyPct}%)
- Fisioterapeutas: ${physiotherapists}
- Estabelecimentos: ${establishments}
- Índice: ${opportunityIndex} (${opportunityLevel})
- Especialidade: ${specialty}

Com base nesses números, escreva 1 parágrafo curto (2 a 4 frases) orientando um fisioterapeuta sobre essa cidade. Use os dados, seja direto, tom de mentor. Português brasileiro. Apenas o parágrafo.`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        );

        clearTimeout(timeout);

        if (response.ok) {
          const result = await response.json();
          const insight: string | null =
            result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

          if (insight) {
            return NextResponse.json({ insight });
          }
        }
      } catch {
        // Fallback below
      }
    }

    const insight = generateFallbackInsight(
      city, state, specialty,
      population, elderlyPopulation,
      physiotherapists, establishments,
      opportunityIndex, opportunityLevel,
    );

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error('Insight error:', error?.message || error);
    return NextResponse.json({ insight: null, error: error?.message || 'Internal error' }, { status: 500 });
  }
}
