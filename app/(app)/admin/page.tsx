import { redirect } from 'next/navigation';
import { Activity, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ActivatePlanButton } from '@/components/activate-plan-button';
import { UpdateNewsButton } from '@/components/update-news-button';
import { ProductCsvUpload } from '@/components/product-csv-upload';

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
    .select('id, full_name, crefito, whatsapp, email, city, trial_started_at, plan_status, referred_by, created_at')
    .order('created_at', { ascending: false });

  const total = profiles?.length ?? 0;
  const trialing = profiles?.filter((p) => p.plan_status === 'trial').length ?? 0;
  const active = profiles?.filter((p) => p.plan_status === 'active').length ?? 0;
  const expired = profiles?.filter((p) => p.plan_status === 'expired').length ?? 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-900">
          <Activity className="h-6 w-6" /> Painel de administrador
        </h1>
        <UpdateNewsButton />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Profissionais" value={total} />
        <Stat label="Em teste" value={trialing} />
        <Stat label="Ativos" value={active} />
        <Stat label="Expirados" value={expired} />
      </div>

      <ProductCsvUpload />

      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-50/60 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Profissional</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Dias restantes</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(profiles ?? []).map((p) => {
                const start = new Date(p.trial_started_at).getTime();
                const left = 30 - Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
                const daysLeft = Math.max(0, left);
                return (
                  <tr key={p.id} className="hover:bg-brand-50/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-900">{p.full_name}</div>
                      <div className="text-xs text-slate-500">CREFITO {p.crefito || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{p.email}</div>
                      <div className="text-xs text-slate-500">{p.whatsapp}</div>
                    </td>
                    <td className="px-4 py-3">
                      {p.plan_status === 'active' ? '∞' : (
                        <span className={daysLeft <= 0 ? 'text-rose-600 font-semibold' : ''}>{daysLeft}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActivatePlanButton profileId={p.id} currentStatus={p.plan_status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
        <div className="mt-1 text-3xl font-extrabold text-brand-900">{value}</div>
      </div>
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Users className="h-6 w-6" />
      </div>
    </div>
  );
}
