import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ClipboardList, FileText, Newspaper, Palette, Plus, TrendingUp, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DashboardCharts } from '@/components/dashboard-charts';

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

  const { data: recentEvolutions } = await supabase
    .from('evolutions')
    .select('session_date')
    .eq('profile_id', user.id)
    .gte('session_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const { data: recentNews } = await supabase
    .from('news')
    .select('id, title, source, published_at')
    .order('published_at', { ascending: false })
    .limit(3);

  const firstName = (profile?.full_name ?? 'Profissional').split(' ')[0];

  const stats = [
    { label: 'Pacientes', value: patientsCount ?? 0, Icon: Users },
    { label: 'Avaliações', value: assessmentsCount ?? 0, Icon: ClipboardList },
    { label: 'Evoluções', value: evolutionsCount ?? 0, Icon: TrendingUp }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black text-brand-900 md:text-3xl tracking-tight">
            <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
            Olá, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium">Pronto para acompanhar seus pacientes hoje?</p>
        </div>
        <Link href="/pacientes/novo" className="btn-primary shadow-lg shadow-brand-200">
          <Plus className="h-4 w-4" /> Novo paciente
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="card flex items-center justify-between group hover:border-brand-300 transition-colors">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">{label}</div>
              <div className="mt-1 text-3xl font-black text-brand-900">{value}</div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCharts recentEvolutions={recentEvolutions ?? []} />

          <div className="card">
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
                    <Link href={`/pacientes/${p.id}`} className="flex items-center justify-between py-3 hover:bg-brand-50/40 rounded-lg px-2 transition-colors">
                      <div className="min-w-0">
                        <div className="truncate font-bold text-brand-950">{p.full_name}</div>
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
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-brand-900">Acesso Rápido</h2>
            <div className="grid gap-2">
              <Link href="/pacientes" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
                <div className="h-10 w-10 grid place-items-center bg-brand-50 text-brand-600 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-900">Meus Pacientes</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium tracking-tight">Lista completa</div>
                </div>
              </Link>
              <Link href="/perfil" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
                <div className="h-10 w-10 grid place-items-center bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-900">Cartão Digital</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium tracking-tight">Gerar PDF</div>
                </div>
              </Link>
              <Link href="/personalizar" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
                <div className="h-10 w-10 grid place-items-center bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-900">Customizar</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium tracking-tight">Temas e cores</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-brand-500" /> Fisio News
              </h2>
              <Link href="/fisio-news" className="text-xs font-bold text-brand-700 hover:underline">
                Ver todas
              </Link>
            </div>
            {recentNews && recentNews.length > 0 ? (
              <div className="space-y-3">
                {recentNews.map((n) => (
                  <Link key={n.id} href="/fisio-news" className="block p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black text-brand-600 uppercase tracking-tighter bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                        {n.source}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        {new Date(n.published_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                      {n.title}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-sm text-slate-400 italic">Buscando novidades...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
