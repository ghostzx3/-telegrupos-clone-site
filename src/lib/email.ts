/**
 * Utilitário para envio de emails
 * 
 * Em produção, integre com um serviço de email como:
 * - Resend (https://resend.com)
 * - SendGrid (https://sendgrid.com)
 * - AWS SES (https://aws.amazon.com/ses/)
 * - Nodemailer com SMTP
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  // TODO: Integrar com serviço de email real
  // Por enquanto, vamos usar o Supabase Auth ou logar o link
  
  const emailOptions: EmailOptions = {
    to: email,
    subject: 'Redefinir Senha - Telegrupos',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #038ede; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Telegrupos</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #038ede; margin-top: 0;">Redefinir Senha</h2>
            <p>Olá,</p>
            <p>Você solicitou a redefinição de senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #038ede; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">Ou copie e cole este link no seu navegador:</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${resetUrl}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #999;">
              <strong>Importante:</strong><br>
              • Este link expira em 15 minutos<br>
              • O link só pode ser usado uma vez<br>
              • Se você não solicitou esta redefinição, ignore este email
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
            <p>© ${new Date().getFullYear()} Telegrupos. Todos os direitos reservados.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Redefinir Senha - Telegrupos
      
      Você solicitou a redefinição de senha da sua conta.
      
      Clique no link abaixo para criar uma nova senha:
      ${resetUrl}
      
      Este link expira em 15 minutos e só pode ser usado uma vez.
      
      Se você não solicitou esta redefinição, ignore este email.
    `,
  };

  // Em produção, substitua por:
  // await sendEmail(emailOptions);
  
  // Por enquanto, vamos logar (remover em produção)
  console.log('=== EMAIL DE REDEFINIÇÃO DE SENHA ===');
  console.log('Para:', email);
  console.log('Link:', resetUrl);
  console.log('=====================================');
  
  // TODO: Integrar com serviço de email
  // Exemplo com Resend:
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'noreply@seudominio.com',
  //   to: email,
  //   subject: emailOptions.subject,
  //   html: emailOptions.html,
  // });
}

/**
 * Função auxiliar para enviar email (implementar com serviço real)
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  // Implementar com serviço de email escolhido
  throw new Error('Email service not configured. Please implement sendEmail function.');
}



