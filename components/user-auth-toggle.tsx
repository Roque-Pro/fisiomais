'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserAuthToggle({ profileId, currentStatus }: { profileId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const isAuthorized = currentStatus === 'active';
  const supabase = createClient();
  const router = useRouter();

  async function toggleAuth() {
    setLoading(true);
    const newStatus = isAuthorized ? 'trial' : 'active';
    const { data, error } = await supabase
      .from('profiles')
      .update({ plan_status: newStatus })
      .eq('id', profileId)
      .select();
    
    if (error) {
      alert('Erro ao atualizar status: ' + error.message);
      console.error('Update error:', error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggleAuth}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        isAuthorized 
          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
      } disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isAuthorized ? (
        <ShieldCheck className="h-3.5 w-3.5" />
      ) : (
        <ShieldAlert className="h-3.5 w-3.5" />
      )}
      {isAuthorized ? 'Bloquear' : 'Desbloquear'}
    </button>
  );
}
