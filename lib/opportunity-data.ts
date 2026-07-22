type Region = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

export interface CityData {
  name: string;
  population: number;
  elderlyPopulation: number;
  physiotherapists: number;
  establishments: number;
}

export interface StateData {
  code: string;
  name: string;
  region: Region;
  cities: CityData[];
}

export interface AnalysisResult {
  city: string;
  state: string;
  specialty: string;
  population: number;
  elderlyPopulation: number;
  physiotherapists: number;
  establishments: number;
  opportunityIndex: number;
  opportunityLevel: 'Baixa' | 'Média' | 'Alta';
}

const RATES: Record<Region, { elderly: number; physio: number; estab: number }> = {
  norte: { elderly: 0.085, physio: 5500, estab: 9000 },
  nordeste: { elderly: 0.100, physio: 4800, estab: 8500 },
  'centro-oeste': { elderly: 0.110, physio: 3800, estab: 7500 },
  sudeste: { elderly: 0.150, physio: 2800, estab: 6000 },
  sul: { elderly: 0.165, physio: 2400, estab: 5500 },
};

function generateCities(region: Region, entries: [string, number][]): CityData[] {
  const r = RATES[region];
  return entries.map(([name, pop]) => ({
    name,
    population: pop,
    elderlyPopulation: Math.round(pop * r.elderly),
    physiotherapists: Math.max(1, Math.round(pop / r.physio)),
    establishments: Math.max(1, Math.round(pop / r.estab)),
  }));
}

const RAW: [string, string, Region, [string, number][]][] = [
  ['AC', 'Acre', 'norte', [
    ['Rio Branco', 420000],
    ['Cruzeiro do Sul', 90000],
  ]],
  ['AL', 'Alagoas', 'nordeste', [
    ['Maceió', 1020000],
    ['Arapiraca', 235000],
    ['Palmeira dos Índios', 72000],
  ]],
  ['AP', 'Amapá', 'norte', [
    ['Macapá', 520000],
    ['Santana', 125000],
  ]],
  ['AM', 'Amazonas', 'norte', [
    ['Manaus', 2255000],
    ['Parintins', 115000],
    ['Itacoatiara', 105000],
  ]],
  ['BA', 'Bahia', 'nordeste', [
    ['Salvador', 2900000],
    ['Feira de Santana', 625000],
    ['Vitória da Conquista', 345000],
    ['Ilhéus', 160000],
    ['Lauro de Freitas', 205000],
  ]],
  ['CE', 'Ceará', 'nordeste', [
    ['Fortaleza', 2700000],
    ['Juazeiro do Norte', 280000],
    ['Sobral', 215000],
    ['Crato', 135000],
  ]],
  ['DF', 'Distrito Federal', 'centro-oeste', [
    ['Brasília', 3100000],
  ]],
  ['ES', 'Espírito Santo', 'sudeste', [
    ['Vitória', 370000],
    ['Serra', 530000],
    ['Vila Velha', 510000],
    ['Cariacica', 400000],
  ]],
  ['GO', 'Goiás', 'centro-oeste', [
    ['Goiânia', 1550000],
    ['Anápolis', 400000],
    ['Aparecida de Goiânia', 600000],
    ['Rio Verde', 250000],
  ]],
  ['MA', 'Maranhão', 'nordeste', [
    ['São Luís', 1115000],
    ['Imperatriz', 260000],
    ['Caxias', 165000],
    ['Timon', 170000],
  ]],
  ['MT', 'Mato Grosso', 'centro-oeste', [
    ['Cuiabá', 625000],
    ['Rondonópolis', 240000],
    ['Sinop', 165000],
    ['Várzea Grande', 290000],
  ]],
  ['MS', 'Mato Grosso do Sul', 'centro-oeste', [
    ['Campo Grande', 920000],
    ['Dourados', 230000],
    ['Três Lagoas', 125000],
  ]],
  ['MG', 'Minas Gerais', 'sudeste', [
    ['Belo Horizonte', 2530000],
    ['Uberlândia', 710000],
    ['Juiz de Fora', 575000],
    ['Montes Claros', 420000],
    ['Divinópolis', 245000],
    ['Ipatinga', 265000],
  ]],
  ['PA', 'Pará', 'norte', [
    ['Belém', 1500000],
    ['Santarém', 310000],
    ['Ananindeua', 540000],
    ['Marabá', 285000],
  ]],
  ['PB', 'Paraíba', 'nordeste', [
    ['João Pessoa', 825000],
    ['Campina Grande', 415000],
    ['Patos', 110000],
  ]],
  ['PR', 'Paraná', 'sul', [
    ['Curitiba', 1960000],
    ['Londrina', 580000],
    ['Maringá', 440000],
    ['Ponta Grossa', 360000],
    ['Cascavel', 340000],
    ['Foz do Iguaçu', 260000],
  ]],
  ['PE', 'Pernambuco', 'nordeste', [
    ['Recife', 1660000],
    ['Caruaru', 370000],
    ['Petrolina', 360000],
    ['Olinda', 395000],
  ]],
  ['PI', 'Piauí', 'nordeste', [
    ['Teresina', 875000],
    ['Parnaíba', 155000],
    ['Picos', 80000],
  ]],
  ['RJ', 'Rio de Janeiro', 'sudeste', [
    ['Rio de Janeiro', 6750000],
    ['Niterói', 520000],
    ['Duque de Caxias', 930000],
    ['Nova Iguaçu', 825000],
    ['Campos dos Goytacazes', 515000],
    ['Petrópolis', 310000],
  ]],
  ['RN', 'Rio Grande do Norte', 'nordeste', [
    ['Natal', 890000],
    ['Mossoró', 305000],
    ['Parnamirim', 270000],
  ]],
  ['RS', 'Rio Grande do Sul', 'sul', [
    ['Porto Alegre', 1495000],
    ['Caxias do Sul', 525000],
    ['Pelotas', 345000],
    ['Canoas', 350000],
    ['Santa Maria', 285000],
    ['Passo Fundo', 205000],
  ]],
  ['RO', 'Rondônia', 'norte', [
    ['Porto Velho', 550000],
    ['Ji-Paraná', 130000],
    ['Ariquemes', 110000],
  ]],
  ['RR', 'Roraima', 'norte', [
    ['Boa Vista', 440000],
    ['Rorainópolis', 30000],
  ]],
  ['SC', 'Santa Catarina', 'sul', [
    ['Florianópolis', 520000],
    ['Joinville', 620000],
    ['Blumenau', 370000],
    ['São José', 250000],
    ['Chapecó', 260000],
    ['Criciúma', 220000],
  ]],
  ['SP', 'São Paulo', 'sudeste', [
    ['São Paulo', 12400000],
    ['Campinas', 1220000],
    ['Ribeirão Preto', 720000],
    ['São José dos Campos', 740000],
    ['Sorocaba', 700000],
    ['Santos', 435000],
    ['São José do Rio Preto', 470000],
    ['Jundiaí', 430000],
  ]],
  ['SE', 'Sergipe', 'nordeste', [
    ['Aracaju', 670000],
    ['Lagarto', 105000],
    ['Itabaiana', 100000],
  ]],
  ['TO', 'Tocantins', 'norte', [
    ['Palmas', 310000],
    ['Araguaína', 185000],
    ['Gurupi', 88000],
  ]],
];

