# Sistema de Recuperação de Senha - Documentação Completa

## 📋 Visão Geral

Sistema completo e robusto de recuperação de senha usando Next.js 15 (App Router) e Supabase Auth. O sistema permite que usuários redefinam suas senhas através de um link enviado por email, **sem exigir a senha atual**.

## 🏗️ Arquitetura

### Stack Tecnológica

- **Next.js 15+** (App Router)
- **Supabase Auth** (envio de emails e gerenciamento de tokens)
- **TypeScript** (tipagem estática)
- **Tailwind CSS** (estilização)
- **Jest + Testing Library** (testes automatizados)

### Fluxo de Recuperação

```
1. Usuário acessa /forgot-password
2. Usuário informa email
3. Backend valida email e aplica rate limiting
4. Supabase envia email com link de recuperação
5. Usuário clica no link (contém token no hash da URL)
6. Usuário é redirecionado para /reset-password
7. Frontend valida token automaticamente
8. Usuário define nova senha (validação forte)
9. Senha é atualizada e usuário é redirecionado para login
```

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   ├── forgot-password/
│   │   └── page.tsx              # Página de solicitação de reset
│   ├── reset-password/
│   │   └── page.tsx              # Página de redefinição de senha
│   └── api/
│       └── auth/
│           └── forgot-password/
│               └── route.ts      # Endpoint de solicitação de reset
├── lib/
│   └── supabase/
│       ├── admin.ts              # Cliente Supabase Admin (server-side)
│       └── client.ts             # Cliente Supabase (client-side)
└── __tests__/
    └── api/
        └── auth/
            └── forgot-password.test.ts  # Testes unitários
```

## 🔐 Endpoints da API

### POST `/api/auth/forgot-password`

Solicita envio de email de recuperação de senha.

**Request Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (200 OK):**
```json
{
  "ok": true,
  "message": "Se o email existir, você receberá um link de recuperação."
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Email inválido"
}
```

**Response (429 Too Many Requests):**
```json
{
  "error": "Muitas tentativas. Aguarde 1 hora antes de tentar novamente."
}
```

**Exemplo com cURL:**
```bash
curl -X POST https://seu-dominio.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com"}'
```

## 🔒 Segurança

### Rate Limiting

- **5 tentativas por hora por IP** (previne abuso de requisições)
- **3 tentativas por hora por email** (previne spam para um email específico)
- Implementado usando tabela `password_reset_attempts` no Supabase

### Validação de Senha

A nova senha deve atender aos seguintes critérios:

- ✅ Mínimo de **10 caracteres**
- ✅ Pelo menos **1 letra minúscula** (a-z)
- ✅ Pelo menos **1 letra maiúscula** (A-Z)
- ✅ Pelo menos **1 número** (0-9)
- ✅ Pelo menos **1 caractere especial** (!@#$%^&*...)
- ✅ Máximo de **128 caracteres**

### Proteção de Privacidade

- **Não revela existência de email**: Sempre retorna sucesso, mesmo se o email não existir
- **Logs estruturados**: Erros são logados apenas no servidor (não expostos ao cliente)
- **Tokens expiram**: Tokens do Supabase expiram automaticamente (padrão: 1 hora)

### Uso de Service Role Key

- A `SUPABASE_SERVICE_ROLE_KEY` é usada **apenas no servidor** (API Routes)
- **NUNCA** deve ser exposta no cliente
- Permite operações administrativas como envio de emails de reset

## 📧 Configuração de Email (SMTP)

O Supabase envia emails automaticamente quando o SMTP está configurado.

### Configurar SMTP no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** → **Auth** → **SMTP Settings**
3. Configure seu provedor SMTP:
   - **Gmail**: Use App Password
   - **SendGrid**: Use API Key
   - **AWS SES**: Use credenciais IAM
   - **Mailtrap** (desenvolvimento): Use credenciais de teste

### Template de Email

O Supabase usa um template padrão, mas você pode personalizá-lo:

1. Vá em **Settings** → **Auth** → **Email Templates**
2. Selecione **Reset Password**
3. Personalize o HTML e texto

**Exemplo de template HTML:**
```html
<h2>Redefinir Senha</h2>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Este link expira em 1 hora.</p>
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Cobertura Mínima

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Testes Implementados

