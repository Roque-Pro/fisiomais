'use client';

import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Users2,
  Heart,
  ClipboardCheck,
  ArrowRight,
  Newspaper,
  Calendar,
  MapPin,
  ChevronRight,
  Share2,
  Flower2,
  Waves,
  Accessibility,
  Bone,
  Brain,
  Trophy,
  FileText,
  Palette,
  BarChart3,
  UserCheck,
  Star,
  Check,
  LogOut,
  User
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import OpportunityMap from '@/components/opportunity-map';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  published_at: string;
}

const specialties = [
  { icon: Flower2, name: 'Pilates', desc: 'Postura, core, flexibilidade e controle motor', color: 'text-sky-500', bg: 'bg-sky-100/50' },
  { icon: Waves, name: 'Hidroterapia', desc: 'Fisioterapia aquática para reabilitação', color: 'text-cyan-500', bg: 'bg-cyan-100/50' },
  { icon: Accessibility, name: 'RPG', desc: 'Reeducação Postural Global e cadeias musculares', color: 'text-teal-500', bg: 'bg-teal-100/50' },
  { icon: Bone, name: 'Traumato-Ortopedia', desc: 'ADM, força muscular e testes ortopédicos', color: 'text-amber-500', bg: 'bg-amber-100/50' },
  { icon: Brain, name: 'Neurofuncional', desc: 'Reabilitação neurológica (AVC, Parkinson, Pediatria)', color: 'text-indigo-500', bg: 'bg-indigo-100/50' },
  { icon: Trophy, name: 'Esportiva', desc: 'Performance, retorno ao esporte e prevenção', color: 'text-rose-500', bg: 'bg-rose-100/50' }
];

const scales = [
  { name: 'EVA / Dor', desc: '0-10, Numérica, Faces' },
  { name: 'Oxford/MRC', desc: 'Força muscular 0-5' },
  { name: 'Borg', desc: 'Esforço percebido' },
  { name: 'Berg / TUG', desc: 'Equilíbrio funcional' },
  { name: 'Oswestry', desc: 'Incapacidade lombar' },
  { name: 'DASH', desc: 'Membro superior' },
  { name: 'WOMAC', desc: 'Quadril e joelho' },
  { name: 'Barthel / MIF', desc: 'AVDs neurológicas' },
  { name: 'Ashworth', desc: 'Tônus muscular' },
  { name: 'UPDRS', desc: 'Parkinson' }
];

