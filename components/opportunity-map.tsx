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
    <div className="space-y-6 fade-up">
      <div className="space-y-1">
        <h1 className="flex items-center gap-3 text-2xl font-black text-brand-900 md:text-3xl tracking-tight">
          <div className="h-8 w-1.5 bg-sky-500 rounded-full"></div>
          Mapa de Demandas
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Descubra as melhores cidades para trabalhar como fisioterapeuta com base em dados demográficos, 
          concorrência local e potencial de mercado.
        </p>
      </div>

      <div className="card">
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          <div className="space-y-2">
            <label className="label">
              <MapPin className="h-3.5 w-3.5 text-brand-500 inline mr-1" />
              Estado
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="input appearance-none pr-10"
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
            <label className="label">
              <Building2 className="h-3.5 w-3.5 text-brand-500 inline mr-1" />
              Cidade
            </label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                className="input appearance-none pr-10 disabled:opacity-40 disabled:cursor-not-allowed"
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
            <label className="label">
              <Target className="h-3.5 w-3.5 text-brand-500 inline mr-1" />
              Especialidade
            </label>
            <div className="relative">
              <select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                className="input appearance-none pr-10"
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

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="btn-primary w-full sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Analisar Oportunidade
          </button>
          {result && (
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Nova consulta
            </button>
          )}
        </div>
      </div>

      {result && (
        <div ref={resultsRef} className="space-y-6 fade-up">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            <div className="card flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
                  <Target className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Nível da Oportunidade
                </span>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-black ${levelConfig[result.opportunityLevel].bg} ${levelConfig[result.opportunityLevel].border} ${levelConfig[result.opportunityLevel].color}`}>
                <div className={`h-2.5 w-2.5 rounded-full ${result.opportunityLevel === 'Alta' ? 'bg-emerald-500' : result.opportunityLevel === 'Média' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                {result.opportunityLevel}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-bold text-slate-400">
            <span className="text-slate-300 tracking-wider uppercase">Dados oficiais:</span>
            <span className="chip">IBGE</span>
            <span className="chip">DATASUS</span>
            <span className="chip">CNES</span>
          </div>

          {insight && (
            <div className="card bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-100">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                  <Lightbulb className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-wider">Insight da Análise</span>
                    <span className="chip">gerado por IA</span>
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
        </div>
      )}

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
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
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {suffix && (
          <span className="text-xs font-bold text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}