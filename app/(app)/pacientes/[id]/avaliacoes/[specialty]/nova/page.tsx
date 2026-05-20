import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { specialtyMap } from '@/lib/specialties';
import { AssessmentForm } from '@/components/assessment-form';

export const dynamic = 'force-dynamic';

export default async function NewAssessmentPage({ params }: { params: { id: string; specialty: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const sp = specialtyMap[params.specialty];
  if (!sp) notFound();

  const { data: patient } = await supabase
    .from('patients').select('*').eq('id', params.id).eq('profile_id', user.id).single();
  if (!patient) notFound();

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href={`/pacientes/${patient.id}`} className="btn-ghost"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-900">
            {sp.emoji} Avaliação · {sp.name}
          </h1>
          <p className="text-sm text-slate-600">{patient.full_name} — {sp.description}</p>
        </div>
      </div>
      <AssessmentForm patientId={patient.id} specialtyId={sp.id} patient={patient} />
    </>
  );
}
