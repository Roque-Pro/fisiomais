'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Users,
  Heart,
  UserCheck,
  Building2,
  TrendingUp,
  Target,
  ArrowRight,
  Sparkles,
  Check,
  ChevronDown,
  RotateCcw,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { statesData, specialties, findState, calculateOpportunity } from '@/lib/opportunity-data';
import type { AnalysisResult } from '@/lib/opportunity-data';
import { createClient } from '@/lib/supabase/client';
import AuthModal from './auth-modal';

const levelConfig = {
  Alta: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Alta' },
  Média: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Média' },
  Baixa: { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Baixa' },
};

function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}

export default function OpportunityMap() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => {
    const state = findState(selectedState);
    return state?.cities || [];
  }, [selectedState]);

  const canAnalyze = selectedState && selectedCity && selectedSpecialty;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const res = calculateOpportunity(selectedState, selectedCity, selectedSpecialty);
    setResult(res);
    setInsight(null);
  };

  const handleReset = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedSpecialty('');
    setResult(null);
    setInsight(null);
  };

  useEffect(() => {
    setSelectedCity('');
    setResult(null);
  }, [selectedState]);

  useEffect(() => {
    setResult(null);
  }, [selectedCity, selectedSpecialty]);

  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  useEffect(() => {
    if (!result) return;

    async function fetchInsight() {
      setLoadingInsight(true);
      try {
        const response = await fetch('/api/opportunity/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        });
        if (response.ok) {
          const data = await response.json();
          setInsight(data.insight);
        }
      } catch {
        setInsight(null);
      } finally {
        setLoadingInsight(false);
      }
    }

    fetchInsight();
  }, [result]);

  return (
    <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[55%] bg-sky-100/50 blur-[140px] rounded-full" />
        <div className="absolute bottom-[5%] right-[-5%] w-[45%] h-[50%] bg-indigo-100/40 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-rose-100/30 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-5 mb-10 md:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] text-balance">
              Mapa de Demandas
              <br />
              <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-rose-600 bg-clip-text text-transparent">
                para Fisioterapeutas
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
              Descubra as <strong className="text-slate-700">melhores cidades para trabalhar como fisioterapeuta</strong> com base em dados demográficos, concorrência local e potencial de mercado. 
              Uma <strong className="text-slate-700">ferramenta gratuita de inteligência de mercado</strong> para você decidir onde atuar com mais oportunidades e menos concorrência.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl md:rounded-[2rem] shadow-2xl shadow-sky-100/40 border border-white/80 p-6 md:p-10">
            <div className="grid md:grid-cols-3 gap-4 md:gap-5">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  Estado
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={e => setSelectedState(e.target.value)}
                    className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm font-semibold text-slate-800 transition-all hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none"
                  >
                    <option value="">Selecione o estado</option>
                    {statesData.map(s => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <Building2 className="h-3.5 w-3.5 text-sky-500" />
                  Cidade
                </label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm font-semibold text-slate-800 transition-all hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">{selectedState ? 'Selecione a cidade' : 'Primeiro selecione o estado'}</option>
                    {cities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <Target className="h-3.5 w-3.5 text-sky-500" />
                  Especialidade
                </label>
                <div className="relative">
                  <select
                    value={selectedSpecialty}
                    onChange={e => setSelectedSpecialty(e.target.value)}
                    className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm font-semibold text-slate-800 transition-all hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none"
                  >
                    <option value="">Selecione a especialidade</option>
                    {specialties.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-10 py-4 text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <Search className="h-5 w-5" />
                Analisar Oportunidade
              </button>
              {result && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-6 py-4 text-sm font-bold text-slate-500 transition-all hover:border-slate-300 hover:text-slate-700 active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Nova consulta
                </button>
              )}
            </div>
          </div>

          {result && (
            <div ref={resultsRef} className="mt-8 md:mt-10 space-y-6 md:space-y-8" style={{animation: 'fadeInUp 0.6s ease-out'}}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <IndicatorCard
                  icon={Users}
                  label="População"
                  value={formatNumber(result.population)}
                  color="text-sky-600"
                  bg="bg-sky-50"
                />
                <IndicatorCard
                  icon={Heart}
                  label="População Idosa"
                  value={formatNumber(result.elderlyPopulation)}
                  suffix={`(${((result.elderlyPopulation / result.population) * 100).toFixed(1)}%)`}
                  color="text-rose-600"
                  bg="bg-rose-50"
                />
                <IndicatorCard
                  icon={UserCheck}
                  label="Fisioterapeutas (estim.)"
                  value={formatNumber(result.physiotherapists)}
                  color="text-indigo-600"
                  bg="bg-indigo-50"
                />
                <IndicatorCard
                  icon={Building2}
                  label="Estabelecimentos (estim.)"
                  value={formatNumber(result.establishments)}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
                <IndicatorCard
                  icon={TrendingUp}
                  label="Índice de Oportunidade"
                  value={String(result.opportunityIndex)}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
                <div className="group relative rounded-2xl border-2 border-white bg-white/60 p-4 md:p-5 shadow-lg shadow-slate-200/40 backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl hover:shadow-sky-100/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="inline-flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-violet-50">
                      <Target className="h-3.5 w-3.5 md:h-4 md:w-4 text-violet-600" />
                    </div>
                    <span className="text-[11px] md:text-xs font-black text-slate-500 uppercase tracking-wider">
                      Nível da Oportunidade
                    </span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm md:text-base font-black ${levelConfig[result.opportunityLevel].bg} ${levelConfig[result.opportunityLevel].border} ${levelConfig[result.opportunityLevel].color}`}>
                    <div className={`h-2.5 w-2.5 rounded-full ${result.opportunityLevel === 'Alta' ? 'bg-emerald-500' : result.opportunityLevel === 'Média' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    {result.opportunityLevel}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] font-bold text-slate-400">
                <span className="text-slate-300 tracking-wider uppercase">Dados oficiais:</span>
                <span className="text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">IBGE</span>
                <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">DATASUS</span>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">CNES</span>
              </div>

              {insight && (
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 md:p-7 shadow-lg shadow-indigo-100/30">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <Lightbulb className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-wider">Insight da Análise</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">gerado por IA</span>
                      </div>
                      <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium italic">
                        &ldquo;{insight}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {loadingInsight && (
                <div className="flex items-center justify-center gap-3 py-6 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Gerando insight com IA...</span>
                </div>
              )}

              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-rose-600 p-0.5 shadow-2xl">
                <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-sky-600 via-indigo-600 to-rose-600 p-8 md:p-10 text-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                  <div className="relative space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 text-xs font-black uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" /> Conversão Gratuita
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight text-balance">
                      Gostou da análise?
                    </h3>
                    <p className="text-base md:text-lg text-white/85 font-medium max-w-lg mx-auto leading-relaxed">
                      Organize seus pacientes, prontuários e evoluções gratuitamente por 30 dias.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                      <Link
                        href="/cadastro"
                        className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-black text-slate-900 transition-all hover:bg-slate-50 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        Começar grátis
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-white/25 text-white font-bold text-sm transition-all hover:bg-white/10 hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        Já tenho conta
                      </Link>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-white/70 font-medium">
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      30 dias grátis · Sem cartão de crédito · Cancele quando quiser
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </section>
  );
}

function IndicatorCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  suffix?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="group relative rounded-2xl border-2 border-white bg-white/60 p-4 md:p-5 shadow-lg shadow-slate-200/40 backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl hover:shadow-sky-100/30">
      <div className="flex items-center gap-2 mb-2">
        <div className={`inline-flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${color}`} />
        </div>
        <span className="text-[11px] md:text-xs font-black text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {suffix && (
          <span className="text-[11px] md:text-xs font-bold text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
