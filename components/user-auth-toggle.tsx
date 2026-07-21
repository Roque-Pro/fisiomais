'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, ShieldAlert, Loader2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserAuthToggle({ profileId, currentStatus }: { profileId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function toggleAuth() {
    setLoading(true);
    const nextStatus = currentStatus === 'active' ? 'expired' : 'active';
    await supabase
      .from('profiles')
      .update({ plan_status: nextStatus })
      .eq('id', profileId);
    router.refresh();
    setLoading(false);
  }

  const getButtonStyle = () => {
    switch (currentStatus) {
      case 'active':
        return 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100';
      case 'trial':
        return 'bg-amber-50 text-amber-600 hover:bg-amber-100';
      case 'expired':
      case 'canceled':
        return 'bg-rose-50 text-rose-600 hover:bg-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 hover:bg-slate-100';
    }
  };

  const getButtonIcon = () => {
    if (loading) return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    switch (currentStatus) {
      case 'active':
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case 'trial':
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return <ShieldAlert className="h-3.5 w-3.5" />;
    }
  };

  const getButtonLabel = () => {
    switch (currentStatus) {
      case 'active':
        return 'Bloquear';
      case 'trial':
        return 'Ativar';
      default:
        return 'Desbloquear';
    }
  };

  return (
    <button
      onClick={toggleAuth}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${getButtonStyle()} disabled:opacity-50`}
    >
      {getButtonIcon()}
      {getButtonLabel()}
    </button>
  );
}
