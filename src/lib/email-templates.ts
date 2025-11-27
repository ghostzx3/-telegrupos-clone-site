/**
 * Templates de email para recuperação de senha
 * 
 * Este arquivo contém templates HTML e texto para emails de recuperação de senha.
 * O Supabase usa esses templates quando configurado no dashboard.
 * 
 * Para personalizar o template no Supabase:
 * 1. Vá em Settings > Auth > Email Templates
 * 2. Selecione "Reset Password"
 * 3. Use {{ .ConfirmationURL }} para o link de recuperação
 */

export interface EmailTemplateOptions {
  resetUrl: string;
  appName?: string;
  appUrl?: string;
  logoUrl?: string;
}

/**
 * Template HTML para email de recuperação de senha
 * 
 * Este template pode ser usado no Supabase Dashboard ou em serviços de email externos.
 * 
 * Variáveis disponíveis no Supabase:
 * - {{ .ConfirmationURL }} - Link de recuperação
 * - {{ .Email }} - Email do usuário
 * - {{ .SiteURL }} - URL do site
 */
export function getPasswordResetEmailHTML(options: EmailTemplateOptions): string {
  const {
    resetUrl,
    appName = 'GruposTelegramX',
    appUrl = 'https://www.grupostelegramx.com',
    logoUrl = 'https://telegram.org/img/t_logo.png',
  } = options;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Redefinir Senha - ${appName}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Container principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-collapse: collapse;">
          
          <!-- Header com logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #038ede 0%, #0277c7 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <img src="${logoUrl}" alt="${appName}" width="48" height="48" style="display: block; margin: 0 auto; border-radius: 50%; background-color: rgba(255,255,255,0.2); padding: 8px;">
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 0.5px;">
                      ${appName}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                Redefinir Senha
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Olá,
              </p>
              
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Você solicitou a redefinição de senha da sua conta. Clique no botão abaixo para criar uma nova senha:
              </p>

              <!-- Botão CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #038ede; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(3, 142, 222, 0.3);">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 30px 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f9f9f9; border-radius: 4px; word-break: break-all; color: #666666; font-size: 12px; font-family: 'Courier New', monospace;">
                ${resetUrl}
              </p>

              <!-- Avisos de segurança -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px; font-weight: 600;">
                  ⚠️ Importante:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
                  <li>Este link expira em <strong>1 hora</strong></li>
                  <li>O link só pode ser usado <strong>uma vez</strong></li>
                  <li>Se você não solicitou esta redefinição, <strong>ignore este email</strong></li>
                  <li>Nunca compartilhe este link com ninguém</li>
                </ul>
              </div>

              <!-- Separador -->
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

              <!-- Footer -->
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;">
                Este é um email automático, por favor não responda.<br>
                Se você tiver dúvidas, entre em contato através do nosso site.
              </p>
            </td>
          </tr>

          <!-- Footer final -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.<br>
                <a href="${appUrl}" style="color: #038ede; text-decoration: none;">${appUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Template de texto simples para email de recuperação de senha
 * 
 * Usado como fallback para clientes de email que não suportam HTML.
 */
export function getPasswordResetEmailText(options: EmailTemplateOptions): string {
  const {
    resetUrl,
    appName = 'GruposTelegramX',
    appUrl = 'https://www.grupostelegramx.com',
  } = options;

  return `
Redefinir Senha - ${appName}

Olá,

Você solicitou a redefinição de senha da sua conta.

Clique no link abaixo para criar uma nova senha:
${resetUrl}

IMPORTANTE:
• Este link expira em 1 hora
• O link só pode ser usado uma vez
• Se você não solicitou esta redefinição, ignore este email
• Nunca compartilhe este link com ninguém

Este é um email automático, por favor não responda.
Se você tiver dúvidas, entre em contato através do nosso site.

© ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.
${appUrl}
  `.trim();
}

/**
 * Template para uso no Supabase Dashboard
 * 
 * Copie e cole este template em Settings > Auth > Email Templates > Reset Password
 * 
 * Variáveis do Supabase:
 * - {{ .ConfirmationURL }} - Link de recuperação
 * - {{ .Email }} - Email do usuário
 * - {{ .SiteURL }} - URL do site
 */
export const SUPABASE_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - GruposTelegramX</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
    <tr>
      <td style="background: linear-gradient(135deg, #038ede 0%, #0277c7 100%); padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
          GruposTelegramX
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
          Redefinir Senha
        </h2>
        <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
          Olá,
        </p>
        <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
          Você solicitou a redefinição de senha da sua conta. Clique no botão abaixo para criar uma nova senha:
        </p>
        <table role="presentation" style="width: 100%; margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #038ede; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Redefinir Senha
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 30px 0 10px 0; color: #999999; font-size: 14px;">
          Ou copie e cole este link no seu navegador:
        </p>
        <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f9f9f9; border-radius: 4px; word-break: break-all; color: #666666; font-size: 12px; font-family: monospace;">
          {{ .ConfirmationURL }}
        </p>
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px; font-weight: 600;">
            ⚠️ Importante:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
            <li>Este link expira em <strong>1 hora</strong></li>
            <li>O link só pode ser usado <strong>uma vez</strong></li>
            <li>Se você não solicitou esta redefinição, <strong>ignore este email</strong></li>
          </ul>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #999999; font-size: 12px;">
          © {{ .Year }} GruposTelegramX. Todos os direitos reservados.<br>
          <a href="{{ .SiteURL }}" style="color: #038ede; text-decoration: none;">{{ .SiteURL }}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();







