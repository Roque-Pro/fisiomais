import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_status, trial_started_at')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (profile.plan_status === 'trial' && profile.trial_started_at) {
      const trialEnd = new Date(profile.trial_started_at);
      trialEnd.setDate(trialEnd.getDate() + 30);
      const now = new Date();

      if (now >= trialEnd) {
        await supabase
          .from('profiles')
          .update({ plan_status: 'expired', updated_at: now.toISOString() })
          .eq('id', user.id);

        return NextResponse.json({
          plan_status: 'expired',
          daysLeft: 0,
          expired: true,
        });
      }

      const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return NextResponse.json({
        plan_status: 'trial',
        daysLeft,
        trialEnd: trialEnd.toISOString(),
        expired: false,
      });
    }

    return NextResponse.json({
      plan_status: profile.plan_status,
      expired: profile.plan_status === 'expired' || profile.plan_status === 'canceled',
    });
  } catch (error) {
    console.error('Trial check error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
