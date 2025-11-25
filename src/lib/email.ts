/**
 * Utilitário para envio de emails usando Resend
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@grupostelegramx.com';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alterar Senha - GruposTelegramX</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #038ede; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">GruposTelegramX</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #038ede; margin-top: 0;">Alterar Senha</h2>
          <p>Olá,</p>
          <p>Você solicitou a alteração de senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #038ede; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Alterar Senha
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">Ou copie e cole este link no seu navegador:</p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">
            <strong>Importante:</strong><br>
            • Este link expira em 1 hora<br>
            • O link só pode ser usado uma vez<br>
            • Se você não solicitou esta alteração, ignore este email
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© ${new Date().getFullYear()} GruposTelegramX. Todos os direitos reservados.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Alterar Senha - GruposTelegramX
    
    Você solicitou a alteração de senha da sua conta.
    
    Clique no link abaixo para criar uma nova senha:
    ${resetUrl}
    
    Este link expira em 1 hora e só pode ser usado uma vez.
    
    Se você não solicitou esta alteração, ignore este email.
  `;

  // Se Resend não estiver configurado, apenas logar (desenvolvimento)
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('=== EMAIL DE ALTERAÇÃO DE SENHA ===');
    console.log('Para:', email);
    console.log('Link:', resetUrl);
    console.log('=====================================');
    console.log('⚠️  Resend não configurado. Configure RESEND_API_KEY no .env.local');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Alterar Senha - GruposTelegramX',
      html,
      text,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }

    console.log('Email enviado com sucesso:', data);
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    throw error;
  }
}




