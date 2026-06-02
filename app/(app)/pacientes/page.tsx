import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Plus, Search, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PatientsPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const q = (searchParams?.q ?? '').trim();
  let query = supabase
    .from('patients')
    .select('id, full_name, chief_complaint, whatsapp, created_at')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });
  if (q) query = query.ilike('full_name', `%${q}%`);
  const { data: patients } = await query;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Pacientes</h1>
          <p className="text-sm text-slate-600">Gerencie e acompanhe a evolução do seu time.</p>
        </div>
        <Link href="/pacientes/novo" className="btn-primary">
          <Plus className="h-4 w-4" /> Novo paciente
        </Link>
      </div>

      <form className="card flex items-center gap-2 py-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input name="q" defaultValue={q} placeholder="Buscar por nome…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
        <button className="btn-secondary text-xs">Buscar</button>
      </form>

      {patients && patients.length > 0 ? (
        <div className="card divide-y divide-slate-100 p-0">
          {patients.map((p) => (
            <Link key={p.id} href={`/pacientes/${p.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-brand-50/40">
              <div className="min-w-0">
                <div className="truncate font-semibold text-brand-900">{p.full_name}</div>
                <div className="truncate text-xs text-slate-500">
                  {p.chief_complaint || 'Sem queixa registrada'} {p.whatsapp ? `· ${p.whatsapp}` : ''}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card grid place-items-center py-12 text-center">
          <Users className="mb-3 h-10 w-10 text-brand-300" />
          <h3 className="text-lg font-semibold text-brand-900">Nenhum paciente encontrado</h3>
          <p className="mt-1 text-sm text-slate-600">Comece cadastrando seu primeiro paciente.</p>
          <Link href="/pacientes/novo" className="btn-primary mt-4">
            <Plus className="h-4 w-4" /> Cadastrar paciente
          </Link>
        </div>
      )}
    </div>
  );
}
slate-600">Comece cadastrando seu primeiro paciente.</p>
          <Link href="/pacientes/novo" className="btn-primary mt-4">
            <Plus className="h-4 w-4" /> Cadastrar paciente
          </Link>
        </div>
      )}
    </>
  );
}
