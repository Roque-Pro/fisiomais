'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPatientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '', birthdate: '', gender: '', whatsapp: '', email: '',
    address: '', occupation: '', chief_complaint: '', functional_objective: '', objective_assessment: '', 
    medical_history: '', medications: ''
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Sessão expirada.'); setLoading(false); return; }
    const payload = { ...form, birthdate: form.birthdate || null, profile_id: user.id };
    const { data, error } = await supabase.from('patients').insert(payload).select('id').single();
    setLoading(false);
    if (error) return setError(error.message);
    router.push(`/pacientes/${data.id}`);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/pacientes" className="btn-ghost"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-2xl font-bold text-brand-900">Novo paciente</h1>
      </div>

      <form onSubmit={onSubmit} className="card space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Nome completo *</label>
            <input className="input" required value={form.full_name} onChange={set('full_name')} />
          </div>
          <div>
            <label className="label">Data de nascimento</label>
            <input className="input" type="date" value={form.birthdate} onChange={set('birthdate')} />
          </div>
          <div>
            <label className="label">Gênero</label>
            <select className="input" value={form.gender} onChange={set('gender')}>
              <option value="">Selecione…</option>
              <option>Feminino</option><option>Masculino</option><option>Outro</option>
            </select>
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input className="input" value={form.whatsapp} onChange={set('whatsapp')} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Endereço</label>
            <input className="input" value={form.address} onChange={set('address')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Profissão</label>
            <input className="input" value={form.occupation} onChange={set('occupation')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Queixa principal</label>
            <textarea className="input min-h-[80px]" value={form.chief_complaint} onChange={set('chief_complaint')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Objetivo funcional</label>
            <textarea className="input min-h-[80px]" value={form.functional_objective} onChange={set('functional_objective')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Avaliação objetiva</label>
            <textarea className="input min-h-[80px]" value={form.objective_assessment} onChange={set('objective_assessment')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Histórico médico</label>
            <textarea className="input min-h-[80px]" value={form.medical_history} onChange={set('medical_history')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Medicações em uso</label>
            <textarea className="input min-h-[60px]" value={form.medications} onChange={set('medications')} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2">
          <Link href="/pacientes" className="btn-secondary">Cancelar</Link>
          <button disabled={loading} className="btn-primary">
            <Save className="h-4 w-4" /> {loading ? 'Salvando…' : 'Salvar paciente'}
          </button>
        </div>
      </form>
    </>
  );
}
