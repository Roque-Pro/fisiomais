import { NextRequest, NextResponse } from 'next/server';

function generateFallbackInsight(
  city: string,
  _state: string,
  specialty: string,
  _population: number,
  _elderlyPopulation: number,
  physiotherapists: number,
  _establishments: number,
  _opportunityIndex: number,
  opportunityLevel: string,
): string {
  if (opportunityLevel === 'Alta') {
    return `O mercado em ${city} está aquecido e com espaço para mais profissionais. Com poucos fisioterapeutas atuando na região, investir em ${specialty.toLowerCase()} pode te colocar à frente da concorrência. Considere montar seu consultório ou buscar parcerias com clínicas locais — a demanda tende a crescer.`;
  }
  if (opportunityLevel === 'Média') {
    return `${city} tem um mercado competitivo, mas com boas oportunidades para quem se posiciona bem. Especializar-se em ${specialty.toLowerCase()} é um bom caminho para se destacar. Invista em marketing profissional, parcerias com médicos e presença digital para atrair pacientes na região.`;
  }
  return `Em ${city}, a concorrência entre fisioterapeutas é mais acirrada. Para conseguir espaço, vale apostar em um atendimento de nicho — ${specialty.toLowerCase()} pode ser seu diferencial. Ofereça um serviço especializado e construa autoridade local para se destacar no mercado.`;
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

      const prompt = `Você é um mentor de carreira para fisioterapeutas.

Dados de mercado de ${city}, ${state}:
- População: ${population.toLocaleString('pt-BR')}
- Idosos: ${elderlyPopulation.toLocaleString('pt-BR')} (${elderlyPct}%)
- Fisioterapeutas: ${physiotherapists}
- Estabelecimentos: ${establishments}
- Índice: ${opportunityIndex} (${opportunityLevel})
- Especialidade buscada: ${specialty}

IMPORTANTE: NÃO repita os números acima. O usuário já os viu.

Seu papel: gere UM parágrafo curto (2 a 4 frases) com uma orientação estratégica genuína. Pense como um mentor que interpreta os dados e dá um conselho prático. Sugira um próximo passo, um posicionamento ou uma estratégia de atuação para essa cidade.

Tom: direto, profissional, encorajador. Português brasileiro. Apenas o parágrafo, sem introduções.`;

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
