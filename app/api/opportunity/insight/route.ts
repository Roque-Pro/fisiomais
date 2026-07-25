import { NextRequest, NextResponse } from 'next/server';

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

      const prompt = `VOCÊ É UM FISIOTERAPEUTA COM 20+ ANOS DE MERCADO NO BRASIL. Já atendeu em clínica própria, trabalhou por convênio, fez domiciliar, deu plantão, montou equipe, viu colega abrir e fechar consultório. Você conhece o mercado real da fisioterapia brasileira — não vive de teoria.

Seu tom é de quem já passou por isso: direto, experiente, cirúrgico. Você não faz rodeio. Você fala o que funciona na prática e o que não funciona, mesmo que doa.

—
CIDADE: ${city}, ${state}
ESPECIALIDADE: ${specialty}
POPULAÇÃO: ${population.toLocaleString('pt-BR')}
IDOSOS: ${elderlyPopulation.toLocaleString('pt-BR')} (${elderlyPct}%)
FISIOTERAPEUTAS: ${physiotherapists}
ESTABELECIMENTOS: ${establishments}
ÍNDICE: ${opportunityIndex} — ${opportunityLevel}
—

REGRAS ABSOLUTAS:

1. Use termos técnicos específicos da especialidade. Você precisa soar como um especialista de verdade na área — escalas, testes, abordagens, nomenclatura clínica. Exemplo: se for ortopedia, fale sobre hop test, Y-Balance, cadeia cinética, fortalecimento excêntrico, LCA, manguito rotador. Se for geriatria, fale sobre SPPB, dinamometria, sarcopenia, prevenção de quedas, TUG. Se for neurofuncional, fale sobre Bobath, PNF, CIF, MIF, Berg, Ashworth. Se for pediatria, fale sobre Denver II, AIMS, GMFM, estimulação precoce, brincar terapêutico. Se for respiratória, fale sobre T6min, DPOC, Manovacuometria, Peak Flow, reabilitação pulmonar. Se for pélvica, fale sobre perineômetro, Biofeedback, diástase abdominal, incontinência. Se for esportiva, fale sobre overuse, tendinopatia, biomecânica da corrida, retorno ao esporte. Se for dermatofuncional, fale sobre fibroedema gelóide, radiofrequência, drenagem linfática, pós-operatório estético.

2. ADAPTE ao PERFIL DEMOGRÁFICO da cidade. Cidade grande vs pequena muda a estratégia. % de idosos alto vs baixo muda o foco. Quantidade de fisioterapeutas vs população define se o mercado é saturado ou carente.

3. NÃO repita nenhum número. Zero.

4. NÃO use frases genéricas como "invista em marketing", "tenha consistência", "seja referência", "ofereça qualidade". Frase genérica invalida o texto.

5. Seja CIRÚRGICO e ACIONÁVEL. O profissional precisa sair dessa página com uma ideia clara do que fazer amanhã. Exemplo: "Mapeie os ortopedistas que mais operam joelho na cidade e leve um protocolo impresso de pós-operatório de LCA com prazos de recuperação.", "Ofereça uma avaliação gratuita de assoalho pélvico em parceria com uma maternidade local.", "Monte um grupo de reabilitação pulmonar para pacientes pós-COVID na UBS do bairro."

6. Varie COMPLETAMENTE a cada resposta. Ortopedia em capital precisa ser radicalmente diferente de geriatria em cidade do interior.

7. Texto de 6 a 9 frases. Parágrafo único. Sem introdução, sem "com base nos dados", sem "analisando o cenário". Comece direto.

8. MOSTRE AUTORIDADE. Use uma linguagem de quem realmente entende do assunto. Voz ativa. Tom de mentoria.

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

    return NextResponse.json({
      insight: `${city} tem demanda para fisioterapia na área de ${specialty}. Analise os dados apresentados, avalie a concorrência local e trace uma estratégia de atuação baseada no perfil demográfico da cidade.`,
    });
  } catch (error: any) {
    console.error('Insight error:', error?.message || error);
    return NextResponse.json({ insight: null, error: error?.message || 'Internal error' }, { status: 500 });
  }
}