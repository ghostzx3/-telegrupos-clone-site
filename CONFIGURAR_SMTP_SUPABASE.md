# 📧 Configurar SMTP no Supabase para Envio de Emails

O Supabase pode enviar emails automaticamente quando você configura um servidor SMTP. Siga este guia para configurar:

## 🚀 Passo 1: Acessar Configurações de Email no Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** (Configurações) no menu lateral
4. Clique em **Auth** > **Email Templates** ou **SMTP Settings**

## 📝 Passo 2: Configurar SMTP

### Opção A: Usar Serviço de Email (Recomendado)

Você pode usar qualquer provedor SMTP. Aqui estão alguns populares:

#### **Gmail (Para desenvolvimento/teste)**

1. No Supabase, vá em **Settings** > **Auth** > **SMTP Settings**
2. Ative **Enable Custom SMTP**
3. Preencha os dados:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Password: [Sua senha de app do Gmail]
Sender Email: seu-email@gmail.com
Sender Name: GruposTelegramX
```

**Importante para Gmail:**
- Você precisa criar uma "Senha de App" no Gmail
- Acesse: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Gere uma senha de app e use ela no campo "SMTP Password"

#### **SendGrid**

1. Crie conta em [sendgrid.com](https://sendgrid.com)
2. Vá em **Settings** > **API Keys**
3. Crie uma API Key
4. No Supabase, configure:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Sua API Key do SendGrid]
Sender Email: noreply@seudominio.com
Sender Name: GruposTelegramX
```

#### **Mailgun**

1. Crie conta em [mailgun.com](https://mailgun.com)
2. Obtenha credenciais SMTP
3. No Supabase, configure:

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Seu usuário Mailgun]
SMTP Password: [Sua senha Mailgun]
Sender Email: noreply@seudominio.com
Sender Name: GruposTelegramX
```

#### **AWS SES**

1. Configure AWS SES
2. Obtenha credenciais SMTP
3. No Supabase, configure:

```
SMTP Host: email-smtp.[região].amazonaws.com
SMTP Port: 587
SMTP User: [Sua chave de acesso AWS]
SMTP Password: [Sua chave secreta AWS]
Sender Email: noreply@seudominio.com
Sender Name: GruposTelegramX
```

## ✅ Passo 3: Configurar URL de Redirecionamento

1. No Supabase Dashboard, vá em **Settings** > **Auth** > **URL Configuration**
2. Configure:

```
Site URL: https://www.grupostelegramx.com
Redirect URLs: 
  - https://www.grupostelegramx.com/dashboard/senha
  - https://www.grupostelegramx.com/reset-password
```

## 🎨 Passo 4: Personalizar Templates de Email (Opcional)

1. Vá em **Settings** > **Auth** > **Email Templates**
2. Selecione **Reset Password** (ou "Recovery")
3. Personalize o template HTML
4. Use `{{ .ConfirmationURL }}` para o link de recuperação

Exemplo de template:

```html
<h2>Alterar Senha - GruposTelegramX</h2>
<p>Clique no link abaixo para alterar sua senha:</p>
<a href="{{ .ConfirmationURL }}">Alterar Senha</a>
<p>Este link expira em 1 hora.</p>
```

## 🧪 Passo 5: Testar

1. Acesse `/dashboard/senha` no seu site
2. Clique em "Enviar Link de Verificação por Email"
3. Verifique sua caixa de entrada
4. Se não receber, verifique:
   - Pasta de spam
   - Logs do Supabase (Dashboard > Logs)
   - Configurações SMTP

## 🐛 Troubleshooting

### Email não está sendo enviado

1. **Verifique os logs do Supabase:**
   - Dashboard > Logs > Auth Logs
   - Procure por erros relacionados a email

2. **Verifique configurações SMTP:**
   - Certifique-se de que "Enable Custom SMTP" está ativado
   - Verifique se as credenciais estão corretas
   - Teste a conexão SMTP

3. **Verifique limites do provedor:**
   - Gmail: 500 emails/dia (gratuito)
   - SendGrid: 100 emails/dia (gratuito)
   - Mailgun: 5.000 emails/mês (gratuito)

### Erro: "SMTP connection failed"

- Verifique se o host e porta estão corretos
- Verifique se as credenciais estão corretas
- Verifique firewall/proxy
- Tente usar porta 465 com SSL ou 587 com TLS

### Email vai para spam

- Configure SPF, DKIM e DMARC no seu domínio
- Use um domínio verificado (não Gmail genérico)
- Evite palavras como "reset", "password" no assunto

## 📊 Monitoramento

No Supabase Dashboard você pode:
- Ver logs de autenticação
- Ver tentativas de envio de email
- Ver erros relacionados a SMTP
- Monitorar uso

## 💡 Dicas

1. **Para desenvolvimento:** Use Gmail com senha de app
2. **Para produção:** Use SendGrid, Mailgun ou AWS SES
3. **Sempre teste** antes de colocar em produção
4. **Monitore logs** regularmente
5. **Configure rate limiting** para evitar abusos

## 🔒 Segurança

- **Nunca** commite credenciais SMTP no código
- Use variáveis de ambiente quando possível
- Revogue credenciais antigas se comprometidas
- Monitore tentativas de envio anormais

## 📚 Documentação Oficial

- [Supabase Auth Email](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase SMTP Settings](https://supabase.com/docs/guides/auth/auth-smtp)













