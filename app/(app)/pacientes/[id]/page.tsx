import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ClipboardList, FileText, Phone, Plus, Stethoscope, Flower2, Waves, Accessibility, Bone, Brain, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { specialties } from '@/lib/specialties';
import { EvolutionForm } from '@/components/evolution-form';
import { PatientPdfButtons } from '@/components/patient-pdf-buttons';
import { DeletePatientButton } from '@/components/delete-patient-button';
import { DeleteAssessmentButton } from '@/components/delete-assessment-button';
import { PatientGoalsForm } from '@/components/patient-goals-form';

export const dynamic = 'force-dynamic';

export default async function PatientPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: patient } = await supabase
    .from('patients').select('*').eq('id', params.id).eq('profile_id', user.id).single();
  if (!patient) notFound();

  const { data: assessments } = await supabase
    .from('assessments').select('id, specialty, title, created_at, notes, data')
    .eq('patient_id', params.id).order('created_at', { ascending: false });

  const { data: evolutions } = await supabase
    .from('evolutions').select('*')
    .eq('patient_id', params.id).order('session_date', { ascending: false }).order('created_at', { ascending: false });

  const nextSession = (evolutions?.[0]?.session_number ?? 0) + 1;
  const age = patient.birthdate
    ? Math.floor((Date.now() - new Date(patient.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/pacientes" className="btn-ghost"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-2xl font-bold text-brand-900">{patient.full_name}</h1>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Paciente</div>
            <div className="text-xl font-semibold text-brand-900">{patient.full_name}</div>
            <div className="mt-1 text-sm text-slate-600">
              {age !== null && <>{age} anos · </>}{patient.gender || '—'}
              {patient.occupation ? ` · ${patient.occupation}` : ''}
            </div>
            {patient.whatsapp && (
              <a href={`https://wa.me/${patient.whatsapp.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
                <Phone className="h-3.5 w-3.5" /> {patient.whatsapp}
              </a>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <PatientPdfButtons patient={patient} evolutions={evolutions || []} assessments={assessments || []} />
            <DeletePatientButton patientId={patient.id} patientName={patient.full_name} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Histórico médico</div>
            <p className="mt-1 text-sm">{patient.medical_history || '—'}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Medicações</div>
            <p className="mt-1 text-sm">{patient.medications || '—'}</p>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wide text-slate-500">Endereço</div>
            <p className="mt-1 text-sm">{patient.address || '—'}</p>
          </div>
        </div>
      </div>

      <PatientGoalsForm 
        patientId={patient.id} 
        initialData={{
          chief_complaint: patient.chief_complaint,
          functional_objective: patient.functional_objective,
          objective_assessment: patient.objective_assessment
        }} 
      />

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-900">
            <ClipboardList className="h-5 w-5" /> Avaliações por especialidade
          </h2>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {specialties.map((s: any, idx) => {
            const isClinical = idx >= 3;
            const IconComponent = ({
              Flower2, Waves, Accessibility, Bone, Brain, Trophy
            } as any)[s.iconName] || ClipboardList;

            return (
              <Link key={s.id} href={`/pacientes/${patient.id}/avaliacoes/${s.id}/nova`}
                className={`group relative flex flex-col items-start gap-3 rounded-2xl border p-5 transition-all duration-300
                  ${isClinical 
                    ? 'border-brand-100 bg-brand-50/20 hover:border-brand-500 hover:bg-white hover:shadow-xl hover:-translate-y-1' 
                    : 'border-slate-100 bg-white hover:border-brand-300 hover:shadow-lg hover:-translate-y-1'}`}>
                
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-all duration-500 group-hover:rotate-6
                  ${isClinical ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white' : 'bg-slate-50 text-brand-600 border border-slate-100'}`}>
                  <IconComponent className="h-6 w-6" strokeWidth={isClinical ? 2.5 : 2} />
                </div>

                <div className="flex flex-1 flex-col">
                  <span className={`text-[15px] font-bold tracking-tight ${isClinical ? 'text-brand-950' : 'text-slate-800'}`}>
                    {s.name}
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors
                  ${isClinical ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-600'}`}>
                  Iniciar Avaliação <Plus className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>

        {assessments && assessments.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {assessments.map((a) => {
              const sp = specialties.find((s) => s.id === a.specialty);
              return (
                <li key={a.id} className="flex items-center gap-2">
                  <Link href={`/pacientes/${patient.id}/avaliacoes/${a.specialty}/${a.id}`}
                    className="flex flex-1 items-center justify-between py-3 px-2 hover:bg-brand-50/40 rounded-lg">
                    <div>
                      <div className="font-medium text-brand-900">{sp?.emoji} {sp?.name ?? a.specialty}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(a.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <FileText className="h-4 w-4 text-slate-400" />
                  </Link>
                  <DeleteAssessmentButton assessmentId={a.id} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nenhuma avaliação registrada ainda.</p>
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-brand-900">
          <Stethoscope className="h-5 w-5" /> Evoluções
        </h2>
        <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
          <EvolutionForm patientId={patient.id} nextSession={nextSession} />
        </div>

        {evolutions && evolutions.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {evolutions.map((e) => (
              <li key={e.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-brand-900">
                    Sessão #{e.session_number ?? '—'} · {new Date(e.session_date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="chip">Dor: {e.pain_level ?? '—'}/10</span>
                    <span className="chip">Mobilidade: {e.mobility_level ?? '—'}/10</span>
                  </div>
                </div>
                {e.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{e.notes}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Nenhuma evolução registrada.</p>
        )}
      </div>
    </>
  );
}
