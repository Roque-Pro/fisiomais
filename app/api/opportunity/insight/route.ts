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
  const esp = specialty.toLowerCase();

  if (opportunityLevel === 'Alta') {
    return `${city} ainda tem demanda reprimida na fisioterapia. Com poucos profissionais estabelecidos, quem chegar primeiro com um atendimento de qualidade em ${esp} pode construir uma base sólida de pacientes. Invista em formação continuada na área e crie conexão com médicos da cidade — eles são sua principal porta de entrada. O momento é bom para montar seu próprio espaço ou assumir a liderança de uma clínica local.`;
  }
  if (opportunityLevel === 'Média') {
    return `${city} tem movimento, mas exige estratégia. O mercado já tem fisioterapeutas atuando, então o diferencial vai estar na sua especialização em ${esp} e na forma como você se apresenta. Invista em conteúdo digital, marque presença nos grupos de saúde locais e ofereça um atendimento que vá além da queixa inicial — quem entrega resultado vira referência. Com consistência, você constrói seu espaço.`;
  }
  return `${city} é um mercado competitivo, mas isso não significa porta fechada. O segredo está em encontrar seu nicho dentro de ${esp} — pode ser atendimento domiciliar, uma abordagem específica ou um público mal atendido na região. Seja criativo na captação: converse com academias, clínicas escola e médicos da atenção básica. Em cidade concorrida, quem se posiciona com clareza é quem cresce.`;
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

      const prompt = `Você é fisioterapeuta há mais de 15 anos, com vasta experiência clínica e de mercado no Brasil. Conhece na prática como funciona a profissão em cada região, as dificuldades reais de conseguir pacientes, o peso do boca a boca e a importância de se posicionar bem. Seu tom é natural, direto e seguro — de quem já viveu isso.

Analise os dados abaixo de ${city}, ${state} como quem olha para uma cidade e já pensa no que funciona ali.

População: ${population.toLocaleString('pt-BR')}
Idosos: ${elderlyPopulation.toLocaleString('pt-BR')} (${elderlyPct}%)
Fisioterapeutas: ${physiotherapists}
Estabelecimentos: ${establishments}
Índice de oportunidade: ${opportunityIndex} — ${opportunityLevel}
Especialidade: ${specialty}

REGRAS:
- NÃO repita os números — o profissional já os viu nos indicadores acima.
- Fale como um colega mais experiente, com credibilidade natural.
- Dê uma orientação prática e aplicável: o que ele deveria fazer ao chegar nessa cidade, como se posicionar, com quem se conectar, onde investir.
- Seja específico sobre a cidade e a especialidade.
- Texto de 4 a 6 frases, parágrafo único.
- Português brasileiro.
- NÃO use frases genéricas como "invista em marketing" sem contexto.
- Escreva APENAS o parágrafo.`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

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
