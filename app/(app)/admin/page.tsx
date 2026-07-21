import { redirect } from 'next/navigation';
import { Activity, ShieldCheck, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { UpdateNewsButton } from '@/components/update-news-button';
import { UserAuthToggle } from '@/components/user-auth-toggle';
import { AdminCharts } from '@/components/admin-charts';

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

  // Fetch profiles with counts of related entities
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

      <div className="grid gap-4 md:grid-cols-5">
        <Stat label="Profissionais" value={total} subLabel={`${authorized} ativos`} />
        <Stat label="Em Trial" value={inTrial} subLabel="período grátis" />
        <Stat label="Expirados" value={expired} subLabel="não assinaram" />
        <Stat label="Pacientes" value={totalPatients} />
        <Stat label="Avaliações" value={totalEvolutions} />
      </div>

      {/* Seção de Gráficos Diversificados */}
      <AdminCharts statsList={statsList} />

      <div className="card p-0 overflow-hidden border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-900">Diretório de Profissionais</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{total} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Profissional</th>
                <th className="px-6 py-3 text-center">Dias</th>
                <th className="px-6 py-3">Métricas</th>
                <th className="px-6 py-3">Autorização</th>
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statsList.map((p) => {
                const isAuthorized = p.plan_status === 'active';
                const isTrial = p.plan_status === 'trial';
                const isExpired = p.plan_status === 'expired' || p.plan_status === 'canceled';
                const daysSinceJoin = Math.floor((new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24));
                const statusColor = isAuthorized ? 'bg-emerald-500' : isTrial ? 'bg-amber-500' : 'bg-rose-500';
                
                return (
                  <tr key={p.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${statusColor} animate-pulse`} />
                        <div>
                          <div className="font-bold text-brand-950">{p.full_name}</div>
                          <div className="text-xs text-slate-500">{p.email}</div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter font-bold">CREFITO {p.crefito || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center justify-center h-10 w-10 rounded-full bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-brand-700">{daysSinceJoin}</span>
                        <span className="text-[8px] text-slate-400 uppercase font-black">dias</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-xs font-bold text-brand-700">{p.patients_count}</div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Pacientes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-brand-700">{p.assessments_count}</div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Avaliações</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-brand-700">{p.evolutions_count}</div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Evoluções</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isAuthorized ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          <ShieldCheck className="h-3 w-3" /> Ativo
                        </span>
                      ) : isTrial ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">
                          Trial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 uppercase">
                          Expirado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UserAuthToggle profileId={p.id} currentStatus={p.plan_status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