export default function Home() {
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('news')
        .select('id, title, summary, source, published_at')
        .order('published_at', { ascending: false })
        .limit(3);
      if (data) setRecentNews(data);
    }
    load();
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data?.full_name) setProfileName(data.full_name);
      }
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfileName(null);
  }

  const handleShare = (title: string) => {
    const text = encodeURIComponent(`Acabei de ver essa notícia no Fisio+: ${title}\n\nConfira no sistema: `);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://wa.me/?text=${text}${url}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-rose-100/40 blur-[120px] rounded-full" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.jpg" alt="Logo" className="h-9 w-9 md:h-10 md:w-10 rounded-lg object-cover shadow-sm transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Fisio+</span>
          </Link>

          <div className="flex items-center gap-4">
            {authLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-slate-100" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
                >
                  Painel
                </Link>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {profileName ? profileName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <span className="hidden md:block text-sm font-bold text-slate-800">
                    {profileName?.split(' ')[0] || 'Usuário'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="relative group overflow-hidden rounded-full p-[1px] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-sky-100">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 animate-gradient-x"></div>
                <div className="relative flex items-center gap-2 rounded-full bg-white px-5 py-1.5 md:px-6 md:py-2 text-sm font-bold text-slate-900 transition-colors group-hover:bg-transparent group-hover:text-white">
                  Acessar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <OpportunityMap />

      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-20 md:pb-32">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Tudo que você precisa em <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">um só lugar</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Um aplicativo completo para fisioterapeuta com ficha de anamnese, avaliações, evoluções e relatórios em PDF — o Fisio+ centraliza a gestão da sua clínica para você focar no atendimento.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { Icon: Heart, t: 'Prontuário Digital', d: 'Cadastro completo com dados pessoais, histórico clínico, medicações, queixa principal e evolução — tudo organizado por paciente.', color: 'text-rose-500', bg: 'bg-rose-100/50' },
            { Icon: ClipboardCheck, t: 'Ficha de Avaliação', d: 'Ficha de avaliação fisioterapêutica completa para 6 especialidades: Pilates, Hidroterapia, RPG, Ortopedia, Neurofuncional e Esportiva.', color: 'text-sky-500', bg: 'bg-sky-100/50' },
            { Icon: BarChart3, t: 'Evolução por Sessão', d: 'Sistema de evolução fisioterapia completo: registre dor (0-10) e mobilidade (0-10) a cada sessão com gráfico no dashboard.', color: 'text-emerald-500', bg: 'bg-emerald-100/50' },
            { Icon: FileText, t: 'Relatórios em PDF', d: 'Avaliações, evoluções e cartão digital profissional em PDF com um clique. Compartilhe com médicos, pacientes e convênios.', color: 'text-amber-500', bg: 'bg-amber-100/50' },
            { Icon: Palette, t: 'Personalização Completa', d: 'Temas com 6 paletas de cores, seleção de fontes, arredondamento e estilo de botões. Sua identidade visual em cada detalhe.', color: 'text-indigo-500', bg: 'bg-indigo-100/50' },
            { Icon: Newspaper, t: 'Fisio News Hub', d: 'Notícias curadas do mundo da fisioterapia via RSS + IA (Google Gemini). Mantenha-se atualizado sem sair do sistema.', color: 'text-violet-500', bg: 'bg-violet-100/50' },
            { Icon: Users2, t: 'Sistema de Indicação', d: 'Código de indicação único para cada profissional. Convide colegas e acompanhe suas referências diretamente no sistema.', color: 'text-teal-500', bg: 'bg-teal-100/50' },
            { Icon: ShieldCheck, t: 'LGPD & Segurança', d: 'Criptografia ponta-a-ponta, RLS (Row-Level Security) e conformidade com a Lei Geral de Proteção de Dados. Você é o controlador.', color: 'text-sky-500', bg: 'bg-sky-100/50' },
            { Icon: Star, t: 'Cartão Digital Profissional', d: 'Cartão de visita em PDF 90x55mm com foto, CREFITO, especialidades e contatos. Compartilhe via WhatsApp direto do sistema.', color: 'text-rose-500', bg: 'bg-rose-100/50' }
          ].map(({ Icon, t, d, color, bg }) => (
            <div key={t} className="group relative rounded-[2rem] md:rounded-[2.5rem] border-4 border-white bg-white/40 p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className={`mb-6 md:mb-8 inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl md:rounded-3xl ${bg} ${color} transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                <Icon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{t}</h3>
              <p className="mt-3 md:mt-4 text-sm md:text-base font-medium leading-relaxed text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Avaliações para <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">6 especialidades</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Um sistema para fisioterapia e pilates com formulários dinâmicos adaptados para cada área de atuação, campos específicos e escalas validadas.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {specialties.map(({ icon: Icon, name, desc, color, bg }) => (
              <div key={name} className="group text-center p-6 md:p-8 rounded-[2rem] border-4 border-white bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl">
                <div className={`mx-auto mb-4 md:mb-6 inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl md:rounded-3xl ${bg} ${color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <h3 className="text-base md:text-lg font-black text-slate-900">{name}</h3>
                <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-32">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Banco de <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Escalas Profissionais</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            O modelo de ficha de avaliação fisioterapêutica mais completo, com mais de 20 escalas validadas internacionalmente integradas diretamente nos formulários.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {scales.map(({ name, desc }) => (
            <div key={name} className="group flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-white bg-white/50 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white hover:shadow-xl">
              <div className="h-2 w-2 rounded-full bg-sky-400 group-hover:bg-indigo-500 transition-colors" />
              <div className="text-left">
                <span className="text-sm font-black text-slate-900">{name}</span>
                <span className="ml-2 text-xs font-medium text-slate-400">{desc}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-slate-400 font-medium max-w-xl mx-auto">
          Inclui EVA, Escala Numérica de Dor, Faces, Oxford/MRC, Borg Modificada e Tradicional, Goniometria, Berg, TUG, Lysholm, IKDC, WOMAC, DASH, SPADI, Oswestry, Roland Morris, Harris Hip, Barthel, MIF, Katz, Ashworth, UPDRS, Hoehn & Yahr, GMFM, Denver II, GMFCS, LEFS e mais.
        </p>
      </section>

      <section className="bg-gradient-to-br from-violet-50 via-white to-sky-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Sua identidade profissional em <span className="bg-gradient-to-r from-violet-600 to-sky-600 bg-clip-text text-transparent">formato digital</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Sua carteira CREFITO digital, cartão de visita profissional e temas personalizados — tudo que você precisa para apresentar e divulgar seu trabalho.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center mb-16 md:mb-24">
            <div className="space-y-6 order-last lg:order-first">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider">
                <UserCheck className="h-3 w-3" /> Perfil Profissional
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Seus dados, sua <span className="text-violet-600">apresentação</span>
              </h3>
              <p className="text-base md:text-lg text-slate-600 font-medium">
                No <strong className="text-slate-900">Meu Perfil</strong>, você cadastra foto, nome, CREFITO, WhatsApp, e-mail, cidade, local de atendimento e biografia. Tudo o que seus pacientes precisam saber sobre você.
              </p>
              <ul className="space-y-3">
                {[
                  'Foto profissional com upload direto para o sistema',
                  'CREFITO, especialidades e bio para credibilidade',
                  'Local de atendimento e contatos visíveis',
                  'Dados usados em todos os PDFs gerados pelo sistema'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm md:text-base text-slate-700 font-medium">
                    <div className="mt-1 h-5 w-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-violet-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-400 via-sky-400 to-rose-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-35 transition duration-1000"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src="/c-1.jpg"
                    alt="Perfil profissional digital"
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tl from-slate-900/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Complete</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">Foto, CREFITO, bio, especialidades e contatos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center mb-16 md:mb-24">
            <div className="relative">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-35 transition duration-1000"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
                  <img
                    src="/c-2.PNG"
                    alt="Cartão digital profissional"
                    className="w-full h-full object-contain aspect-[4/3] p-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-[220px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">90x55mm</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">Formato padrão de cartão de visita.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <Star className="h-3 w-3" /> Cartão Digital PDF
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Seu cartão de visita <span className="text-emerald-600">profissional e moderno</span>
              </h3>
              <p className="text-base md:text-lg text-slate-600 font-medium">
                Com um clique, gere um cartão digital em PDF 90x55mm com sua foto, nome, CREFITO, especialidades, bio e contatos. Pronto para imprimir ou compartilhar.
              </p>
              <ul className="space-y-3">
                {[
                  'Design profissional com logo e marca do Fisio+',
                  'Foto circular, dados completos e bio de apresentação',
                  'Botão de download direto no perfil',
                  'Compartilhe por WhatsApp com um toque'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm md:text-base text-slate-700 font-medium">
                    <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-6 order-last lg:order-first">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Palette className="h-3 w-3" /> Personalização
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Sua clínica, sua <span className="text-indigo-600">identidade visual</span>
              </h3>
              <p className="text-base md:text-lg text-slate-600 font-medium">
                O <strong className="text-slate-900">Fisio+</strong> se adapta à sua marca. Escolha entre 6 paletas de cores pré-definidas ou monte a sua própria, selecione fontes, ajuste bordas e estilo dos botões.
              </p>
              <ul className="space-y-3">
                {[
                  '6 paletas de cores: Oceano, Rose, Floresta, Lavanda, Carvão, Coral',
                  'Seleção de fontes: Inter, Poppins, DM Sans, Playfair Display',
                  'Ajuste de arredondamento e estilo de botões',
                  'Preview ao vivo — o tema se aplica na hora'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm md:text-base text-slate-700 font-medium">
                    <div className="mt-1 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-indigo-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 pt-2">
                {['#0ea5e9', '#f43f5e', '#22c55e', '#8b5cf6', '#1e293b', '#f97316'].map((color) => (
                  <div key={color} className="h-8 w-8 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-35 transition duration-1000"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
                  <img
                    src="/c-3.PNG"
                    alt="Personalização de tema"
                    className="w-full h-full object-contain aspect-[4/3] p-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tl from-slate-900/50 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-[220px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">6 Paletas</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">Cores, fontes, bordas e botões personalizáveis.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-amber-50 via-white to-rose-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <Zap className="h-3 w-3" /> Sistema para Clínica de Fisioterapia
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight text-balance">
                Menos papel, mais <span className="bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">atendimento humanizado</span>
              </h2>
              <p className="text-lg text-slate-600 font-medium">
                Um sistema de gestão para clínica de fisioterapia que elimina a burocracia e organiza seu consultório — para você dedicar seu tempo ao que realmente importa: o paciente.
              </p>
              <ul className="space-y-4">
                {[
                  'Ficha de avaliação e anamnese 100% digital — sem papel, sem pastas físicas',
                  'Avaliações pré-formatadas por especialidade economizam horas de elaboração',
                  'Evolução com gráfico permite decisões clínicas baseadas em dados objetivos',
                  'Laudo e relatórios em PDF prontos para convênios, médicos solicitantes e pacientes',
                  'Acesso mobile e PWA — funcione de qualquer lugar, offline ou online',
                  'LGPD compliance integrado — proteção de dados sem complicação'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm md:text-base text-slate-700 font-medium">
                    <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-rose-500 to-sky-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-35 transition duration-1000"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src="/c-4.jpg"
                    alt="Fisioterapeuta atendendo"
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tl from-slate-900/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-[220px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Digital</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">100% livre de papel e arquivos físicos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-32">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Planos que <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">cabem no seu bolso</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Comece com 30 dias grátis, sem compromisso. Depois, apenas R$ 39,90/mês.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          <div className="relative rounded-[2rem] border-2 border-sky-200 bg-white/60 p-8 md:p-10 shadow-xl shadow-sky-100/50 backdrop-blur-sm">
            <div className="absolute right-0 top-0 rounded-bl-2xl rounded-tr-[2rem] bg-sky-500 px-4 py-1.5">
              <span className="text-xs font-bold text-white">Grátis</span>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Trial</h3>
                <p className="text-sm text-slate-500 font-medium">30 dias de avaliação gratuita</p>
              </div>
              <div>
                <span className="text-4xl font-black text-slate-900">R$ 0</span>
                <span className="text-sm text-slate-500"> / 30 dias</span>
              </div>
              <ul className="space-y-3">
                {['Até 10 pacientes', 'Avaliações ilimitadas', 'Evoluções ilimitadas', 'Cartão digital em PDF', 'Personalização de tema', 'Fisio News Hub'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                    <Check className="h-4 w-4 text-sky-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative rounded-[2rem] border-2 border-emerald-300 bg-white/60 p-8 md:p-10 shadow-xl shadow-emerald-100/50 backdrop-blur-sm">
            <div className="absolute right-0 top-0 rounded-bl-2xl rounded-tr-[2rem] bg-emerald-600 px-4 py-1.5">
              <span className="text-xs font-bold text-white">Popular</span>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Profissional</h3>
                <p className="text-sm text-slate-500 font-medium">Para uso profissional completo</p>
              </div>
              <div>
                <span className="text-4xl font-black text-slate-900">R$ 39,90</span>
                <span className="text-sm text-slate-500"> / mês</span>
              </div>
              <ul className="space-y-3">
                {['Pacientes ilimitados', 'Avaliações ilimitadas', 'Evoluções ilimitadas', 'Cartão digital em PDF', 'Personalização de tema', 'Fisio News Hub', 'Suporte prioritário', 'Sem limites de uso'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="group flex items-center justify-center gap-2 w-full rounded-2xl bg-slate-900 px-6 py-4 text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 active:scale-95">
                Começar grátis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Pagamento 100% seguro via Mercado Pago · Cartão, Boleto ou PIX
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-20 md:pb-32">
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 md:pb-8 gap-4">
          <div className="space-y-2">
            <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
              <span className="bg-brand-500 p-2 rounded-xl text-white"><Newspaper className="h-5 w-5 md:h-6 md:w-6" /></span>
              FISIO NEWS <span className="text-brand-500 italic">HUB</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-md">Fique por dentro das atualizações do mundo da fisioterapia — curadas por IA.</p>
          </div>
          <Link href="/cadastro" className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
            Ver todas no sistema <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentNews.length > 0 ? (
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recentNews.map((item) => (
              <div key={item.id} className="group flex flex-col h-full rounded-3xl p-6 md:p-8 transition-all duration-300 border border-white bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-sm hover:shadow-2xl hover:bg-white hover:-translate-y-2 relative overflow-hidden">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-tighter px-2 md:px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 truncate">
                      <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                      <span className="truncate">{item.source}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                      <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      {new Date(item.published_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Link href="/cadastro" className="block group/title">
                    <h3 className="font-bold text-lg md:text-xl leading-tight text-slate-900 group-hover/title:text-brand-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs md:text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex items-center justify-between">
                  <Link href="/cadastro" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black text-brand-600 transition-all hover:translate-x-1">
                    LER NO SISTEMA
                    <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Link>
                  <button
                    onClick={() => handleShare(item.title)}
                    className="p-2 bg-slate-100 hover:bg-brand-500 hover:text-white rounded-full transition-all"
                    title="Compartilhar"
                  >
                    <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-20 bg-white/40 rounded-[2rem] md:rounded-[2.5rem] border-4 border-dashed border-white px-6">
            <p className="text-slate-400 font-bold">As últimas novidades estão sendo preparadas...</p>
          </div>
        )}
      </section>

      <section className="bg-gradient-to-br from-sky-600 via-indigo-600 to-rose-600 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight text-balance">
            Pronto para transformar sua prática clínica?
          </h2>
          <p className="mt-6 text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto">
            Junte-se a outros fisioterapeutas que já estão usando o Fisio+ para modernizar sua gestão e elevar a qualidade do atendimento.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="group flex items-center gap-3 rounded-2xl bg-white px-10 py-4 text-lg font-black text-slate-900 transition-all hover:bg-slate-100 hover:shadow-2xl hover:-translate-y-1 active:scale-95">
              Começar grátis agora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-base transition-all hover:bg-white/10 hover:-translate-y-1">
              Já tenho conta
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/60 font-medium flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> 30 dias grátis · Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      <footer className="border-t-4 border-white bg-white/30 py-8 md:py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 rounded-xl object-cover" />
            <div className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              Fisio+ <span className="mx-1">·</span> Gestão Inteligente para Fisioterapeutas
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
            <Link href="/cadastro" className="hover:text-slate-600 transition-colors">Cadastre-se</Link>
            <Link href="/login" className="hover:text-slate-600 transition-colors">Acessar</Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