1. **Testes Unitários** (`src/__tests__/api/auth/forgot-password.test.ts`):
   - Validação de email
   - Rate limiting
   - Chamada ao Supabase
   - Tratamento de erros

2. **Testes de Validação** (`src/__tests__/utils/password-validation.test.ts`):
   - Validação de senha forte
   - Múltiplos critérios
   - Mensagens de erro

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NODE_ENV=development
```

### 2. Configurar Banco de Dados

Execute o schema SQL no Supabase:

```sql
-- Tabela para rate limiting
CREATE TABLE IF NOT EXISTS password_reset_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_password_reset_email_time 
  ON password_reset_attempts(email, last_attempt_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_ip_time 
  ON password_reset_attempts(ip_address, last_attempt_at);
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

### 5. Testar o Fluxo

1. Acesse `http://localhost:3000/forgot-password`
2. Digite um email válido
3. Verifique o console do servidor (em desenvolvimento, o link será logado)
4. Clique no link recebido
5. Defina uma nova senha (mínimo 10 caracteres com os critérios)
6. Faça login com a nova senha

## 📊 Logs Estruturados

O sistema usa logs estruturados em JSON para facilitar monitoramento:

```json
{
  "event": "password_reset_email_sent",
  "email": "usuario@example.com",
  "ip": "127.0.0.1",
  "redirectUrl": "https://seu-dominio.com/reset-password",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Eventos logados:**
- `password_reset_email_sent` - Email enviado com sucesso
- `password_reset_email_error` - Erro ao enviar email
- `password_reset_request_error` - Erro na requisição
- `forgot_password_endpoint_error` - Erro crítico no endpoint

## 🔄 Fluxo do Token

O Supabase gera um token de recuperação que:

1. **É incluído no hash da URL**: `#access_token=TOKEN&type=recovery`
2. **Expira em 1 hora** (configurável no Supabase)
3. **É de uso único** (após usar, não pode ser reutilizado)
4. **É validado automaticamente** pelo cliente Supabase

### Como o Token Funciona

```typescript
// O Supabase envia um link como:
https://seu-dominio.com/reset-password#access_token=eyJ...&type=recovery

// O frontend extrai o token do hash:
const hash = window.location.hash.substring(1);
const hashParams = new URLSearchParams(hash);
const accessToken = hashParams.get('access_token');
const type = hashParams.get('type');

// Valida o token criando uma sessão:
await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: '',
});
```

## 🐛 Troubleshooting

### Email não está sendo enviado

1. **Verifique SMTP no Supabase Dashboard**
   - Settings → Auth → SMTP Settings
   - Teste a conexão SMTP

2. **Verifique logs do servidor**
   - Procure por `password_reset_email_error`
   - Verifique se há erros de conexão SMTP

3. **Em desenvolvimento**
   - Use Mailtrap ou similar para testar
   - Verifique a pasta de spam

### Token inválido ou expirado

1. **Token expirou**: Solicite um novo link (tokens expiram em 1 hora)
2. **Token já usado**: Tokens são de uso único
3. **URL incorreta**: Verifique se `NEXT_PUBLIC_APP_URL` está correto

### Rate limit sendo atingido

- **Aguarde 1 hora** antes de tentar novamente
- **Limite por IP**: 5 tentativas/hora
- **Limite por email**: 3 tentativas/hora

## 📝 Exemplos de Requisições

### Solicitar Reset de Senha

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com"}'
```

### Resposta de Sucesso

```json
{
  "ok": true,
  "message": "Se o email existir, você receberá um link de recuperação."
}
```

### Resposta de Erro (Rate Limit)

```json
{
  "error": "Muitas tentativas. Aguarde 1 hora antes de tentar novamente."
}
```

## 🔗 Links Úteis

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 📄 Licença

Este sistema faz parte do projeto Telegrupos Clone e está disponível para uso e modificação.

---

**Última atualização**: 2024-01-15

