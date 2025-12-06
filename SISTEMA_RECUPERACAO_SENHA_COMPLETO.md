# 🔐 Sistema Completo de Recuperação de Senha

Sistema profissional, seguro e totalmente funcional de recuperação de senha usando Supabase Auth.

## 📋 Visão Geral

O sistema permite que usuários recuperem suas senhas através de um fluxo seguro:

1. **Usuário solicita recuperação** → Informa apenas o email
2. **Backend envia email** → Via Supabase Auth com link seguro
3. **Usuário clica no link** → Redirecionado para página de reset
4. **Usuário define nova senha** → Com validações robustas
5. **Sistema confirma** → Senha atualizada e usuário deslogado

## 🏗️ Arquitetura

### Endpoints da API

#### 1. `POST /api/auth/forgot-password`

**Descrição:** Solicita envio de email de recuperação de senha.

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

**Response (400):**
```json
{
  "error": "Email inválido"
}
```

**Response (429):**
```json
{
  "error": "Muitas tentativas. Aguarde 1 hora antes de tentar novamente."
}
```

**Features:**
- ✅ Validação de email
- ✅ Rate limiting (5 tentativas/hora, 10/dia por IP+email)
- ✅ Uso do Supabase Auth `resetPasswordForEmail`
- ✅ Logs detalhados para debug
- ✅ Security best practices (não revela se email existe)

### Páginas Frontend

#### 1. `/forgot-password`

**Descrição:** Página para solicitar recuperação de senha.

**Features:**
- ✅ Interface moderna e responsiva
- ✅ Validação de email no frontend
- ✅ Feedback visual claro
- ✅ Mensagens de sucesso/erro
- ✅ Link para voltar ao login

**Fluxo:**
1. Usuário digita email
2. Clica em "Enviar Link de Recuperação"
3. Recebe feedback de sucesso
4. Instruções para verificar email

#### 2. `/reset-password`

**Descrição:** Página para definir nova senha após clicar no link do email.

**Features:**
- ✅ Validação automática do token do Supabase
- ✅ Validação robusta de senha
- ✅ Feedback visual de erros
- ✅ Redirecionamento automático após sucesso
- ✅ Tratamento de token expirado/inválido

**Validações de Senha:**
- Mínimo 8 caracteres
- Máximo 128 caracteres
- Pelo menos uma letra minúscula
- Pelo menos uma letra maiúscula
- Pelo menos um número
- Pelo menos um caractere especial

## 🔒 Segurança

### Implementações de Segurança

1. **Rate Limiting**
   - 5 tentativas por hora por IP+email
   - 10 tentativas por dia por IP+email
   - Previne ataques de força bruta

2. **Token Seguro**
   - Tokens gerados pelo Supabase Auth
   - Expiração automática (1 hora)
   - Uso único (invalidado após uso)

3. **Validação de Senha**
   - Requisitos fortes de complexidade
   - Prevenção de senhas comuns
   - Validação no frontend e backend

4. **Security Best Practices**
   - Não revela se email existe ou não
   - Logs detalhados apenas em desenvolvimento
   - Tratamento de erros genérico para usuários

5. **CSRF Protection**
   - Tokens do Supabase incluem proteção CSRF
   - Validação de origem no backend

## 📧 Configuração do Supabase

### 1. Configurar SMTP

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** > **Auth** > **SMTP Settings**
3. Ative **Enable Custom SMTP**
4. Configure seu servidor SMTP (Gmail, SendGrid, Mailgun, etc.)

**Exemplo com Gmail:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Password: [Senha de App do Gmail]
Sender Email: seu-email@gmail.com
Sender Name: GruposTelegramX
```

**Importante:** Para Gmail, você precisa criar uma "Senha de App":
- Acesse: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Gere uma senha de app e use no campo "SMTP Password"

### 2. Configurar URLs de Redirecionamento

1. Vá em **Settings** > **Auth** > **URL Configuration**
2. Configure:

```
Site URL: https://www.grupostelegramx.com
Redirect URLs: 
  - https://www.grupostelegramx.com/reset-password
  - https://www.grupostelegramx.com/dashboard/senha
```

### 3. Personalizar Template de Email (Opcional)

1. Vá em **Settings** > **Auth** > **Email Templates**
2. Selecione **Reset Password**
3. Personalize o template HTML
4. Use `{{ .ConfirmationURL }}` para o link

## 🔧 Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# URL da aplicação (para links de email)
NEXT_PUBLIC_APP_URL=https://www.grupostelegramx.com

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 📝 Fluxo Completo

### 1. Solicitação de Recuperação

```
Usuário → /forgot-password
  ↓
