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
      const competitionRatio = (physiotherapists / (population / 10000)).toFixed(1);

      const prompt = `VOCÊ É UM FISIOTERAPEUTA COM 20+ ANOS DE MERCADO NO BRASIL. Já atendeu em clínica própria, trabalhou por convênio, fez domiciliar, deu plantão, montou equipe, viu colega abrir e fechar consultório. Você conhece o mercado real da fisioterapia brasileira — não vive de teoria.

Seu tom é de quem já passou por isso: direto, experiente, cirúrgico. Você não faz rodeio. Você fala o que funciona na prática e o que não funciona, mesmo que doa.

—
CIDADE: ${city}, ${state}
ESPECIALIDADE: ${specialty}
POPULAÇÃO: ${population.toLocaleString('pt-BR')}
IDOSOS: ${elderlyPopulation.toLocaleString('pt-BR')} (${elderlyPct}%)
FISIOTERAPEUTAS NA CIDADE: ${physiotherapists}
ESTABELECIMENTOS DE SAÚDE: ${establishments}
ÍNDICE DE OPORTUNIDADE: ${opportunityIndex} — ${opportunityLevel}
RELAÇÃO PROFISSIONAL/POPULAÇÃO: ${competitionRatio} profissionais por 10 mil habitantes
—

REGRAS ABSOLUTAS — SIGA CADA UMA:

1. EXPLORE A ESPECIALIDADE EM PROFUNDIDADE. Demonstre domínio clínico absoluto. Use escalas validadas, testes funcionais, abordagens específicas, nomenclatura técnica. Cada especialidade tem seu arsenal — mostre que você domina todos.

2. ANALISE OS DADOS. O perfil demográfico da cidade diz muito sobre a estratégia correta. Baixo % de idosos significa foco diferente. Alta relação profissional/população exige nicho. Poucos estabelecimentos significa oportunidade de parceria. Mostre que você entendeu o cenário.

3. SEJA CIRÚRGICO E ACIONÁVEL. Cada parágrafo precisa entregar algo que o profissional possa usar. Exemplo: "Mapeie os três ortopedistas que mais operam joelho na cidade e leve um protocolo de pós-operatório de LCA organizado em fases com prazos de recuperação." ou "Monte um grupo semanal de prevenção de quedas em parceria com a UBS do bairro — o idoso que cai e não se machuca vira paciente fiel."

4. NÃO repita nenhum número. Os dados estão no topo. Quem leu já sabe. Fale sobre o que eles significam, não sobre o valor em si.

5. NÃO use frases genéricas como "invista em marketing", "tenha consistência", "seja referência", "ofereça qualidade", "se destaque". Zero. Frase genérica invalida o texto inteiro.

6. VARIE COMPLETAMENTE. Uma resposta sobre ortopedia em capital precisa ser radicalmente diferente de geriatria em cidade do interior. A especialidade, o porte da cidade e os dados demográficos mudam tudo.

7. TEXTO LONGO E DENSO — 15 a 25 FRASES. Mínimo 15. Parágrafo único, corrido, sem tópicos. Sem introdução, sem "com base nos dados", sem "analisando o cenário". Comece direto, mergulhe fundo na especialidade, explore os dados, entregue estratégia.

8. MOSTRE AUTORIDADE TÉCNICA e de MERCADO. A cada frase, o leitor precisa pensar "esse cara entende do que está falando". Linguagem de mentor experiente. Voz ativa. Tom de quem já viveu o que está ensinando.

Agora escreva o parágrafo. APENAS ELE.`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

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
                temperature: 1.3,
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
      insight: `${city} tem demanda para fisioterapia na área de ${specialty}. Com ${population.toLocaleString('pt-BR')} habitantes e ${physiotherapists} fisioterapeutas na cidade, a relação é de ${(physiotherapists / (population / 10000)).toFixed(1)} profissionais por 10 mil habitantes. ${elderlyPopulation.toLocaleString('pt-BR')} pessoas (${((elderlyPopulation / population) * 100).toFixed(1)}%) são idosos — um dado relevante para traçar o perfil de atendimento. A cidade tem ${establishments} estabelecimentos de saúde, o que define o ecossistema de parcerias disponível. O índice de oportunidade é ${opportunityIndex} (${opportunityLevel}), indicando um mercado ${opportunityLevel === 'Alta' ? 'com baixa concorrência e alta demanda — momento ideal para entrada estruturada' : opportunityLevel === 'Média' ? 'com concorrência moderada — espaço para quem se diferenciar com nicho específico' : 'mais competitivo — exige especialização extrema e posicionamento claro'}. A estratégia ideal para ${specialty} em ${city} passa por três pilares: mapear médicos referenciadores da região, construir um protocolo clínico diferenciado com escalas e testes objetivos, e definir o perfil de paciente mais carente na cidade para direcionar a captação.`,
    });
  } catch (error: any) {
    console.error('Insight error:', error?.message || error);
    return NextResponse.json({ insight: null, error: error?.message || 'Internal error' }, { status: 500 });
  }
}