'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Edit2, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  patientId: string;
  initialData: {
    chief_complaint?: string | null;
    functional_objective?: string | null;
    objective_assessment?: string | null;
  };
};

export function PatientGoalsForm({ patientId, initialData }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialData);
  const router = useRouter();
  const supabase = createClient();

  async function save() {
    setLoading(true);
    const { error } = await supabase
      .from('patients')
      .update({
        chief_complaint: form.chief_complaint,
        functional_objective: form.functional_objective,
        objective_assessment: form.objective_assessment
      })
      .eq('id', patientId);

    if (!error) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
    setLoading(false);
  }

  if (!isEditing) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-900">Identificação e Objetivos</h2>
          <button onClick={() => setIsEditing(true)} className="btn-secondary py-1 px-3 text-xs flex items-center gap-1">
            <Edit2 className="h-3 w-3" /> Editar
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Queixa principal</div>
            <p className="text-sm text-slate-700">{form.chief_complaint || '—'}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Objetivo funcional</div>
            <p className="text-sm text-slate-700">{form.functional_objective || '—'}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Avaliação objetiva</div>
            <p className="text-sm text-slate-700">{form.objective_assessment || '—'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-brand-200 bg-brand-50/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-900">Editar Identificação e Objetivos</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="label text-xs">Queixa principal</label>
          <textarea 
            className="input min-h-[60px] text-sm" 
            value={form.chief_complaint ?? ''} 
            onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
          />
        </div>
        <div>
          <label className="label text-xs">Objetivo funcional</label>
          <textarea 
            className="input min-h-[60px] text-sm" 
            value={form.functional_objective ?? ''} 
            onChange={(e) => setForm({ ...form, functional_objective: e.target.value })}
          />
        </div>
        <div>
          <label className="label text-xs">Avaliação objetiva</label>
          <textarea 
            className="input min-h-[60px] text-sm" 
            value={form.objective_assessment ?? ''} 
            onChange={(e) => setForm({ ...form, objective_assessment: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <button onClick={save} disabled={loading} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Salvar Objetivos
          </button>
        </div>
      </div>
    </div>
  );
}