Digita email
  ↓
POST /api/auth/forgot-password
  ↓
Backend valida email
  ↓
Backend verifica rate limit
  ↓
Backend chama Supabase resetPasswordForEmail
  ↓
Supabase envia email com link
  ↓
Usuário recebe feedback de sucesso
```

### 2. Reset de Senha

```
Usuário clica no link do email
  ↓
Redirecionado para /reset-password#access_token=...&type=recovery
  ↓
Frontend extrai token do hash
  ↓
Frontend valida token com Supabase
  ↓
Usuário digita nova senha
  ↓
Frontend valida senha (requisitos)
  ↓
Frontend chama supabase.auth.updateUser()
  ↓
Senha atualizada
  ↓
Usuário deslogado
  ↓
Redirecionado para login
```

## 🧪 Testes

### Teste 1: Solicitar Recuperação

1. Acesse `/forgot-password`
2. Digite um email válido
3. Clique em "Enviar Link de Recuperação"
4. Verifique se recebe mensagem de sucesso
5. Verifique sua caixa de entrada

### Teste 2: Reset de Senha

1. Clique no link recebido no email
2. Verifique se é redirecionado para `/reset-password`
3. Digite uma senha que atenda aos requisitos
4. Confirme a senha
5. Clique em "Alterar Senha"
6. Verifique se é redirecionado para login

### Teste 3: Validações

1. Tente senha com menos de 8 caracteres → Deve mostrar erro
2. Tente senha sem maiúscula → Deve mostrar erro
3. Tente senha sem número → Deve mostrar erro
4. Tente senha sem caractere especial → Deve mostrar erro
5. Tente senhas que não coincidem → Deve mostrar erro

### Teste 4: Token Expirado

1. Aguarde 1 hora após receber o link
2. Tente usar o link → Deve mostrar erro de token expirado
3. Solicite um novo link

### Teste 5: Rate Limiting

1. Faça 6 tentativas seguidas com o mesmo email
2. Na 6ª tentativa → Deve mostrar erro de rate limit
3. Aguarde 1 hora e tente novamente

## 🐛 Troubleshooting

### Email não está sendo enviado

**Causas possíveis:**
1. SMTP não configurado no Supabase
2. Credenciais SMTP incorretas
3. Email na pasta de spam
4. Limite do provedor SMTP atingido

**Soluções:**
1. Verifique logs do Supabase (Dashboard > Logs)
2. Verifique configurações SMTP
3. Teste conexão SMTP
4. Verifique pasta de spam

### Token inválido ou expirado

**Causas possíveis:**
1. Token expirou (1 hora)
2. Token já foi usado
3. Link alterado ou corrompido

**Soluções:**
1. Solicite um novo link
2. Verifique se o link está completo
3. Não compartilhe o link

### Erro ao atualizar senha

**Causas possíveis:**
1. Token expirado durante o processo
2. Senha não atende requisitos
3. Erro no Supabase

**Soluções:**
1. Solicite um novo link
2. Verifique requisitos da senha
3. Verifique logs do console

## 📊 Monitoramento

### Logs do Supabase

- Dashboard > Logs > Auth Logs
- Ver tentativas de reset
- Ver erros de envio de email
- Ver erros de validação

### Logs da Aplicação

Em desenvolvimento, os logs aparecem no console:
- Tentativas de reset
- Erros de validação
- Erros de SMTP
- Rate limiting

## ✅ Checklist de Implementação

- [x] API `/api/auth/forgot-password` implementada
- [x] Página `/forgot-password` criada
- [x] Página `/reset-password` melhorada
- [x] Validação robusta de senha
- [x] Rate limiting implementado
- [x] Tratamento de erros robusto
- [x] Logs detalhados
- [x] Security best practices
- [x] Interface responsiva
- [x] Feedback visual claro
- [x] Redirecionamentos corretos
- [x] Documentação completa

## 🎯 Próximos Passos

1. **Configurar SMTP no Supabase** (obrigatório)
2. **Testar fluxo completo** em desenvolvimento
3. **Configurar URLs** no Supabase Dashboard
4. **Personalizar template de email** (opcional)
5. **Monitorar logs** em produção

## 📚 Referências

- [Supabase Auth Email](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase SMTP Settings](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-admin-resetpasswordforemail)

---

**Sistema desenvolvido com foco em segurança, usabilidade e robustez.**














