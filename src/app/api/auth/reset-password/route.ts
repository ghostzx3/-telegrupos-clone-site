import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    // Validações
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Nova senha é obrigatória' },
        { status: 400 }
      );
    }

    // Validação robusta de senha (mínimo 10 caracteres)
    if (newPassword.length < 10) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 10 caracteres' },
        { status: 400 }
      );
    }

    // Validação adicional de complexidade
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'A senha deve conter pelo menos uma letra minúscula' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'A senha deve conter pelo menos uma letra maiúscula' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'A senha deve conter pelo menos um número' },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'A senha deve conter pelo menos um caractere especial' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Buscar token no banco
    const { data: tokenData, error: tokenError } = await admin
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se token já foi usado
    if (tokenData.used_at) {
      return NextResponse.json(
        { error: 'Token já foi utilizado. Solicite um novo link de recuperação.' },
        { status: 400 }
      );
    }

    // Verificar se token expirou
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo link de recuperação.' },
        { status: 400 }
      );
    }

    // Atualizar senha do usuário usando Supabase Admin API
    const { error: updateError } = await admin.auth.admin.updateUserById(
      tokenData.user_id,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar senha. Tente novamente.' },
        { status: 500 }
      );
    }

    // Marcar token como usado
    await admin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    // Invalidar todas as sessões do usuário (forçar novo login)
    await admin.auth.admin.signOut(tokenData.user_id);

    return NextResponse.json({
      message: 'Senha alterada com sucesso!',
      success: true,
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação. Tente novamente.' },
      { status: 500 }
    );
  }
}





