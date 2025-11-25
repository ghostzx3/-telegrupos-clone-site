# 🚀 Guia de Setup Completo - Sistema de Recuperação de Senha

Este guia fornece instruções passo-a-passo para configurar e executar o sistema de recuperação de senha localmente e em produção.

## 📋 Pré-requisitos

- Node.js 20+ ou Bun
- Conta no Supabase (gratuita)
- Git
- Editor de código (VS Code recomendado)

## 🔧 Passo 1: Clonar e Instalar

```bash
# 1. Clonar repositório
git clone <seu-repositorio>
cd telegrupos-clone

# 2. Instalar dependências
npm install
# ou
bun install

# 3. Instalar Playwright (para testes E2E)
npx playwright install
```

## 🔐 Passo 2: Configurar Supabase

### 2.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (se não tiver)
3. Crie um novo projeto
4. Aguarde o provisionamento (2-3 minutos)

### 2.2 Obter Credenciais

1. No Dashboard do Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NUNCA exponha no cliente!)

### 2.3 Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Abra o arquivo `supabase/password_reset_schema.sql`
3. Copie e cole o conteúdo
4. Execute (botão "Run")

Isso cria as tabelas necessárias:
- `password_reset_attempts` (rate limiting)
- `password_reset_tokens` (tokens de recuperação)

## 📝 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar arquivo `.env.local`

```bash
# Copiar exemplo
cp env.example .env.local
```

### 3.2 Editar `.env.local`

```env
# Supabase (obtenha em: https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Em produção: https://www.grupostelegramx.com

# Ambiente
NODE_ENV=development
```

## 📧 Passo 4: Configurar SMTP (Envio de Emails)

### Opção 1: SMTP de Teste (Desenvolvimento)

1. No Supabase Dashboard, vá em **Settings** > **Auth** > **SMTP Settings**
2. Ative "Enable Custom SMTP"
3. Use o SMTP de teste do Supabase (limitado, apenas para dev)

### Opção 2: Gmail (Recomendado para Testes)

1. Crie uma "App Password" no Google Account
2. Configure no Supabase:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: seu-email@gmail.com
   SMTP Password: sua-app-password
   Sender Email: seu-email@gmail.com
   Sender Name: GruposTelegramX
   ```

### Opção 3: SendGrid (Produção)

1. Crie conta em [sendgrid.com](https://sendgrid.com)
2. Obtenha API Key
3. Configure no Supabase usando credenciais SMTP do SendGrid

**📖 [Guia Completo de Configuração SMTP](./CONFIGURAR_SMTP_SUPABASE.md)**

## 🔗 Passo 5: Configurar URLs de Redirecionamento

1. No Supabase Dashboard, vá em **Settings** > **Auth** > **URL Configuration**
2. Configure:

**Desenvolvimento:**
```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/reset-password
  - http://localhost:3000/dashboard/senha
```

**Produção:**
```
Site URL: https://www.grupostelegramx.com
Redirect URLs:
  - https://www.grupostelegramx.com/reset-password
  - https://www.grupostelegramx.com/dashboard/senha
```

## 🎨 Passo 6: Personalizar Template de Email (Opcional)

1. No Supabase Dashboard, vá em **Settings** > **Auth** > **Email Templates**
2. Selecione **Reset Password**
3. Use o template de `src/lib/email-templates.ts` como referência
4. Use `{{ .ConfirmationURL }}` para o link de recuperação

## ▶️ Passo 7: Executar Localmente

```bash
# Iniciar servidor de desenvolvimento
npm run dev
# ou
bun run dev

# Acesse: http://localhost:3000
```

## ✅ Passo 8: Testar o Sistema

### 8.1 Testar Fluxo Completo

1. Acesse `http://localhost:3000/forgot-password`
2. Digite um email válido
3. Verifique sua caixa de entrada
4. Clique no link recebido
5. Defina uma nova senha (mínimo 10 caracteres, com maiúscula, minúscula, número e símbolo)
6. Verifique se foi redirecionado para login

### 8.2 Executar Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage

# Testes E2E (requer servidor rodando)
npm run test:e2e
```

## 🚀 Passo 9: Deploy em Produção

### 9.1 Vercel (Recomendado)

1. Conecte repositório ao Vercel
2. Configure variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL de produção)
3. Deploy automático

### 9.2 Atualizar URLs no Supabase

Após deploy, atualize as URLs de redirecionamento no Supabase para a URL de produção.

## 🧪 Verificações Finais

- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Testes passam (`npm test`)
- [ ] Email de recuperação é enviado
- [ ] Link de recuperação funciona
- [ ] Reset de senha funciona
- [ ] Rate limiting funciona
- [ ] Validação de senha funciona

## 📚 Documentação Adicional

- **[PASSWORD_RECOVERY_README.md](./PASSWORD_RECOVERY_README.md)** - Documentação completa do sistema
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentação da API
- **[CONFIGURAR_SMTP_SUPABASE.md](./CONFIGURAR_SMTP_SUPABASE.md)** - Guia de SMTP

## 🐛 Problemas Comuns

### Email não está sendo enviado

**Solução:**
1. Verifique configuração SMTP no Supabase
2. Verifique logs do Supabase (Dashboard > Logs > Auth Logs)
3. Verifique se `NEXT_PUBLIC_APP_URL` está correto

### Token inválido

**Solução:**
1. Verifique se URLs de redirecionamento estão configuradas
2. Verifique se token não expirou (1 hora)
3. Solicite um novo link

### Erro de build

**Solução:**
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Execute `npm run lint` para verificar erros
3. Execute `npm test` para verificar testes

---

**Pronto!** Seu sistema de recuperação de senha está configurado e funcionando! 🎉

