import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin || false;
}

// PATCH - Atualizar grupo (nome e/ou foto)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const { title, image_url } = await request.json();
    const groupId = params.id;

    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 });
    }

    const supabase = await createClient();

    // Preparar objeto de atualização
    const updates: { title?: string; image_url?: string } = {};
    if (title !== undefined) {
      updates.title = title;
    }
    if (image_url !== undefined) {
      updates.image_url = image_url;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    // Atualizar grupo
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar grupo:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      group: data 
    });
  } catch (error: unknown) {
    console.error('Erro ao processar atualização:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar grupo' },
      { status: 500 }
    );
  }
}




