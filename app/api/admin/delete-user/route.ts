import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (me?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
    }

    // Primeiro deleta pacientes (cascade para assessments e evolutions)
    const { error: patientsError } = await supabase
      .from('patients')
      .delete()
      .eq('profile_id', userId);

    // Deleta o perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileError) {
      return NextResponse.json({ error: 'Erro ao deletar perfil: ' + profileError.message }, { status: 500 });
    }

    // Deleta o auth user com o client admin (service_role)
    const adminSupabase = createAdminClient();
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Erro ao deletar auth user:', authError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
