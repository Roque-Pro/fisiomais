'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function EvolutionForm({ patientId, nextSession }: { patientId: string; nextSession: number }) {
  const router = useRouter();
  const supabase = createClient();
  const [pain, setPain] = useState(5);
  const [mobility, setMobility] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    
    const { error } = await supabase.from('evolutions').insert({
      patient_id: patientId,
      profile_id: user.id,
      session_number: nextSession,
      pain_level: pain,
      mobility_level: mobility,
      notes
    });

    setLoading(false);
    if (error) {
      setMsg({ type: 'error', text: 'Erro ao salvar: ' + error.message });
    } else {
      setMsg({ type: 'success', text: 'Evolução registrada!' });
      setNotes('');
      router.refresh();
      setTimeout(() => setMsg(null), 3000);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {msg && (
        <div className={`rounded-lg px-3 py-2 text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {msg.text}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Nível de dor: <b>{pain}</b></label>
          <input type="range" min={0} max={10} value={pain}
            onChange={(e) => setPain(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <div>
          <label className="label">Mobilidade: <b>{mobility}</b></label>
          <input type="range" min={0} max={10} value={mobility}
            onChange={(e) => setMobility(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
      </div>
      <div>
        <label className="label">Anotações da sessão</label>
        <textarea className="input min-h-[100px]" value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Como o paciente evoluiu hoje, exercícios realizados, intercorrências…" />
      </div>
      <button disabled={loading} className="btn-primary">
        <Save className="h-4 w-4" /> {loading ? 'Salvando…' : `Registrar sessão #${nextSession}`}
      </button>
    </form>
  );
}
