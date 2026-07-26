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
  User,
  Clock,
  FileCheck,
  Search,
  Target,
  ChevronDown,
  Building2,
  Smartphone,
  HelpCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

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

const faqItems = [
  { q: 'Preciso de cartão de crédito para começar?', a: 'Não. São 14 dias grátis sem qualquer pagamento. Você só decide pagar depois de testar tudo.' },
  { q: 'O Fisio+ funciona no celular?', a: 'Sim. O sistema é 100% responsivo e pode ser instalado como aplicativo no seu celular ou tablet.' },
  { q: 'Posso emitir relatórios e laudos em PDF?', a: 'Sim. Todas as avaliações, evoluções e fichas geram PDF profissional com um clique.' },
  { q: 'O sistema é seguro e protege os dados dos meus pacientes?', a: 'Sim. Seguimos a LGPD com criptografia e controle de acesso. Você é o controlador dos dados.' },
  { q: 'Tem avaliações prontas para minha especialidade?', a: 'Sim. São 6 especialidades com formulários dinâmicos: Pilates, Hidroterapia, RPG, Ortopedia, Neurofuncional e Esportiva.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Cancele a qualquer momento sem multa ou burocracia. Seus dados ficam salvos por 14 dias.' }
];

function UserCounter() {
  const [count, setCount] = useState(237);
  const [prevCount, setPrevCount] = useState(237);

  useEffect(() => {
    let lastTick = Date.now();

    function tick() {
      const now = Date.now();
      const dt = (now - lastTick) / 1000;
      lastTick = now;

      setCount(c => {
        const delta = (Math.random() - 0.5) * 0.8 * dt;
        let next = c + delta;
        if (next < 215) next = 215 + Math.random() * 5;
        if (next > 275) next = 275 - Math.random() * 5;
        return next;
      });

      scheduleNext();
    }

    function scheduleNext() {
      const delay = 800 + Math.random() * 1600;
      timeoutId = window.setTimeout(tick, delay);
    }

    let timeoutId = window.setTimeout(tick, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setPrevCount(count);
  }, [count]);

  const display = Math.round(count);
  const fluctuate = count % 1 < 0.02;

  return (
    <div className="mt-8 flex items-center justify-center gap-3 text-sm">
      <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200 shadow-sm backdrop-blur-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="font-black text-slate-900 tabular-nums min-w-[2.5ch] text-right">
          {display}
        </span>
        <span className="font-medium text-slate-500">usuários online agora</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/icon.svg" alt="Logo" className="h-9 w-9 md:h-10 md:w-10 rounded-lg shadow-sm transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Fisio+</span>
          </Link>

          <div className="flex items-center gap-4">
            {authLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-slate-100" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
                >
                  Acessar
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

      {/* HERO */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[55%] bg-sky-100/50 blur-[140px] rounded-full" />
          <div className="absolute bottom-[5%] right-[-5%] w-[45%] h-[50%] bg-indigo-100/40 blur-[140px] rounded-full" />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <UserCounter />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-6 md:mb-8">
              <Sparkles className="h-3.5 w-3.5" /> Software para fisioterapia
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] text-balance">
              Atenda mais pacientes com{' '}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                menos burocracia
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
              Prontuário digital, fichas de avaliação prontas, evolução por sessão com gráficos e relatórios em PDF. 
              O sistema para clínica de fisioterapia que organiza tudo em um só lugar.
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/cadastro" className="group inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-10 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] shadow-xl shadow-slate-900/20">
                Começar grátis <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-base transition-all hover:border-slate-300 hover:-translate-y-1">
                Já tenho conta
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-bold">
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> 14 dias grátis
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Sem cartão de crédito
              </span>
              <span className="inline-flex items-center gap-1.5 text-sky-600">
                <CheckCircle2 className="h-4 w-4" /> Apenas R$39,90/mês
              </span>
              <span className="inline-flex items-center gap-1.5 text-sky-600">
                <CheckCircle2 className="h-4 w-4" /> Cancele quando quiser
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              O que você ganha usando o{' '}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Fisio+</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Chega de papel, planilhas e pastas físicas. Seu consultório totalmente digital.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative rounded-[2rem] border-4 border-white bg-white/40 p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100/50 text-rose-500 transition-transform group-hover:scale-110">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Pare de perder tempo com papel</h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                Fichas, anamneses e relatórios 100% digitais. O tempo que você gastava organizando pastas, você usa para atender.
              </p>
            </div>

            <div className="group relative rounded-[2rem] border-4 border-white bg-white/40 p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100/50 text-sky-500 transition-transform group-hover:scale-110">
                <FileCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Avaliações prontas para usar</h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                Não precisa criar fichas do zero. São 6 especialidades com formulários dinâmicos e escalas validadas integradas.
              </p>
            </div>

            <div className="group relative rounded-[2rem] border-4 border-white bg-white/40 p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/50 text-amber-500 transition-transform group-hover:scale-110">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">PDFs profissionais em segundos</h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                Avaliações, evoluções e relatórios em PDF com um clique. Compartilhe com médicos, convênios e pacientes.
              </p>
            </div>

            <div className="group relative rounded-[2rem] border-4 border-white bg-white/40 p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100/50 text-emerald-500 transition-transform group-hover:scale-110">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Evolução com histórico completo</h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                Registre dor e mobilidade a cada sessão. Acompanhe a evolução com gráficos no dashboard e decida com dados objetivos.
              </p>
            </div>

            <div className="group relative rounded-[2rem] border-4 border-white bg-white/40 p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100/50 text-indigo-500 transition-transform group-hover:scale-110">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Dados seguros e protegidos</h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                Criptografia ponta-a-ponta, conformidade com a LGPD. Você é o controlador dos dados dos seus pacientes.
              </p>
            </div>

            <div className="group relative rounded-[2rem] border-4 border-white bg-white/40 p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-sky-100">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100/50 text-sky-500 transition-transform group-hover:scale-110">
                <Smartphone className="h-7 w-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Funciona no celular e no computador</h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                Acesse de qualquer lugar. Instale como aplicativo no celular e use online ou offline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Comece a usar em{' '}
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">3 passos</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Rápido, simples e sem complicação.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 text-2xl font-black">
              1
            </div>
            <h3 className="text-xl font-black text-slate-900">Crie sua conta</h3>
            <p className="mt-3 text-base font-medium text-slate-500 leading-relaxed max-w-xs mx-auto">
              Cadastre-se grátis. Não pedimos cartão de crédito. Seus 14 dias começam agora.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 text-2xl font-black">
              2
            </div>
            <h3 className="text-xl font-black text-slate-900">Cadastre seus pacientes</h3>
            <p className="mt-3 text-base font-medium text-slate-500 leading-relaxed max-w-xs mx-auto">
              Adicione pacientes, preencha a anamnese e escolha a especialidade para a avaliação.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-2xl font-black">
              3
            </div>
            <h3 className="text-xl font-black text-slate-900">Atenda e evolua</h3>
            <p className="mt-3 text-base font-medium text-slate-500 leading-relaxed max-w-xs mx-auto">
              Registre cada sessão, acompanhe a evolução com gráficos e gere PDFs quando precisar.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/cadastro" className="group inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-10 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] shadow-xl shadow-slate-900/20">
            Começar grátis <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* RECURSOS PRINCIPAIS */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Tudo que você precisa em{' '}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">um só lugar</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Um sistema completo para fisioterapeuta com prontuário digital, fichas de avaliação, evoluções e relatórios.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Heart, t: 'Prontuário Digital', d: 'Cadastro completo com dados pessoais, histórico clínico, medicações e queixa principal — tudo organizado por paciente.', color: 'text-rose-500', bg: 'bg-rose-100/50' },
              { Icon: ClipboardCheck, t: 'Ficha de Avaliação', d: 'Avaliações prontas para 6 especialidades: Pilates, Hidroterapia, RPG, Ortopedia, Neurofuncional e Esportiva. Cada uma com campos específicos.', color: 'text-sky-500', bg: 'bg-sky-100/50' },
              { Icon: BarChart3, t: 'Evolução por Sessão', d: 'Registre dor e mobilidade a cada sessão com gráfico no dashboard. Acompanhe a evolução do paciente em tempo real.', color: 'text-emerald-500', bg: 'bg-emerald-100/50' },
              { Icon: FileText, t: 'Relatórios em PDF', d: 'Avaliações, evoluções e documentos em PDF com um clique. Pronto para compartilhar com médicos, pacientes e convênios.', color: 'text-amber-500', bg: 'bg-amber-100/50' },
              { Icon: ShieldCheck, t: 'LGPD & Segurança', d: 'Criptografia ponta-a-ponta, RLS e conformidade com a LGPD. Você é o controlador dos dados dos seus pacientes.', color: 'text-sky-500', bg: 'bg-sky-100/50' },
              { Icon: Users2, t: 'Sistema de Indicação', d: 'Código de indicação único para cada profissional. Convide colegas e acompanhe suas referências direto no sistema.', color: 'text-teal-500', bg: 'bg-teal-100/50' },
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
        </div>
      </section>

      {/* AVALIAÇÕES POR ESPECIALIDADE */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Avaliações para{' '}
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">6 especialidades</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Ficha de avaliação fisioterapêutica completa com formulários dinâmicos adaptados para cada área de atuação.
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
      </section>

      {/* ESCALAS */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Mais de{' '}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">20 escalas</span>{' '}
              validadas integradas
            </h2>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              O modelo de ficha de avaliação fisioterapêutica mais completo, com escalas internacionalmente validadas.
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
            Inclui EVA, Escala Numérica de Dor, Faces, Oxford/MRC, Borg, Goniometria, Berg, TUG, Lysholm, IKDC, WOMAC, DASH, SPADI, Oswestry, Roland Morris, Harris Hip, Barthel, MIF, Katz, Ashworth, UPDRS, Hoehn & Yahr, GMFM, Denver II, GMFCS, LEFS e mais.
          </p>
        </div>
      </section>

      {/* MAPA DE DEMANDAS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-600 via-indigo-600 to-rose-600 p-0.5 shadow-2xl">
          <div className="relative rounded-[calc(2.5rem-1px)] bg-gradient-to-br from-sky-600 via-indigo-600 to-rose-600 p-8 md:p-14">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative grid md:grid-cols-2 gap-8 md:gap-14 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Bônus Exclusivo
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight text-balance">
                  Mapa de Demandas da Fisioterapia
                </h2>

                <p className="text-base md:text-lg text-white/85 font-medium leading-relaxed">
                  Descubra regiões com maior potencial de atendimento utilizando dados oficiais do IBGE, CNES e DataSUS. 
                  Além da análise de mercado, você recebe estratégias de marketing e captação de pacientes para cada especialidade.
                </p>

                <ul className="space-y-3">
                  {[
                    'População, idosos e concorrência por cidade',
                    'Índice de oportunidade por especialidade',
                    'Insights gerados por IA',
                    'Estratégias de marketing e captação de pacientes',
                    'Grátis para usuários do Fisio+'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm md:text-base text-white/80 font-medium">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-400/30 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-300" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link href="/mapa-de-demandas" className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-black text-slate-900 transition-all hover:bg-slate-50 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]">
                  Acessar mapa completo
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="hidden md:block relative">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-rose-400" />
                    </div>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Dados em tempo real</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'População analisada', value: '213,8 mi' },
                      { label: 'Cidades mapeadas', value: '5.570' },
                      { label: 'Especialidades', value: '6' },
                      { label: 'Fontes oficiais', value: 'IBGE · DATASUS · CNES' }
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-white/70 font-medium">{label}</span>
                        <span className="text-sm font-black text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" /> LGPD & Proteção de Dados
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight text-balance">
                Seus dados{' '}
                <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">seguros e protegidos</span>
              </h2>
              <p className="text-lg text-slate-600 font-medium">
                Sua clínica 100% digital sem preocupação com segurança. Criptografia, controle de acesso e conformidade total com a LGPD.
              </p>
              <ul className="space-y-4">
                {[
                  'Criptografia ponta-a-ponta em todos os dados dos pacientes',
                  'RLS (Row-Level Security): cada profissional vê apenas seus pacientes',
                  'Conformidade com a Lei Geral de Proteção de Dados (LGPD)',
                  'Backup automático e proteção contra perda de dados',
                  'Você é o controlador — os dados são seus, não nossos'
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
                <div className="absolute -inset-4 bg-gradient-to-r from-sky-400 via-indigo-400 to-rose-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-35 transition duration-1000"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
                  <img
                    src="/c-4.jpg"
                    alt="Segurança de dados"
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tl from-slate-900/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-[220px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">LGPD</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">Proteção de dados integrada.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Planos que{' '}
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">cabem no seu bolso</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Comece com 14 dias grátis, sem compromisso. Depois, apenas R$ 39,90/mês.
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
                <p className="text-sm text-slate-500 font-medium">14 dias de avaliação gratuita</p>
              </div>
              <div>
                <span className="text-4xl font-black text-slate-900">R$ 0</span>
                <span className="text-sm text-slate-500"> / 14 dias</span>
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

      {/* FAQ */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Dúvidas{' '}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">frequentes</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Tudo que você precisa saber antes de começar.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="group rounded-2xl border-2 border-white bg-white/60 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                >
                  <span className="text-base md:text-lg font-bold text-slate-900">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 md:px-8 pb-6 md:pb-8">
                    <p className="text-base text-slate-600 font-medium leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FISIO NEWS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28">
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 md:pb-8 gap-4">
          <div className="space-y-2">
            <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
              <span className="bg-sky-500 p-2 rounded-xl text-white"><Newspaper className="h-5 w-5 md:h-6 md:w-6" /></span>
              FISIO NEWS
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-md">Fique por dentro das atualizações do mundo da fisioterapia.</p>
          </div>
          <Link href="/cadastro" className="flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors">
            Ver todas no sistema <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentNews.length > 0 ? (
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recentNews.map((item) => (
              <div key={item.id} className="group flex flex-col h-full rounded-3xl p-6 md:p-8 transition-all duration-300 border border-white bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-sm hover:shadow-2xl hover:bg-white hover:-translate-y-2 relative overflow-hidden">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-tighter px-2 md:px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 truncate">
                      <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                      <span className="truncate">{item.source}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                      <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      {new Date(item.published_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Link href="/cadastro" className="block group/title">
                    <h3 className="font-bold text-lg md:text-xl leading-tight text-slate-900 group-hover/title:text-sky-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs md:text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex items-center justify-between">
                  <Link href="/cadastro" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black text-sky-600 transition-all hover:translate-x-1">
                    LER NO SISTEMA
                    <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Link>
                  <button
                    onClick={() => handleShare(item.title)}
                    className="p-2 bg-slate-100 hover:bg-sky-500 hover:text-white rounded-full transition-all"
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

      {/* CTA FINAL */}
      <section className="bg-gradient-to-br from-sky-600 via-indigo-600 to-rose-600 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight text-balance">
            Pronto para transformar sua prática clínica?
          </h2>
          <p className="mt-6 text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto">
            Junte-se a outros fisioterapeutas que já estão usando o Fisio+ para organizar a gestão e focar no atendimento.
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
            <Sparkles className="h-4 w-4" /> 14 dias grátis · Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-4 border-white bg-white/30 py-8 md:py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <img src="/icon.svg" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 rounded-xl" />
            <div className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              Fisio+ <span className="mx-1">·</span> Software para Fisioterapia
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