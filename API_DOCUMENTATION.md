# 📚 Documentação da API - Sistema de Recuperação de Senha

Esta documentação descreve todos os endpoints relacionados ao sistema de recuperação de senha.

## 📋 Índice

- [Endpoints](#endpoints)
  - [POST /api/auth/forgot-password](#post-apiauthforgot-password)
  - [POST /api/auth/reset-password](#post-apiauthreset-password)
  - [GET /api/auth/verify-reset-token](#get-apiauthverify-reset-token)
- [Estruturas de Dados](#estruturas-de-dados)
- [Códigos de Erro](#códigos-de-erro)
- [Exemplos de Uso](#exemplos-de-uso)
- [Segurança](#segurança)

---

## 🔌 Endpoints

### POST `/api/auth/forgot-password`

Solicita o envio de um email de recuperação de senha.

#### Request Body

```json
{
  "email": "usuario@example.com"
}
```

#### Headers

```
Content-Type: application/json
```

#### Response 200 (Sucesso)

```json
{
  "ok": true,
  "message": "Se o email existir, você receberá um link de recuperação."
}
```

**Nota de Segurança:** Sempre retorna sucesso, mesmo se o email não existir. Isso previne enumeração de emails.

#### Response 400 (Bad Request)

```json
{
  "error": "Email inválido"
}
```

#### Response 429 (Rate Limit Excedido)

```json
{
  "error": "Muitas tentativas. Aguarde 1 hora antes de tentar novamente."
}
```

#### Rate Limiting

- **Por IP:** Máximo 5 requisições por hora
- **Por Email:** Máximo 3 requisições por hora

#### Exemplo com cURL

```bash
curl -X POST https://www.grupostelegramx.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com"
  }'
```

#### Exemplo com JavaScript (Fetch)

```javascript
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@example.com',
  }),
});

const data = await response.json();
console.log(data);
```

---

### POST `/api/auth/reset-password`

Atualiza a senha do usuário usando um token de recuperação válido.

#### Request Body

```json
{
  "token": "token_de_recuperacao_aqui",
  "newPassword": "NovaSenha123!@#"
}
```

#### Headers

```
Content-Type: application/json
```

#### Response 200 (Sucesso)

```json
{
  "message": "Senha alterada com sucesso!",
  "success": true
}
```

#### Response 400 (Bad Request)

Possíveis erros:

```json
{
  "error": "Token inválido"
}
```

```json
{
  "error": "Nova senha é obrigatória"
}
```

```json
{
  "error": "A senha deve ter pelo menos 10 caracteres"
}
```

```json
{
  "error": "Token já foi utilizado. Solicite um novo link de recuperação."
}
```

```json
{
  "error": "Token expirado. Solicite um novo link de recuperação."
}
```

#### Response 500 (Internal Server Error)

```json
{
  "error": "Erro ao processar solicitação. Tente novamente."
}
```

#### Requisitos de Senha

A nova senha deve atender aos seguintes critérios:

- ✅ Mínimo de **10 caracteres**
- ✅ Máximo de **128 caracteres**
- ✅ Pelo menos **1 letra minúscula** (a-z)
- ✅ Pelo menos **1 letra maiúscula** (A-Z)
- ✅ Pelo menos **1 número** (0-9)
- ✅ Pelo menos **1 caractere especial** (!@#$%^&*...)

#### Exemplo com cURL

```bash
curl -X POST https://www.grupostelegramx.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "newPassword": "NovaSenha123!@#"
  }'
```

#### Exemplo com JavaScript (Fetch)

```javascript
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: 'token_de_recuperacao',
    newPassword: 'NovaSenha123!@#',
  }),
});

const data = await response.json();
if (data.success) {
  console.log('Senha alterada com sucesso!');
} else {
  console.error('Erro:', data.error);
}
```

---

### GET `/api/auth/verify-reset-token`

Verifica se um token de recuperação é válido e ainda não foi usado.

#### Query Parameters

```
?token=token_de_recuperacao_aqui
```

#### Response 200 (Token Válido)

```json
{
  "valid": true,
  "message": "Token válido"
}
```

#### Response 400 (Token Inválido)

```json
{
  "valid": false,
  "error": "Token inválido ou expirado"
}
```

#### Exemplo com cURL

```bash
curl "https://www.grupostelegramx.com/api/auth/verify-reset-token?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Exemplo com JavaScript (Fetch)

```javascript
const token = 'token_de_recuperacao';
const response = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
const data = await response.json();

if (data.valid) {
  console.log('Token válido!');
} else {
  console.error('Token inválido:', data.error);
}
```

---

## 📊 Estruturas de Dados

### Password Reset Token

```typescript
interface PasswordResetToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string; // ISO 8601
  used_at: string | null; // ISO 8601 ou null
  created_at: string; // ISO 8601
}
```

### Password Reset Attempt

```typescript
interface PasswordResetAttempt {
  id: string;
  email: string;
  ip_address: string;
  attempts: number;
  last_attempt_at: string; // ISO 8601
}
```

---

## 🚨 Códigos de Erro

| Código HTTP | Descrição | Ação Recomendada |
|------------|-----------|-------------------|
| 200 | Sucesso | - |
| 400 | Bad Request - Dados inválidos | Verificar formato do request |
| 429 | Rate Limit Excedido | Aguardar antes de tentar novamente |
| 500 | Internal Server Error | Tentar novamente mais tarde |

---

## 💡 Exemplos de Uso

### Fluxo Completo de Recuperação

```javascript
// 1. Solicitar reset
async function requestPasswordReset(email) {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  return data.ok;
}

// 2. Verificar token (quando usuário clica no link)
async function verifyToken(token) {
  const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
  const data = await response.json();
  return data.valid;
}

// 3. Resetar senha
async function resetPassword(token, newPassword) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  
  const data = await response.json();
  return data.success;
}

// Uso completo
const email = 'usuario@example.com';
await requestPasswordReset(email);
// Usuário recebe email e clica no link
// Token é extraído da URL
const token = 'token_do_link';
const isValid = await verifyToken(token);
if (isValid) {
  await resetPassword(token, 'NovaSenha123!@#');
}
```

---

## 🔒 Segurança

### Boas Práticas Implementadas

1. **Rate Limiting**
   - Limite por IP: 5 requisições/hora
   - Limite por email: 3 requisições/hora
   - Previne abuso e ataques de força bruta

2. **Token Seguro**
   - Tokens são hasheados antes de armazenar
   - Tokens expiram em 1 hora
   - Tokens são de uso único (invalidados após uso)

3. **Validação de Senha Forte**
   - Mínimo 10 caracteres
   - Requisitos de complexidade (maiúscula, minúscula, número, símbolo)

4. **Não Revelação de Informações**
   - Endpoint de forgot-password sempre retorna sucesso
   - Não revela se email existe ou não

5. **Logs Estruturados**
   - Todos os eventos são logados com contexto
   - Facilita auditoria e debugging

### Recomendações Adicionais

- Use HTTPS em produção
- Configure CORS adequadamente
- Monitore tentativas de reset suspeitas
- Considere implementar CAPTCHA após múltiplas tentativas
- Use Sentry ou similar para monitoramento de erros

---

## 📝 Notas de Implementação

### Fluxo do Supabase

O sistema usa o Supabase Auth para gerenciar tokens. O fluxo é:

1. **Solicitação:** `admin.auth.admin.resetPasswordForEmail()` gera um link
2. **Link:** Contém `access_token` e `type=recovery` no hash da URL
3. **Validação:** Frontend valida token usando `supabase.auth.setSession()`
4. **Reset:** Frontend usa `supabase.auth.updateUser()` para alterar senha

### Expiração de Token

- **Padrão:** 1 hora (configurável no Supabase Dashboard)
- **Como alterar:** Settings > Auth > Email Templates > Reset Password > Expiration

### Personalização de Email

O template de email pode ser personalizado no Supabase Dashboard:

1. Vá em **Settings** > **Auth** > **Email Templates**
2. Selecione **Reset Password**
3. Use `{{ .ConfirmationURL }}` para o link
4. Personalize HTML conforme necessário

Veja `src/lib/email-templates.ts` para exemplos de templates.

---

## 🐛 Troubleshooting

### Email não está sendo enviado

1. Verifique configuração SMTP no Supabase Dashboard
2. Verifique logs do Supabase (Dashboard > Logs > Auth Logs)
3. Verifique se `NEXT_PUBLIC_APP_URL` está configurado corretamente

### Token inválido ou expirado

1. Verifique se o link não foi usado antes
2. Verifique se o token não expirou (1 hora)
3. Solicite um novo link de recuperação

### Rate limit excedido

1. Aguarde 1 hora antes de tentar novamente
2. Use um IP diferente (se em desenvolvimento)
3. Verifique logs para identificar tentativas suspeitas

---

**Última atualização:** 2025-01-25












