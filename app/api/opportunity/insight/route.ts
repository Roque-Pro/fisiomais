import { NextRequest, NextResponse } from 'next/server';

const specialtyProfile: Record<string, { terms: string; context: string }> = {
  ortopedia: {
    terms: 'pós-operatório, lesões esportivas, fraturas, reconstrução ligamentar, artroplastia, ombro, joelho, coluna, reeducação funcional, terapia manual ortopédica',
    context: 'ortopedistas na cidade, academias, protocolos de pós-operatório, convênios com cirurgiões, demanda por reabilitação pós-cirúrgica',
  },
  neurofuncional: {
    terms: 'AVC, Parkinson, Esclerose Múltipla, lesão medular, paralisia cerebral, reabilitação neurológica, tônus, funcionalidade, Bobath, PNF, marcha, equilíbrio',
    context: 'pacientes neurológicos crônicos, demanda por atendimento domiciliar, convênios, reabilitação de longo prazo, instituições de longa permanência, APAE, centros de reabilitação',
  },
  respiratoria: {
    terms: 'DPOC, asma, fibrose pulmonar, pós-COVID, ventilação mecânica, reexpansão pulmonar, higiene brônquica, Manovacuometria, Peak Flow, fisioterapia cardiorrespiratória, UTI',
    context: 'UTIs, hospitais, home care, programas de reabilitação pulmonar, demanda pós-COVID, atendimento domiciliar para pacientes crônicos respiratórios',
  },
  geriatrica: {
    terms: 'idosos, sarcopenia, fragilidade, prevenção de quedas, osteoporose, equilíbrio, funcionalidade, mobilidade, Alzheimer, demências, envelhecimento ativo, grupos de terceira idade',
    context: 'população idosa crescente, instituições de longa permanência, programas municipais do idoso, Centros de Convivência, demanda por atendimento domiciliar, grupos de prevenção de quedas',
  },
  pediatrica: {
    terms: 'atraso motor, paralisia cerebral, síndromes genéticas, torcicolo congênito, pé torto, displasia do desenvolvimento, estimulação precoce, brincadeira terapêutica, neurodesenvolvimento, equoterapia',
    context: 'APAE, centros de reabilitação infantil, escolas especiais, convênios com pediatras, demanda por estimulação precoce, mães de pacientes buscando atendimento especializado',
  },
  esportiva: {
    terms: 'lesões esportivas, LCA, tendinopatia, corrida, futebol, crossfit, retorno ao esporte, prevenção de lesões, biomecânica, bandagem funcional, treinamento funcional, performance',
    context: 'academias, clubes esportivos, times amadores, assessorias de corrida, escolas de futebol, crossfit boxes, demanda por prevenção e alta performance',
  },
  dermatofuncional: {
    terms: 'fibroedema gelóide, lipodistrofia, linfedema, queloides, queimaduras, pré e pós-operatório, drenagem linfática, radiofrequência, criolipólise, ultrassom estético, rejuvenescimento',
    context: 'clínicas de estética, consultórios de dermatologia, demanda por procedimentos não invasivos, Spas médicos, profissionais de estética, pacientes buscando pós-operatório estético',
  },
  pelvica: {
    terms: 'incontinência urinária, incontinência fecal, prolapso, gestação, pré-natal, pós-parto, assoalho pélvico, diástase abdominal, Biofeedback, Eletroestimulação, disfunções sexuais, uroginecologia',
    context: 'convênios com ginecologistas e urologistas, maternidades, demandas pré e pós-parto, clínicas de uroginecologia, público feminino carente de atendimento especializado no SUS',
  },
};

