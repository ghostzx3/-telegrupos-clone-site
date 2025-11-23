import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar grupos do usuário
    const { data: groups, error } = await supabase
      .from('groups')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Buscar pagamentos ativos para cada grupo
    const groupsWithPayments = await Promise.all(
      (groups || []).map(async (group) => {
        const { data: activePayment } = await supabase
          .from('payments')
          .select('*')
          .eq('group_id', group.id)
          .eq('status', 'paid')
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...group,
          activePayment: activePayment || null
        };
      })
    );

    return NextResponse.json({ groups: groupsWithPayments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

