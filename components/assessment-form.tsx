'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { specialtyMap, type Field, type Specialty } from '@/lib/specialties';
import { downloadAssessmentPdf } from '@/lib/pdf';

type Props = {
  patientId: string;
  specialtyId: string;
  patient: any;
  initialData?: Record<string, any>;
  initialNotes?: string;
  assessmentId?: string;
};

export function AssessmentForm({ patientId, specialtyId, patient, initialData, initialNotes, assessmentId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const sp = specialtyMap[specialtyId] as Specialty | undefined;
  const [data, setData] = useState<Record<string, any>>(initialData ?? {});
  const [notes, setNotes] = useState<string>(initialNotes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | undefined>(assessmentId);

  if (!sp) return <p className="text-rose-600">Especialidade não encontrada.</p>;

  const set = (k: string, v: any) => setData({ ...data, [k]: v });

  async function save(stay = false) {
    setLoading(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Sessão expirada.'); setLoading(false); return; }
    if (savedId) {
      const { error } = await supabase.from('assessments')
        .update({ data, notes }).eq('id', savedId);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { data: ins, error } = await supabase.from('assessments').insert({
        patient_id: patientId, profile_id: user.id,
        specialty: specialtyId, data, notes,
        title: `Avaliação ${sp?.name ?? specialtyId}`
      }).select('id').single();
      if (error) { setError(error.message); setLoading(false); return; }
      setSavedId(ins.id);
    }
    setLoading(false);
    if (!stay) router.push(`/pacientes/${patientId}`);
  }

  async function generatePdf() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) return;
    downloadAssessmentPdf({
      profile,
      patient,
      assessment: { specialty: specialtyId, data, notes, created_at: new Date().toISOString() }
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(false); }} className="space-y-5">
      {sp.sections.map((sec) => (
        <div key={sec.title} className="card">
          <h3 className="mb-4 text-base font-semibold text-brand-900">{sec.title}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {sec.fields.map((f) => (
              <FieldRenderer key={f.key} f={f} value={data[f.key]} onChange={(v) => set(f.key, v)} />
            ))}
          </div>
        </div>
      ))}

      <div className="card">
        <label className="label">Observações livres da fisioterapeuta</label>
        <textarea className="input min-h-[100px]" value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionais, condutas, recomendações…" />
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={generatePdf} className="btn-secondary">
          <FileDown className="h-4 w-4" /> Gerar PDF
        </button>
        <button type="button" onClick={() => save(true)} disabled={loading} className="btn-secondary">
          <Save className="h-4 w-4" /> Salvar
        </button>
        <button disabled={loading} className="btn-primary">
          <Save className="h-4 w-4" /> {loading ? 'Salvando…' : 'Salvar e voltar'}
        </button>
      </div>
    </form>
  );
}

function FieldRenderer({ f, value, onChange }: { f: Field; value: any; onChange: (v: any) => void }) {
  const wrap = (children: React.ReactNode) => (
    <div className={f.type === 'textarea' || f.type === 'checkbox-group' ? 'md:col-span-2' : ''}>
      <div className="mb-1 flex items-center justify-between">
        <label className="label mb-0">{f.label}</label>
        {f.category && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {f.category}
          </span>
        )}
      </div>
      {children}
      {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
    </div>
  );

  switch (f.type) {
    case 'text':
      return wrap(<input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />);
    case 'textarea':
      return wrap(<textarea className="input min-h-[80px]" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />);
    case 'number':
      return wrap(<input type="number" className="input" min={f.min} max={f.max} value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />);
    case 'date':
      return wrap(<input type="date" className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />);
    case 'select':
      return wrap(
        <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecione…</option>
          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case 'scale': {
      const v = typeof value === 'number' ? value : f.min ?? 0;
      return wrap(
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>{f.min ?? 0}</span>
            <b className="text-brand-700">{v}</b>
            <span>{f.max ?? 10}</span>
          </div>
          <input type="range" min={f.min ?? 0} max={f.max ?? 10} value={v}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-brand-600" />
        </div>
      );
    }
    case 'dynamic-scale': {
      const scales = f.scales || [];
      const currentScaleName = typeof value === 'object' ? value?.scale : (scales[0]?.name || '');
      const currentValue = typeof value === 'object' ? value?.value : (scales[0]?.min || 0);
      const currentScale = scales.find(s => s.name === currentScaleName) || scales[0];

      if (!currentScale) return wrap(<p className="text-xs text-slate-400">Nenhuma escala definida.</p>);

      return wrap(
        <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Escala:</span>
            <select 
              className="flex-1 rounded border-slate-200 bg-white py-1 text-xs focus:ring-brand-500"
              value={currentScaleName}
              onChange={(e) => {
                const nextScale = scales.find(s => s.name === e.target.value);
                onChange({ scale: e.target.value, value: nextScale?.min || 0 });
              }}
            >
              {scales.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>{currentScale.min}</span>
              <b className="text-brand-700">{currentValue}</b>
              <span>{currentScale.max}</span>
            </div>
            <input 
              type="range" 
              min={currentScale.min} 
              max={currentScale.max} 
              step={currentScale.step ?? 1}
              value={currentValue}
              onChange={(e) => onChange({ scale: currentScaleName, value: Number(e.target.value) })}
              className="w-full accent-brand-600" 
            />
            {currentScale.labels && currentScale.labels[currentValue] && (
              <p className="mt-1 text-center text-[10px] font-medium text-brand-600">
                {currentScale.labels[currentValue]}
              </p>
            )}
          </div>
        </div>
      );
    }
    case 'checkbox-group': {
      const arr: string[] = Array.isArray(value) ? value : [];
      return wrap(
        <div className="flex flex-wrap gap-2">
          {f.options?.map((o) => {
            const active = arr.includes(o);
            return (
              <button key={o} type="button"
                onClick={() => onChange(active ? arr.filter((x) => x !== o) : [...arr, o])}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition
                  ${active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'}`}>
                {o}
              </button>
            );
          })}
        </div>
      );
    }
  }
}
