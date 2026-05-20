'use client';

import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { downloadEvolutionPdf } from '@/lib/pdf';

export function PatientPdfButtons({ patient, evolutions, assessments }: {
  patient: any; evolutions: any[]; assessments: any[];
}) {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data));
    });
  }, [supabase]);

  return (
    <div className="flex gap-2">
      <button onClick={() => profile && downloadEvolutionPdf({ profile, patient, evolutions, assessments })}
        className="btn-secondary text-sm" disabled={!profile}>
        <FileDown className="h-4 w-4" /> PDF de evolução
      </button>
    </div>
  );
}