function getSpecialtyContext(specialty: string): { terms: string; context: string } | null {
  return specialtyProfile[specialty] || null;
}

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
  const profile = getSpecialtyContext(specialty);

  if (opportunityLevel === 'Alta') {
    if (specialty === 'geriatrica') {
      return `${city} tem uma população idosa crescente e carece de profissionais focados em geriatria. Um programa de prevenção de quedas ou um grupo funcional para a terceira idade pode encher sua agenda rapidamente. Busque parceria com o CRAS local, UBS e centros de convivência. É um campo aberto para quem quer construir algo sólido.`;
    }
    if (specialty === 'esportiva') {
      return `${city} respira esporte e ainda tem poucos fisioterapeutas especializados nessa área. Uma parceria com academias, assessorias de corrida ou clubes amadores locais pode ser seu ponto de partida. Ofereça avaliação biomecânica e prevenção de lesões como porta de entrada. O potencial de crescimento é grande.`;
    }
    if (specialty === 'neurofuncional') {
      return `${city} tem demanda represada por reabilitação neurológica. Pacientes com AVC, Parkinson e outras condições crônicas muitas vezes enfrentam filas ou se deslocam para outras cidades. Um atendimento especializado com abordagem em Bobath ou PNF, combinado com visita domiciliar, pode preencher essa lacuna e construir uma clínica referência.`;
    }
    if (specialty === 'pediatrica') {
      return `${city} precisa de fisioterapeutas pediátricos. Crianças com atraso motor, paralisia cerebral e síndromes genéticas dependem de estimulação precoce, e a oferta local costuma ser insuficiente. Uma parceria com a APAE, centros de reabilitação ou consultórios pediátricos pode abrir muitas portas. É uma oportunidade de alto impacto.`;
    }
    if (specialty === 'respiratoria') {
      return `${city} tem carência de fisioterapia respiratória, especialmente para pacientes crônicos e pós-COVID. Um serviço de reabilitação pulmonar ambulatorial ou domiciliar pode ser seu principal diferencial. Busque contato com pneumologistas, UTIs locais e programas de home care. A demanda existe e tende a crescer.`;
    }
    return `${city} oferece um mercado promissor para ${specialty} com baixa concorrência. Invista em formação específica, conecte-se com médicos da área e monte uma estratégia de captação local. O momento é favorável para quem chega com preparo e visão de longo prazo.`;
  }

  if (opportunityLevel === 'Média') {
    if (specialty === 'ortopedia') {
      return `${city} já tem fisioterapeutas ortopédicos, mas ainda há espaço para quem entrega excelência. Invista em protocolos diferenciados de pós-operatório, crie vínculo com cirurgiões ortopédicos da cidade e ofereça um serviço de avaliação gratuito para captar pacientes. A reabilitação de joelho e ombro é uma porta consistente.`;
    }
    if (specialty === 'pelvica') {
      return `${city} tem mercado para fisioterapia pélvica, mas é preciso fazer um trabalho de educação. Muitas mulheres ainda desconhecem o tratamento para incontinência, prolapso e disfunções sexuais. Invista em conteúdo educativo, parcerias com ginecologistas e obstetras, e crie um programa de pré e pós-parto. É um nicho em crescimento.`;
    }
    if (specialty === 'dermatofuncional') {
      return `${city} oferece oportunidades na dermatofuncional, principalmente no pós-operatório e estética. Monte parcerias com cirurgiões plásticos e dermatologistas locais, ofereça um portfólio de procedimentos e invista em resultados visíveis. O boca a boca em clínica estética é seu maior motor de crescimento.`;
    }
    return `${city} tem movimento na área de ${specialty}, mas é preciso se diferenciar. Busque um recorte específico dentro da especialidade, ofereça atendimento personalizado e construa credibilidade com médicos locais. A concorrência existe, mas a demanda também — quem entrega resultado vira referência.`;
  }

  if (specialty === 'ortopedia') {
    return `${city} tem concorrência acirrada em ortopedia. Para se destacar, escolha um nicho cirúrgico específico — joelho, ombro ou coluna — e torne-se referência nele. Crie material educativo, ofereça palestras em academias e mantenha contato próximo com ortopedistas. Em mercado competitivo, especialização extrema é o caminho.`;
  }
  if (specialty === 'geriatrica') {
    return `${city} tem muitos fisioterapeutas, mas poucos focados no idoso. Esse é seu gancho. Invista em atendimento domiciliar, parcerias com ILPIs e programas de prevenção de quedas. O público idoso é fiel e indica — e ainda é mal atendido pela maioria dos profissionais.`;
  }
  return `${city} é um mercado competitivo para ${specialty}. Para crescer, encontre um subnicho mal explorado ou um público mal atendido. Pode ser atendimento domiciliar, um convênio específico ou uma abordagem que ninguém na cidade oferece. Quem se posiciona com clareza sempre encontra espaço.`;
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
      const profile = getSpecialtyContext(specialty);

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

TERMOS ESPECÍFICOS DA ESPECIALIDADE "${specialty.toUpperCase()}" QUE VOCÊ DEVE OBRIGATORIAMENTE USAR:
${profile?.terms || 'termos técnicos relevantes da área'}

CONTEXTO DE MERCADO DESTA ESPECIALIDADE:
${profile?.context || 'contexto de atuação profissional na região'}

REGRAS ABSOLUTAS — SIGA CADA UMA:

1. VOCÊ DEVE USAR termos específicos da especialidade listados acima. É isso que diferencia uma resposta genérica de uma resposta de verdade. Se não usar termos da área, a resposta está errada.

2. ADAPTE o conselho ao PERFIL DEMOGRÁFICO da cidade. Cidade grande vs pequena muda a estratégia. População mais idosa vs mais jovem muda o foco. Mostre que você entende a cidade.

3. NÃO repita nenhum número. Zero. Quem leu os indicadores já sabe os dados.

4. NÃO use frases genéricas como "invista em marketing", "tenha consistência", "seja referência", "ofereça um atendimento de qualidade" — frase dessas invalida o texto.

5. Seja CIRÚRGICO: oriente algo que o fisioterapeuta possa usar AO SAIR dessa página. Exemplo real do que esperamos: "Chegue nos ortopedistas da cidade com um protocolo de pós-operatório de LCA", "Ofereça uma avaliação gratuita de assoalho pélvico em uma maternidade parceira", "Monte um grupo de reabilitação pulmonar para pacientes pós-COVID na UBS do bairro". Precisa ser específico, acionável e vinculado à especialidade.

6. Varie TOTALMENTE o conselho a cada resposta. Uma resposta sobre ortopedia em cidade grande tem que ser completamente diferente de uma sobre geriatria em cidade pequena.

7. Texto de 5 a 7 frases. Parágrafo único. Sem introdução, sem "com base nos dados", sem "analisando o cenário". Vá direto.

8. Fale em português brasileiro natural, como um colega de confiança dando um conselho sincero.

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
