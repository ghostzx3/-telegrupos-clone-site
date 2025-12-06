# 🔐 Sistema de Recuperação de Senha - Guia Completo

Sistema completo e robusto de recuperação de senha usando Next.js 15, Supabase Auth e TypeScript.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Instalação e Configuração](#instalação-e-configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Testes](#testes)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este sistema implementa um fluxo completo de recuperação de senha com as seguintes características:

✅ **Segurança Robusta**
- Rate limiting (5 requisições/hora por IP, 3 por email)
- Tokens de uso único com expiração (1 hora)
- Validação forte de senha (mínimo 10 caracteres)
- Não revela existência de emails (security best practice)

✅ **Arquitetura Profissional**
- Next.js 15 App Router
- TypeScript
- Supabase Auth (envio de emails nativo)
- Logs estruturados
- Tratamento de erros completo

✅ **Testes Automatizados**
- Testes unitários (Jest)
- Testes de integração
- Testes E2E (Playwright)
- Cobertura mínima de 70%

✅ **CI/CD**
- GitHub Actions configurado
- Lint, testes e build automáticos

---

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- Node.js 20+ ou Bun
- Conta no Supabase
- Git

### 2. Clonar e Instalar

```bash
# Clonar repositório
git clone <seu-repositorio>
cd telegrupos-clone

# Instalar dependências
npm install
# ou
bun install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `env.example` para `.env.local`:

```bash
cp env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Supabase (obtenha em: https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Em produção: https://www.grupostelegramx.com

# Ambiente
NODE_ENV=development
```

### 4. Configurar Banco de Dados

Execute o schema SQL no Supabase:

```bash
# Acesse o Supabase SQL Editor
# Execute o arquivo: supabase/password_reset_schema.sql
```

Este schema cria:
- Tabela `password_reset_attempts` (rate limiting)
- Tabela `password_reset_tokens` (tokens de recuperação)

### 5. Configurar SMTP no Supabase

Para que os emails sejam enviados, configure SMTP:

1. Acesse **Supabase Dashboard** > **Settings** > **Auth** > **SMTP Settings**
2. Configure um provedor SMTP (Gmail, SendGrid, Mailgun, etc.)
3. Ou use o SMTP de teste do Supabase (apenas para desenvolvimento)

**📖 [Guia Completo de Configuração SMTP](./CONFIGURAR_SMTP_SUPABASE.md)**

### 6. Configurar URLs de Redirecionamento

No Supabase Dashboard:

1. Vá em **Settings** > **Auth** > **URL Configuration**
2. Configure:
   ```
   Site URL: http://localhost:3000 (dev) ou https://www.grupostelegramx.com (prod)
   Redirect URLs:
     - http://localhost:3000/reset-password
     - https://www.grupostelegramx.com/reset-password
   ```

### 7. Personalizar Template de Email (Opcional)

1. Vá em **Settings** > **Auth** > **Email Templates**
2. Selecione **Reset Password**
3. Use o template de `src/lib/email-templates.ts` como referência
4. Use `{{ .ConfirmationURL }}` para o link de recuperação

---

## 📁 Estrutura do Projeto

```
telegrupos-clone/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── forgot-password/
│   │   │       │   └── route.ts          # Endpoint de solicitação
│   │   │       ├── reset-password/
│   │   │       │   └── route.ts           # Endpoint de reset (opcional)
│   │   │       └── verify-reset-token/
│   │   │           └── route.ts           # Endpoint de verificação
│   │   ├── forgot-password/
│   │   │   └── page.tsx                   # Página de solicitação
│   │   └── reset-password/
│   │       └── page.tsx                   # Página de reset
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── admin.ts                   # Cliente Supabase Admin
│   │   │   └── client.ts                  # Cliente Supabase Client
│   │   ├── utils/
│   │   │   └── password-validation.ts    # Validação de senha
│   │   └── email-templates.ts             # Templates de email
│   └── __tests__/
│       ├── api/
│       │   └── auth/
│       │       └── forgot-password.test.ts
│       ├── utils/
│       │   └── password-validation.test.ts
│       └── e2e/
│           └── password-reset.spec.ts     # Testes E2E
├── supabase/
│   └── password_reset_schema.sql          # Schema do banco
├── .github/
│   └── workflows/
│       └── ci.yml                         # CI/CD
├── env.example                             # Exemplo de variáveis
├── jest.config.js                          # Config Jest
├── playwright.config.ts                    # Config Playwright
└── README.md                               # README principal
```

---

## ⚙️ Funcionalidades

### 1. Solicitar Recuperação de Senha

**Endpoint:** `POST /api/auth/forgot-password`

**Página:** `/forgot-password`

**Fluxo:**
1. Usuário acessa `/forgot-password`
2. Digita email
3. Sistema valida email e verifica rate limit
4. Supabase envia email com link de recuperação
5. Usuário recebe feedback de sucesso

**Características:**
- ✅ Validação de email
- ✅ Rate limiting (5/hora por IP, 3/hora por email)
- ✅ Logs estruturados
- ✅ Não revela se email existe (security)

### 2. Redefinir Senha

**Página:** `/reset-password`

**Fluxo:**
1. Usuário clica no link do email
2. É redirecionado para `/reset-password#access_token=...&type=recovery`
3. Frontend valida token com Supabase
4. Usuário digita nova senha (com validação em tempo real)
5. Sistema atualiza senha e invalida token
6. Usuário é deslogado e redirecionado para login

**Validação de Senha:**
- ✅ Mínimo 10 caracteres
- ✅ Máximo 128 caracteres
- ✅ Pelo menos 1 letra minúscula
- ✅ Pelo menos 1 letra maiúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial

### 3. Segurança

**Rate Limiting:**
- Limite por IP: 5 requisições/hora
- Limite por email: 3 requisições/hora
- Armazenado no banco de dados

**Tokens:**
- Expiração: 1 hora (configurável no Supabase)
- Uso único (invalidado após uso)
- Hash SHA-256 antes de armazenar

**Validação:**
- Frontend: Validação em tempo real
- Backend: Validação dupla (segurança)

---

## 🧪 Testes

### Testes Unitários

```bash
# Executar todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura
npm run test:coverage
```

**Cobertura Mínima:** 70%

### Testes E2E (Playwright)

```bash
# Instalar Playwright (primeira vez)
npx playwright install

# Executar testes E2E
npm run test:e2e

# Interface gráfica
npm run test:e2e:ui

# Modo debug
npm run test:e2e:debug
```

**Testes E2E Incluem:**
- ✅ Fluxo completo de recuperação
- ✅ Validação de formulários
- ✅ Testes em mobile
- ✅ Testes de loading states

### CI/CD

O GitHub Actions executa automaticamente:
- ✅ Lint
- ✅ Testes unitários
- ✅ Testes E2E
- ✅ Build de produção
- ✅ Verificação de cobertura

---

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. Deploy automático a cada push

### Netlify

1. Conecte repositório
2. Configure variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `.next`

### Outros

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

---

## 🐛 Troubleshooting

### Email não está sendo enviado

**Causas comuns:**
1. SMTP não configurado no Supabase
2. `NEXT_PUBLIC_APP_URL` incorreto
3. URLs de redirecionamento não configuradas

**Solução:**
1. Verifique logs do Supabase (Dashboard > Logs > Auth Logs)
2. Configure SMTP (veja [CONFIGURAR_SMTP_SUPABASE.md](./CONFIGURAR_SMTP_SUPABASE.md))
3. Verifique `NEXT_PUBLIC_APP_URL` no `.env.local`

### Token inválido ou expirado

**Causas:**
1. Token já foi usado
2. Token expirou (1 hora)
3. Link foi alterado

**Solução:**
1. Solicite um novo link de recuperação
2. Verifique se não está usando o mesmo link duas vezes

### Rate limit excedido

**Causa:**
Muitas tentativas em pouco tempo

**Solução:**
1. Aguarde 1 hora
2. Use um IP diferente (se em desenvolvimento)
3. Verifique logs para identificar tentativas suspeitas

### Erro de build no CI

**Causas:**
1. Variáveis de ambiente não configuradas
2. Testes falhando
3. Lint errors

**Solução:**
1. Configure secrets no GitHub
2. Execute `npm test` localmente
3. Execute `npm run lint` localmente

---

## 📚 Documentação Adicional

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentação completa da API
- **[CONFIGURAR_SMTP_SUPABASE.md](./CONFIGURAR_SMTP_SUPABASE.md)** - Guia de configuração SMTP
- **[SISTEMA_RECUPERACAO_SENHA_COMPLETO.md](./SISTEMA_RECUPERACAO_SENHA_COMPLETO.md)** - Documentação técnica detalhada

---

## ✅ Critérios de Aceitação

- ✅ Projeto inicializável com `npm install && npm run dev`
- ✅ Endpoint `/api/auth/forgot-password` implementado e testado
- ✅ Email de recuperação gerado com link correto
- ✅ Página `/reset-password` aceita token e altera senha
- ✅ Rate limit configurado e testado
- ✅ Testes passam (`npm test`)
- ✅ README com instruções claras
- ✅ `.env.example` incluso
- ✅ CI configurado rodando testes e lint

---

## 🎉 Pronto para Produção!

O sistema está completo, testado e pronto para uso em produção. Certifique-se de:

1. ✅ Configurar SMTP no Supabase
2. ✅ Configurar variáveis de ambiente
3. ✅ Executar schema SQL no banco
4. ✅ Testar fluxo completo
5. ✅ Configurar monitoramento (Sentry opcional)

**Última atualização:** 2025-01-25













