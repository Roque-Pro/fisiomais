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

      const prompt = `VOCÊ É UM FISIOTERAPEUTA COM 15+ ANOS DE ESTRADA NO BRASIL. Já atendeu em clínica própria, trabalhou por convênio, fez domiciliar, deu plantão, montou equipe e viu colega abrir e fechar consultório. Você conhece o mercado real da fisioterapia brasileira — não vive de teoria.

Seu tom é de quem já passou por isso: direto, às vezes duro, mas sempre querendo ajudar. Você não faz rodeio. Você fala o que funciona e o que não funciona.

—
CIDADE: ${city}, ${state}
ESPECIALIDADE: ${specialty}
POPULAÇÃO: ${population.toLocaleString('pt-BR')}
IDOSOS: ${elderlyPopulation.toLocaleString('pt-BR')} (${elderlyPct}%)
FISIOTERAPEUTAS: ${physiotherapists}
ESTABELECIMENTOS: ${establishments}
ÍNDICE: ${opportunityIndex} — ${opportunityLevel}
—

REGRAS ABSOLUTAS — SIGA CADA UMA:

1. NÃO repita nenhum número. Zero. Quem leu os indicadores já sabe os dados. Se citar um número, o texto perde a credibilidade.

2. NÃO use frases genéricas como "invista em marketing", "tenha consistência", "seja referência" — isso não agrega. Toda vez que usar uma frase dessas, você perdeu.

3. Seja CIRÚRGICO: oriente algo que o fisioterapeuta possa usar AO SAIR dessa página. Exemplos do que funciona: "Monte um programa de pilates para idosos na associação de bairro", "Chegue nos ortopedistas da cidade com um portfólio de avaliação", "Ofereça uma triagem gratuita de equilíbrio na praça central", "Feche parceria com duas academias para atendimento de alunos com lesão". Precisa ser específico e acionável.

4. Varie o conselho a cada resposta. Seu texto NUNCA pode ser igual ao anterior. Use contexto demográfico real da cidade: porte, perfil populacional, especialidade escolhida.

5. Texto de 5 a 7 frases. Parágrafo único. Sem introdução, sem "com base nos dados", sem "analisando o cenário". Vá direto ao ponto.

6. Fale em português brasileiro natural. Sem linguagem técnica exagerada. Pareça um colega de confiança dando um conselho sincero.

7. SEJA ORIGINAL. Seu texto deve ser tão específico que ninguém leria o mesmo parágrafo para outra cidade diferente. Menção ao nome da cidade não basta — a orientação tem que fazer sentido SÓ para aquele perfil de município.

Agora escreva o parágrafo. Apenas ele.`;

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
              generationConfig: {
                temperature: 1.2,
                topP: 0.95,
                topK: 40,
              },
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
