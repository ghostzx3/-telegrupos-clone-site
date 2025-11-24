import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createHash } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token inválido', valid: false },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Buscar token no banco
    const { data: tokenData, error } = await admin
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .single();

    if (error || !tokenData) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado', valid: false },
        { status: 400 }
      );
    }

    // Verificar se token já foi usado
    if (tokenData.used_at) {
      return NextResponse.json(
        { error: 'Token já foi utilizado', valid: false },
        { status: 400 }
      );
    }

    // Verificar se token expirou
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Token expirado', valid: false },
        { status: 400 }
      );
    }

    // Token válido
    return NextResponse.json({
      valid: true,
      message: 'Token válido',
    });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar token', valid: false },
      { status: 500 }
    );
  }
}



