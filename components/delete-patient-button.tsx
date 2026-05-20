'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function DeletePatientButton({ patientId, patientName }: { patientId: string, patientName: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir o paciente "${patientName}"? Todos os dados de avaliações e evoluções também serão apagados.`)) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('patients').delete().eq('id', patientId);
    
    if (error) {
      alert('Erro ao excluir: ' + error.message);
      setLoading(false);
    } else {
      router.push('/pacientes');
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-ghost text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      title="Excluir paciente"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? 'Excluindo...' : 'Excluir Paciente'}
    </button>
  );
}
