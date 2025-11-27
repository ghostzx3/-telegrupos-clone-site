# 🔐 Sistema Completo de Redefinição de Senha

Sistema completo e seguro de redefinição de senha sem exigir a senha atual.

## 📋 Funcionalidades

✅ **Solicitação de Reset**
- Usuário informa apenas o email
- Geração de token único e temporário
- Rate limiting por IP e email
- Token expira em 15 minutos

✅ **Segurança**
- Token de uso único
- Hash seguro (SHA-256)
- Expiração automática
- Rate limiting (5 tentativas/hora, 10/dia)
- Invalidação de tokens anteriores

✅ **Validação e Reset**
- Validação de token antes de resetar
- Verificação de expiração
- Verificação de uso único
- Atualização segura de senha
- Invalidação de todas as sessões

## 🗄️ Banco de Dados

### 1. Executar Schema SQL

Execute o arquivo `supabase/password_reset_schema.sql` no SQL Editor do Supabase:

```sql
-- Tabela de tokens de reset
CREATE TABLE password_reset_tokens (...);

-- Tabela de rate limiting
CREATE TABLE password_reset_attempts (...);
```

### 2. Estrutura das Tabelas

**password_reset_tokens:**
- `id` - UUID primário
- `user_id` - Referência ao usuário
- `token` - Token original (para email)
- `token_hash` - Hash do token (SHA-256)
- `expires_at` - Data de expiração
- `used_at` - Data de uso (null = não usado)
- `ip_address` - IP da requisição
- `user_agent` - User agent do navegador

**password_reset_attempts:**
- `id` - UUID primário
- `email` - Email da tentativa
- `ip_address` - IP da requisição
- `attempts` - Número de tentativas
- `last_attempt_at` - Última tentativa

## 🔌 APIs Criadas

### 1. POST `/api/auth/forgot-password`

Solicita reset de senha.

**Request:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Response (200):**
```json
{
  "message": "Se o email existir, você receberá um link de recuperação."
}
```

**Features:**
- Rate limiting (5/hora, 10/dia)
- Geração de token seguro
- Invalidação de tokens anteriores
- Envio de email (configurar serviço)

### 2. GET `/api/auth/verify-reset-token?token=TOKEN`

Valida token de reset.

**Response (200):**
```json
{
  "valid": true,
  "message": "Token válido"
}
```

**Response (400):**
```json
{
  "valid": false,
  "error": "Token inválido ou expirado"
}
```

### 3. POST `/api/auth/reset-password`

Reseta a senha do usuário.

**Request:**
```json
{
  "token": "token_aqui",
  "newPassword": "nova_senha_123"
}
```

**Response (200):**
```json
{
  "message": "Senha alterada com sucesso!",
  "success": true
}
```

**Features:**
- Validação de token
- Verificação de expiração
- Verificação de uso único
- Atualização de senha
- Invalidação de sessões

## 🎨 Páginas Front-End

### 1. `/reset-password?token=TOKEN`

Página para redefinir senha.

**Features:**
- Validação automática do token
- Formulário de nova senha
- Confirmação de senha
- Feedback visual
- Redirecionamento após sucesso

### 2. Login Modal (Atualizado)

O `LoginModal` já foi atualizado com:
- Link "Esqueci a senha"
- Formulário de solicitação
- Integração com API

## 📧 Configuração de Email

### Opção 1: Resend (Recomendado)

