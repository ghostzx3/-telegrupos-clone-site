# 🚀 Guia Completo de Deploy na Vercel

Este guia mostra como fazer deploy do seu projeto na Vercel de forma rápida e fácil.

## 📋 Pré-requisitos

1. ✅ Conta no GitHub (ou GitLab/Bitbucket)
2. ✅ Código commitado e enviado para o repositório
3. ✅ Conta na Vercel (gratuita)
4. ✅ Variáveis de ambiente configuradas

---

## 🎯 Método 1: Deploy via Dashboard (Recomendado)

### Passo 1: Conectar Repositório

1. Acesse **https://vercel.com**
2. Faça login (pode usar GitHub)
3. Clique em **"Add New Project"** ou **"Import Project"**
4. Selecione seu repositório do GitHub
5. Clique em **"Import"**

### Passo 2: Configurar Projeto

1. **Framework Preset**: Deixe como **Next.js** (detectado automaticamente)
2. **Root Directory**: Deixe como `./` (raiz do projeto)
3. **Build Command**: `npm run build` (ou `bun run build` se usar Bun)
4. **Output Directory**: Deixe vazio (Vercel detecta automaticamente)
5. **Install Command**: `npm install` (ou `bun install`)

### Passo 3: Configurar Variáveis de Ambiente

**IMPORTANTE:** Configure todas as variáveis antes de fazer o deploy!

1. Na tela de configuração, role até **"Environment Variables"**
2. Adicione cada variável:

#### Variáveis Obrigatórias:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

#### Variáveis Opcionais (mas recomendadas):

```env
TELEGRAM_BOT_TOKEN=seu-token-do-telegram
PUSHINPAY_API_KEY=sua-api-key-pushinpay
PUSHINPAY_WEBHOOK_SECRET=seu-webhook-secret
NODE_ENV=production
```

3. **Marque para quais ambientes aplicar:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development (opcional)

### Passo 4: Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Quando terminar, você verá a URL do seu site!

---

## 🔧 Método 2: Deploy via CLI

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
# ou
bun add -g vercel
```

### Passo 2: Fazer Login

```bash
vercel login
```

Siga as instruções no navegador para autenticar.

### Passo 3: Deploy

```bash
# Deploy para preview (teste)
vercel

# Deploy para produção
vercel --prod
```

### Passo 4: Configurar Variáveis de Ambiente via CLI

```bash
# Adicionar variável
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Ver todas as variáveis
vercel env ls

# Remover variável
vercel env rm NOME_DA_VARIAVEL production
```

---

## ⚙️ Configurações Importantes

### 1. Atualizar NEXT_PUBLIC_APP_URL

Após o primeiro deploy, você receberá uma URL como:
```
https://seu-projeto.vercel.app
```

**Atualize a variável de ambiente `NEXT_PUBLIC_APP_URL`** no Vercel com essa URL.

### 2. Configurar Domínio Personalizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio (ex: `www.grupostelegramx.com`)
3. Siga as instruções para configurar DNS
4. Atualize `NEXT_PUBLIC_APP_URL` com o novo domínio

### 3. Configurar Supabase Auth

No Supabase Dashboard:
1. Vá em **Authentication** → **URL Configuration**
2. Adicione a URL da Vercel em **Site URL**:
   ```
   https://seu-projeto.vercel.app
   ```
3. Adicione em **Redirect URLs**:
   ```
   https://seu-projeto.vercel.app/**
   ```

### 4. Configurar Webhook do PushInPay (se usar)

No PushInPay Dashboard:
1. Vá em **Configurações** → **Webhooks**
2. Adicione a URL:
   ```
   https://seu-projeto.vercel.app/api/webhooks/pushinpay
   ```

---

## 🔄 Deploy Automático

O Vercel faz deploy automático quando você:

1. **Faz push para a branch `main`** → Deploy em produção
2. **Faz push para outras branches** → Deploy de preview
3. **Cria Pull Request** → Deploy de preview para testar

### Desabilitar Deploy Automático (se necessário)

1. **Settings** → **Git**
2. Desmarque **"Automatically deploy"**

---

## 📝 Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Código commitado e enviado para o GitHub
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] `NEXT_PUBLIC_APP_URL` aponta para a URL correta
- [ ] Supabase configurado com URLs de produção
- [ ] Webhooks configurados (se usar PushInPay)
- [ ] Build local funciona (`npm run build`)

---

## 🐛 Solução de Problemas

### ❌ Build Falha

**Erro comum:** Variáveis de ambiente faltando

**Solução:**
1. Verifique os logs do build no Vercel
2. Confirme que todas as variáveis estão configuradas
3. Verifique se os nomes estão corretos (case-sensitive)

### ❌ Erro "Module not found"

**Solução:**
1. Verifique se `package.json` está correto
2. Tente limpar cache: **Settings** → **General** → **Clear Build Cache**

### ❌ Site não carrega

**Solução:**
1. Verifique se o build foi bem-sucedido
2. Veja os logs de runtime no Vercel
3. Verifique se as variáveis de ambiente estão corretas

### ❌ Erro de autenticação

**Solução:**
1. Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correto
2. Confirme que as URLs estão configuradas no Supabase
3. Verifique se `NEXT_PUBLIC_APP_URL` está correto

---

## 📊 Monitoramento

### Ver Logs

1. No dashboard do Vercel, clique no projeto
2. Vá em **Deployments**
3. Clique em um deployment
4. Veja **"Function Logs"** para erros em runtime

### Analytics (Opcional)

1. **Settings** → **Analytics**
2. Ative **Vercel Analytics** (gratuito)
3. Veja estatísticas de uso do site

---

## 🚀 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Teste todas as funcionalidades
2. ✅ Configure domínio personalizado (se tiver)
3. ✅ Configure monitoramento (Sentry, etc.)
4. ✅ Configure backup do banco de dados
5. ✅ Documente URLs e credenciais

---

## 📞 Suporte

Se tiver problemas:

1. Veja os logs do build no Vercel
2. Verifique a documentação: https://vercel.com/docs
3. Consulte os logs de runtime
4. Verifique as variáveis de ambiente

---

**🎉 Pronto! Seu site está no ar!**

Acesse: `https://seu-projeto.vercel.app`







