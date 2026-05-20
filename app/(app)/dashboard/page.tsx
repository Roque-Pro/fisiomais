import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ClipboardList, FileText, Plus, TrendingUp, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, specialties')
    .eq('id', user.id)
    .single();

  const [{ count: patientsCount }, { count: assessmentsCount }, { count: evolutionsCount }] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
    supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
    supabase.from('evolutions').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)
  ]);

  const { data: recentPatients } = await supabase
    .from('patients')
    .select('id, full_name, chief_complaint, created_at')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const firstName = (profile?.full_name ?? 'Profissional').split(' ')[0];

  const stats = [
    { label: 'Pacientes', value: patientsCount ?? 0, Icon: Users },
    { label: 'Avaliações', value: assessmentsCount ?? 0, Icon: ClipboardList },
    { label: 'Evoluções', value: evolutionsCount ?? 0, Icon: TrendingUp }
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">Olá, {firstName} 👋</h1>
          <p className="text-sm text-slate-600">Pronto para acompanhar seus pacientes hoje?</p>
        </div>
        <Link href="/pacientes/novo" className="btn-primary">
          <Plus className="h-4 w-4" /> Novo paciente
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="card flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
              <div className="mt-1 text-3xl font-extrabold text-brand-900">{value}</div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-900">Pacientes recentes</h2>
            <Link href="/pacientes" className="text-sm font-medium text-brand-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {recentPatients && recentPatients.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {recentPatients.map((p) => (
                <li key={p.id}>
                  <Link href={`/pacientes/${p.id}`} className="flex items-center justify-between py-3 hover:bg-brand-50/40 rounded-lg px-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-brand-900">{p.full_name}</div>
                      <div className="truncate text-xs text-slate-500">{p.chief_complaint || 'Sem queixa registrada'}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/40 p-6 text-center">
              <p className="text-sm text-slate-600">Nenhum paciente cadastrado ainda.</p>
              <Link href="/pacientes/novo" className="btn-primary mt-3 inline-flex">
                <Plus className="h-4 w-4" /> Cadastrar primeiro paciente
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-3 text-lg font-semibold text-brand-900">Atalhos</h2>
          <div className="space-y-2">
            <Link href="/pacientes" className="btn-secondary w-full justify-start">
              <Users className="h-4 w-4" /> Lista de pacientes
            </Link>
            <Link href="/perfil" className="btn-secondary w-full justify-start">
              <FileText className="h-4 w-4" /> Gerar cartão digital
            </Link>
            <Link href="/personalizar" className="btn-secondary w-full justify-start">
              🎨 Personalizar tema
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
