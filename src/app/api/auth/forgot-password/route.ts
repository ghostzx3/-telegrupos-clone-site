import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createHash, randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

// Configurações de segurança
const TOKEN_EXPIRATION_MINUTES = 15;
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

// Gerar token seguro
function generateSecureToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
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

    // Verificar se o usuário existe
    const { data: user, error: userError } = await admin.auth.admin.getUserByEmail(
      email.toLowerCase()
    );

    // Sempre retornar sucesso (security best practice - não revelar se email existe)
    if (userError || !user) {
      // Registrar tentativa mesmo se usuário não existir (para rate limiting)
      await recordAttempt(email.toLowerCase(), ipAddress);
      return NextResponse.json({
        message: 'Se o email existir, você receberá um link de recuperação.',
      });
    }

    // Invalidar tokens anteriores do usuário
    await admin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', user.user.id)
      .is('used_at', null);

    // Gerar novo token
    const { token, tokenHash } = generateSecureToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    // Salvar token no banco
    await admin.from('password_reset_tokens').insert({
      user_id: user.user.id,
      token: token, // Guardamos o token original para o email
      token_hash: tokenHash, // Hash para validação
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: request.headers.get('user-agent') || '',
    });

    // Registrar tentativa
    await recordAttempt(email.toLowerCase(), ipAddress);

    // Enviar email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(email.toLowerCase(), resetUrl);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Não falhar a requisição se o email falhar (security best practice)
      // Mas logar o erro para debug
    }

    // Em produção, você deve usar um serviço de email como:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Ou configurar templates no Supabase

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

