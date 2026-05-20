'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function DeleteAssessmentButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('assessments').delete().eq('id', assessmentId);
    
    if (error) {
      alert('Erro ao excluir avaliação: ' + error.message);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
      title="Excluir avaliação"
    >
      <Trash2 className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
    </button>
  );
}