1. Criar conta em [resend.com](https://resend.com)
2. Obter API Key
3. Adicionar ao `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=noreply@seudominio.com
   ```

4. Atualizar `src/lib/email.ts`:
   ```typescript
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   export async function sendPasswordResetEmail(email: string, resetUrl: string) {
     await resend.emails.send({
       from: process.env.RESEND_FROM_EMAIL!,
       to: email,
       subject: 'Redefinir Senha - Telegrupos',
       html: emailOptions.html,
     });
   }
   ```

### Opção 2: SendGrid

1. Criar conta em [sendgrid.com](https://sendgrid.com)
2. Obter API Key
3. Instalar: `npm install @sendgrid/mail`
4. Atualizar `src/lib/email.ts` conforme documentação SendGrid

### Opção 3: AWS SES

1. Configurar AWS SES
2. Obter credenciais
3. Instalar: `npm install @aws-sdk/client-ses`
4. Atualizar `src/lib/email.ts` conforme documentação AWS

### Opção 4: Nodemailer (SMTP)

1. Instalar: `npm install nodemailer`
2. Configurar SMTP no `.env.local`
3. Atualizar `src/lib/email.ts` com configuração SMTP

## 🔒 Segurança Implementada

### Rate Limiting
- **5 tentativas por hora** por email/IP
- **10 tentativas por dia** por email
- Bloqueio automático após limite

### Token Security
- **32 bytes aleatórios** (64 caracteres hex)
- **Hash SHA-256** armazenado no banco
- **Expiração de 15 minutos**
- **Uso único** (marcado após uso)

### Validações
- Email válido
- Senha mínima de 6 caracteres
- Token não expirado
- Token não usado
- Token existe no banco

### Boas Práticas
- Não revela se email existe (security best practice)
- Invalida tokens anteriores ao gerar novo
- Invalida todas as sessões após reset
- Logs de tentativas para auditoria

## 🚀 Como Usar

### 1. Usuário esqueceu a senha

1. Clica em "Esqueci a senha" no login
2. Digita o email
3. Recebe email com link
4. Clica no link (válido por 15 min)
5. Digita nova senha
6. Senha é alterada

### 2. Fluxo Técnico

```
1. POST /api/auth/forgot-password
   → Gera token
   → Salva no banco
   → Envia email

2. GET /api/auth/verify-reset-token?token=xxx
   → Valida token
   → Verifica expiração
   → Retorna status

3. POST /api/auth/reset-password
   → Valida token novamente
   → Atualiza senha
   → Marca token como usado
   → Invalida sessões
```

## 🧪 Testes

### Testar Rate Limiting

```bash
# Fazer 6 requisições rapidamente
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done
# 6ª deve retornar 429 (Too Many Requests)
```

### Testar Token Expirado

1. Solicitar reset
2. Aguardar 16 minutos
3. Tentar usar token
4. Deve retornar erro de expiração

### Testar Token Usado

1. Solicitar reset
2. Usar token para resetar senha
3. Tentar usar mesmo token novamente
4. Deve retornar erro "já foi utilizado"

## 📝 Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# URL da aplicação (para links de email)
# Desenvolvimento:
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Produção:
NEXT_PUBLIC_APP_URL=https://www.grupostelegramx.com

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Email (escolher um serviço)
RESEND_API_KEY=... # Se usar Resend
# ou
SENDGRID_API_KEY=... # Se usar SendGrid
# etc.
```

## 🔧 Manutenção

### Limpar Tokens Expirados

Execute periodicamente (cron job ou função agendada):

```sql
SELECT cleanup_expired_tokens();
```

Ou configure no Supabase:
- Database → Functions → Schedule
- Criar função agendada para executar `cleanup_expired_tokens()` diariamente

### Monitorar Tentativas

```sql
-- Ver tentativas recentes
SELECT * FROM password_reset_attempts
ORDER BY last_attempt_at DESC
LIMIT 100;

-- Ver tokens ativos
SELECT * FROM password_reset_tokens
WHERE used_at IS NULL
AND expires_at > NOW();
```

## ⚠️ Importante

1. **Configure o serviço de email** antes de usar em produção
2. **Teste o fluxo completo** antes de deploy
3. **Monitore rate limiting** para evitar abusos
4. **Configure cleanup automático** de tokens expirados
5. **Use HTTPS** em produção (obrigatório para segurança)

## 🐛 Troubleshooting

### Email não está sendo enviado

- Verifique logs do console (em desenvolvimento)
- Configure serviço de email real
- Verifique variáveis de ambiente
- Teste serviço de email separadamente

### Token inválido

- Verifique se token não expirou (15 min)
- Verifique se token não foi usado
- Verifique se token está correto na URL

### Rate limiting muito restritivo

- Ajuste `MAX_ATTEMPTS_PER_HOUR` e `MAX_ATTEMPTS_PER_DAY` em `/api/auth/forgot-password/route.ts`

## ✅ Checklist de Deploy

- [ ] Schema SQL executado no Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] Serviço de email configurado e testado
- [ ] `NEXT_PUBLIC_APP_URL` configurado corretamente
- [ ] Testado fluxo completo de reset
- [ ] Rate limiting testado
- [ ] Cleanup de tokens configurado
- [ ] HTTPS configurado (produção)
- [ ] Logs de erro monitorados

---

**Sistema completo e pronto para uso!** 🎉

 aid