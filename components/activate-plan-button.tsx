'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function ActivatePlanButton({ profileId, currentStatus }: { profileId: string, currentStatus: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    const isActivating = currentStatus !== 'active';
    const message = isActivating 
      ? 'Deseja ativar o plano deste profissional? Ele terá acesso ilimitado.'
      : 'Deseja reverter o plano para teste?';

    if (!confirm(message)) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ plan_status: isActivating ? 'active' : 'trial' })
      .eq('id', profileId);
    
    if (error) {
      alert('Erro ao atualizar: ' + error.message);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleActivate}
      disabled={loading}
      className={`chip flex items-center gap-1 cursor-pointer transition-colors ${
        currentStatus === 'active' 
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
      title={currentStatus === 'active' ? 'Plano Ativo' : 'Ativar Plano'}
    >
      <CheckCircle className={`h-3 w-3 ${currentStatus === 'active' ? 'fill-emerald-700 text-emerald-100' : ''}`} />
      {loading ? '...' : currentStatus === 'active' ? 'Ativo' : 'Ativar'}
    </button>
  );
}
