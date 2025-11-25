import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPasswordResetEmail } from '@/lib/email';

// Configurações de segurança
const MAX_ATTEMPTS_PER_HOUR = 5;
const MAX_ATTEMPTS_PER_DAY = 10;

// Rate limiting helper
async function checkRateLimit(email: string, ipAddress: string) {
  const admin = createAdminClient();
  
  // Verificar tentativas da última hora
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const { data: recentAttempts } = await admin
    .from('password_reset_attempts')
    .select('attempts, last_attempt_at')
    .eq('email', email)
    .eq('ip_address', ipAddress)
    .gte('last_attempt_at', oneHourAgo.toISOString())
    .single();

  if (recentAttempts && recentAttempts.attempts >= MAX_ATTEMPTS_PER_HOUR) {
    return {
      allowed: false,
      message: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.',
    };
  }

  // Verificar tentativas do último dia
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { data: dailyAttempts } = await admin
    .from('password_reset_attempts')
    .select('attempts')
    .eq('email', email)
    .gte('last_attempt_at', oneDayAgo.toISOString())
    .single();

  if (dailyAttempts && dailyAttempts.attempts >= MAX_ATTEMPTS_PER_DAY) {
    return {
      allowed: false,
      message: 'Limite diário de tentativas atingido. Tente novamente amanhã.',
    };
  }

  return { allowed: true };
}

// Registrar tentativa
async function recordAttempt(email: string, ipAddress: string) {
  const admin = createAdminClient();
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Verificar se já existe tentativa recente
  const { data: existing } = await admin
    .from('password_reset_attempts')
    .select('id, attempts')
    .eq('email', email)
    .eq('ip_address', ipAddress)
    .gte('last_attempt_at', oneHourAgo.toISOString())
    .single();

  if (existing) {
    // Atualizar tentativa existente
    await admin
      .from('password_reset_attempts')
      .update({
        attempts: existing.attempts + 1,
        last_attempt_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    // Criar nova tentativa
    await admin.from('password_reset_attempts').insert({
      email,
      ip_address: ipAddress,
      attempts: 1,
      last_attempt_at: new Date().toISOString(),
    });
  }
}

// Obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const ipAddress = getClientIP(request);

    // Rate limiting
    const rateLimit = await checkRateLimit(email.toLowerCase(), ipAddress);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message },
        { status: 429 }
      );
    }

    const admin = createAdminClient();

    // Registrar tentativa
    await recordAttempt(email.toLowerCase(), ipAddress);

    // Usar Supabase Auth Admin para gerar link de recuperação
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.grupostelegramx.com';
    // Redirecionar para /dashboard/senha quando solicitado do dashboard
    const redirectUrl = `${appUrl}/dashboard/senha`;

    try {
      // Gerar link de recuperação usando generateLink
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: email.toLowerCase(),
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (linkError) {
        console.error('Error generating reset link:', linkError);
        // Sempre retornar sucesso (security best practice - não revelar se email existe)
        // Mas logar o erro para debug
        if (process.env.NODE_ENV === 'development') {
          console.error('Link generation error details:', linkError);
        }
        // Mesmo com erro, retornar sucesso para não revelar se email existe
        return NextResponse.json({
          message: 'Se o email existir, você receberá um link de recuperação.',
        });
      }

      // Extrair o link de recuperação
      const resetLink = linkData?.properties?.action_link;
      
      if (!resetLink) {
        console.error('No reset link generated');
        // Retornar sucesso mesmo sem link (security best practice)
        return NextResponse.json({
          message: 'Se o email existir, você receberá um link de recuperação.',
        });
      }

      // Enviar email usando Resend
      try {
        await sendPasswordResetEmail(email.toLowerCase(), resetLink);
        console.log('Password reset email sent successfully');
      } catch (emailError: any) {
        console.error('Error sending email:', emailError);
        // Mesmo com erro no envio, retornar sucesso (security best practice)
        // O link foi gerado, então o usuário pode tentar novamente
      }
    } catch (error: any) {
      console.error('Error processing reset request:', error);
      // Sempre retornar sucesso (security best practice)
      // Mas logar o erro para debug
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          code: error?.code
        });
      }
    }

    return NextResponse.json({
      message: 'Se o email existir, você receberá um link de recuperação.',
    });
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação. Tente novamente.' },
      { status: 500 }
    );
  }
}

