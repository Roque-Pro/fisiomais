import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UpdateNewsButton } from '@/components/update-news-button';
import { AdminCharts } from '@/components/admin-charts';
import { AdminDirectory } from '@/components/admin-directory';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') {
    return (
      <div className="card text-center py-12">
        <h1 className="text-xl font-bold text-brand-900">Acesso restrito</h1>
      </div>
    );
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id, full_name, crefito, whatsapp, email, city, trial_started_at, plan_status, created_at,
      patients:patients(count),
      assessments:assessments(count),
      evolutions:evolutions(count)
    `)
    .order('created_at', { ascending: false });

  const statsList = (profiles ?? []).map(p => ({
    ...p,
    patients_count: (p.patients as any)?.[0]?.count ?? 0,
    assessments_count: (p.assessments as any)?.[0]?.count ?? 0,
    evolutions_count: (p.evolutions as any)?.[0]?.count ?? 0,
  }));

  const total = profiles?.length ?? 0;
  const authorized = profiles?.filter((p) => p.plan_status === 'active').length ?? 0;
  const inTrial = profiles?.filter((p) => p.plan_status === 'trial').length ?? 0;
  const expired = profiles?.filter((p) => p.plan_status === 'expired' || p.plan_status === 'canceled').length ?? 0;
  
  const totalPatients = statsList.reduce((acc, p) => acc + p.patients_count, 0);
  const totalAssessments = statsList.reduce((acc, p) => acc + p.assessments_count, 0);
  const totalEvolutions = statsList.reduce((acc, p) => acc + p.evolutions_count, 0);
  const revenue = authorized * 19.90;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black text-brand-900 md:text-3xl tracking-tight">
            <div className="h-8 w-1.5 bg-amber-500 rounded-full"></div>
            Painel Administrativo
          </h1>
          <p className="text-sm text-slate-500 font-medium">Gestão global de usuários, métricas e autorizações.</p>
        </div>
        <UpdateNewsButton />
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-6">
        <Stat label="Profissionais" value={total} subLabel={`${authorized} ativos`} />
        <Stat label="Em Trial" value={inTrial} subLabel="período grátis" />
        <Stat label="Expirados" value={expired} subLabel="não assinaram" />
        <Stat label="Pacientes" value={totalPatients} />
        <Stat label="Avaliações" value={totalAssessments} />
        <Stat label="Evoluções" value={totalEvolutions} subLabel={`Receita: R$ ${revenue.toFixed(2)}`} />
      </div>

      <AdminCharts statsList={statsList} />

      <AdminDirectory statsList={statsList} total={total} />
    </div>
  );
}

function Stat({ label, value, subLabel }: { label: string; value: number; subLabel?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-brand-200 transition-all hover:shadow-md">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-3xl font-black text-brand-900">{value}</div>
        {subLabel && <div className="text-xs text-brand-600 font-medium">{subLabel}</div>}
      </div>
    </div>
  );
}
