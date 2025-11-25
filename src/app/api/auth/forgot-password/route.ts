import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Configurações de segurança
const MAX_ATTEMPTS_PER_HOUR_IP = 5; // Limite por IP
const MAX_ATTEMPTS_PER_HOUR_EMAIL = 3; // Limite por email

// Rate limiting helper
async function checkRateLimit(email: string, ipAddress: string) {
  const admin = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Verificar tentativas por IP na última hora
  const { data: ipAttempts, count: ipCount } = await admin
    .from('password_reset_attempts')
    .select('*', { count: 'exact', head: false })
    .eq('ip_address', ipAddress)
    .gte('last_attempt_at', oneHourAgo.toISOString());

  if (ipCount && ipCount >= MAX_ATTEMPTS_PER_HOUR_IP) {
    return {
      allowed: false,
      message: 'Muitas tentativas deste IP. Aguarde 1 hora antes de tentar novamente.',
    };
  }

  // Verificar tentativas por email na última hora
  const { data: emailAttempts, count: emailCount } = await admin
    .from('password_reset_attempts')
    .select('*', { count: 'exact', head: false })
    .eq('email', email)
    .gte('last_attempt_at', oneHourAgo.toISOString());

  if (emailCount && emailCount >= MAX_ATTEMPTS_PER_HOUR_EMAIL) {
    return {
      allowed: false,
      message: 'Muitas tentativas para este email. Aguarde 1 hora antes de tentar novamente.',
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

    // Usar Supabase Auth Admin para enviar link de recuperação
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.grupostelegramx.com';
    // Redirecionar para /reset-password (página dedicada de reset)
    const redirectUrl = `${appUrl}/reset-password`;

    try {
      // Usar resetPasswordForEmail do Supabase Admin
      // O Supabase enviará o email automaticamente se SMTP estiver configurado
      const { data, error: resetError } = await admin.auth.admin.resetPasswordForEmail(
        email.toLowerCase(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (resetError) {
        // Log estruturado para monitoramento
        console.error(JSON.stringify({
          event: 'password_reset_email_error',
          email: email.toLowerCase(),
          ip: ipAddress,
          error: resetError.message,
          code: resetError.status || 'unknown',
          timestamp: new Date().toISOString(),
        }));
        // Sempre retornar sucesso (security best practice - não revelar se email existe)
        // Mas logar o erro para debug
        if (process.env.NODE_ENV === 'development') {
          console.error('Reset email error details:', resetError);
          console.error('⚠️  Verifique se o SMTP está configurado no Supabase Dashboard');
        }
      } else {
        // Log estruturado de sucesso
        console.log(JSON.stringify({
          event: 'password_reset_email_sent',
          email: email.toLowerCase(),
          ip: ipAddress,
          redirectUrl,
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (error: any) {
      // Log estruturado de erro
      console.error(JSON.stringify({
        event: 'password_reset_request_error',
        email: email.toLowerCase(),
        ip: ipAddress,
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        code: error?.code || 'unknown',
        timestamp: new Date().toISOString(),
      }));
      // Sempre retornar sucesso (security best practice)
      // Mas logar o erro para debug
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          code: error?.code
        });
        console.error('⚠️  Verifique se o SMTP está configurado no Supabase Dashboard');
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Se o email existir, você receberá um link de recuperação.',
    });
  } catch (error: any) {
    // Log estruturado de erro crítico
    console.error(JSON.stringify({
      event: 'forgot_password_endpoint_error',
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    }));
    return NextResponse.json(
      { ok: false, error: 'Erro ao processar solicitação. Tente novamente.' },
      { status: 500 }
    );
  }
}

