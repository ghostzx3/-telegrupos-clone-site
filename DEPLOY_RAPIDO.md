# ⚡ Deploy Rápido na Vercel - Passo a Passo

## 🎯 Método Mais Rápido (5 minutos)

### 1. Preparar o Código

```bash
# Adicionar todas as alterações
git add .

# Fazer commit
git commit -m "Preparar para deploy na Vercel"

# Enviar para o GitHub
git push origin main
```

### 2. Fazer Deploy na Vercel

#### Opção A: Via Dashboard (Mais Fácil)

1. **Acesse:** https://vercel.com
2. **Faça login** (use GitHub)
3. **Clique:** "Add New Project" ou "Import Project"
4. **Selecione** seu repositório
5. **Configure:**

   - **Framework:** Next.js (já detectado)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** (deixe vazio)

6. **Adicione Variáveis de Ambiente:**

   Clique em **"Environment Variables"** e adicione:

   ```
   NEXT_PUBLIC_SUPABASE_URL = sua-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-key
   SUPABASE_SERVICE_ROLE_KEY = sua-key
   NEXT_PUBLIC_APP_URL = https://seu-projeto.vercel.app
   TELEGRAM_BOT_TOKEN = seu-token (opcional)
   ```

   **Marque:** ✅ Production, ✅ Preview

7. **Clique:** "Deploy"
8. **Aguarde** 2-5 minutos
9. **Pronto!** Seu site estará no ar!

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

---

## ⚠️ IMPORTANTE: Variáveis de Ambiente

**Você DEVE configurar estas variáveis no Vercel:**

### Obrigatórias:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `NEXT_PUBLIC_APP_URL` (atualize após o primeiro deploy com a URL da Vercel)

### Opcionais (mas recomendadas):

5. `TELEGRAM_BOT_TOKEN`
6. `PUSHINPAY_API_KEY` (se usar pagamentos)
7. `PUSHINPAY_WEBHOOK_SECRET` (se usar pagamentos)
8. `NODE_ENV=production`

---

## 🔧 Após o Deploy

### 1. Atualizar NEXT_PUBLIC_APP_URL

Após o primeiro deploy, você receberá uma URL como:
```
https://telegrupos-clone.vercel.app
```

**Atualize a variável `NEXT_PUBLIC_APP_URL` no Vercel** com essa URL e faça um novo deploy.

### 2. Configurar Supabase

No Supabase Dashboard:
- **Authentication** → **URL Configuration**
- Adicione: `https://seu-projeto.vercel.app`
- Adicione em Redirect URLs: `https://seu-projeto.vercel.app/**`

### 3. Testar o Site

Acesse a URL fornecida pela Vercel e teste:
- ✅ Login/Cadastro
- ✅ Envio de grupos
- ✅ Busca de fotos do Telegram
- ✅ Todas as funcionalidades

---

## 🐛 Problemas Comuns

### Build Falha
- Verifique os logs no Vercel
- Confirme que todas as variáveis estão configuradas
- Teste o build local: `npm run build`

### Site não carrega
- Verifique os logs de runtime
- Confirme variáveis de ambiente
- Verifique se o Supabase está configurado

### Erro de autenticação
- Verifique URLs no Supabase
- Confirme `NEXT_PUBLIC_APP_URL` está correto

---

## 📝 Checklist Rápido

- [ ] Código commitado e no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy feito na Vercel
- [ ] `NEXT_PUBLIC_APP_URL` atualizado
- [ ] Supabase configurado com URLs de produção
- [ ] Site testado e funcionando

---

**🚀 Pronto! Seu site está no ar!**

Acesse: `https://seu-projeto.vercel.app`