export const statesData: StateData[] = RAW.map(([code, name, region, cities]) => ({
  code,
  name,
  region,
  cities: generateCities(region, cities),
}));

export const specialties = [
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'neurofuncional', label: 'Neurofuncional' },
  { value: 'respiratoria', label: 'Respiratória' },
  { value: 'geriatrica', label: 'Geriátrica' },
  { value: 'pediatrica', label: 'Pediátrica' },
  { value: 'esportiva', label: 'Esportiva' },
  { value: 'dermatofuncional', label: 'Dermatofuncional' },
  { value: 'pelvica', label: 'Pélvica' },
];

const specialtyModifiers: Record<string, number> = {
  geriatrica: 1.30,
  neurofuncional: 1.15,
  respiratoria: 1.05,
  pediatrica: 1.10,
  esportiva: 0.95,
  ortopedia: 1.00,
  dermatofuncional: 1.00,
  pelvica: 1.00,
};

export function findState(code: string): StateData | undefined {
  return statesData.find(s => s.code === code);
}

export function findCity(stateCode: string, cityName: string): CityData | undefined {
  const state = findState(stateCode);
  return state?.cities.find(c => c.name === cityName);
}

export function calculateOpportunity(
  stateCode: string,
  cityName: string,
  specialty: string,
): AnalysisResult | null {
  const state = findState(stateCode);
  const city = state?.cities.find(c => c.name === cityName);
  if (!state || !city) return null;

  const elderlyToPhysio = city.elderlyPopulation / city.physiotherapists;
  const elderlyRatio = city.elderlyPopulation / city.population;

  const baseIndex = elderlyToPhysio / 10 + elderlyRatio * 50;
  const modifier = specialtyModifiers[specialty] || 1.0;
  const opportunityIndex = Math.round(baseIndex * modifier * 10) / 10;

  const opportunityLevel = opportunityIndex >= 100 ? 'Alta' : opportunityIndex >= 50 ? 'Média' : 'Baixa';

  return {
    city: city.name,
    state: state.name,
    specialty,
    population: city.population,
    elderlyPopulation: city.elderlyPopulation,
    physiotherapists: city.physiotherapists,
    establishments: city.establishments,
    opportunityIndex,
    opportunityLevel,
  };
}
