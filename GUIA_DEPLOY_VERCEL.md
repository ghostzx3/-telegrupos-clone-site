# 🚀 Guia de Deploy no Vercel

## ⚠️ Problema: Alterações não aparecem no site online

Quando você faz `git push`, as alterações vão para o GitHub, mas **o Vercel precisa fazer um novo deploy** para atualizar o site.

---

## ✅ Solução 1: Deploy Automático (Recomendado)

O Vercel tem integração automática com GitHub! Se configurado corretamente, cada `git push` faz deploy automático.

### Verificar se está Configurado

1. **Acesse o Vercel Dashboard**
   - Vá para: https://vercel.com/dashboard
   - Faça login na sua conta

2. **Verifique o Projeto**
   - Clique no seu projeto
   - Vá em **Settings** → **Git**
   - Verifique se está conectado ao repositório: `ghostzx3/-telegrupos-clone-site`

3. **Se NÃO estiver conectado:**
   - Clique em **Connect Git Repository**
   - Escolha o repositório: `ghostzx3/-telegrupos-clone-site`
   - Configure:
     - **Framework Preset**: Next.js (deve detectar automaticamente)
     - **Root Directory**: `./` (raiz do projeto)
     - **Build Command**: `npm run build` (ou `bun run build`)
     - **Output Directory**: `.next` (gerenciado automaticamente pelo Vercel)

4. **Ativar Deploy Automático**
   - Após conectar, cada `git push` no `main` vai fazer deploy automático
   - Você verá o deploy iniciando automaticamente no dashboard

---

## ✅ Solução 2: Deploy Manual (Imediato)

Se você já tem o projeto no Vercel, faça um deploy manual agora:

1. **Acesse o Dashboard do Vercel**
   - https://vercel.com/dashboard

2. **Vá para Deployments**
   - Clique no seu projeto
   - Você verá a lista de deployments

3. **Trigger Deploy**
   - Clique no botão **"Deploy"** (canto superior direito)
   - Escolha **"Redeploy"** no último deployment
   - Ou clique nos **3 pontos** → **Redeploy**

4. **Aguarde o Build**
   - O deploy vai aparecer na lista
   - Clique nele para ver o progresso em tempo real
   - Quando terminar, o site estará atualizado!

---

## 🔧 Verificar Configuração do Build

### Configuração Correta no Vercel:

1. **Settings** → **General**

2. **Verifique:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (ou `bun run build` se usar Bun)
   - **Output Directory**: `.next` (ou deixe vazio, o Vercel detecta automaticamente)

3. **Node.js Version:**
   - Vercel usa Node.js 18.x ou 20.x por padrão
   - Se precisar de outra versão, configure em **Settings** → **General** → **Node.js Version**

---

## 🔑 Verificar Variáveis de Ambiente

**IMPORTANTE:** As variáveis de ambiente precisam estar configuradas no Vercel!

1. **Settings** → **Environment Variables**

2. **Adicione todas as variáveis do `.env.local`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_PUSHINPAY_API_URL
   PUSHINPAY_API_KEY
   ```

3. **Configure para cada ambiente:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development (opcional)

4. **Após adicionar variáveis, faça um novo deploy!**

---

## 🚀 Deploy via CLI (Alternativa)

Se preferir usar a linha de comando:

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Fazer login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## 🐛 Problemas Comuns

### ❌ Build Falha no Vercel

**Causa:** Erro no código ou dependências

**Solução:**
1. Veja os logs do deploy no Vercel (clique no deployment → **Build Logs**)
2. Procure por erros em vermelho
3. Corrija os erros e faça novo push

**Erros comuns:**
- Variáveis de ambiente faltando
- Erro de sintaxe no código
- Dependências não instaladas

### ❌ Site não atualiza após deploy

**Causa:** Cache do navegador ou CDN

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Ou faça hard refresh (Ctrl+Shift+R)
3. Ou teste em aba anônima
4. O Vercel usa CDN global, pode levar alguns segundos para propagar

### ❌ Variáveis de ambiente não funcionam

**Causa:** Variáveis não configuradas no Vercel ou não foram redeployadas

**Solução:**
1. Adicione todas as variáveis em **Environment Variables**
2. **IMPORTANTE:** Faça um novo deploy após adicionar variáveis
3. Variáveis com `NEXT_PUBLIC_` são expostas ao cliente
4. Variáveis sem `NEXT_PUBLIC_` são apenas no servidor

### ❌ Deploy automático não funciona

**Causa:** Integração GitHub não configurada ou branch errada

**Solução:**
1. Verifique em **Settings** → **Git** se o repositório está conectado
2. Verifique qual branch está configurada (deve ser `main`)
3. Verifique se os webhooks do GitHub estão ativos
4. Teste fazendo um push e veja se aparece um novo deployment

---

## 📝 Checklist Rápido

- [ ] Alterações foram commitadas e enviadas para GitHub (`git push`)
- [ ] Vercel está conectado ao repositório GitHub
- [ ] Variáveis de ambiente estão configuradas no Vercel
- [ ] Deploy foi acionado (automático ou manual)
- [ ] Build foi concluído com sucesso (verificar logs)
- [ ] Site foi atualizado (teste em aba anônima)

---

## 🚀 Comandos Rápidos

```bash
# 1. Verificar status
git status

# 2. Adicionar alterações
git add .

# 3. Commit
git commit -m "sua mensagem"

# 4. Push para GitHub (deploy automático se configurado)
git push origin main

# 5. Verificar deploy no Vercel Dashboard
# https://vercel.com/dashboard
```

---

## 💡 Dicas do Vercel

### Preview Deployments
- Cada pull request cria um preview deployment
- Perfeito para testar antes de fazer merge
- URL única para cada PR

### Analytics
- Vercel Analytics mostra performance do site
- Ative em **Settings** → **Analytics**

### Domínios Customizados
- Adicione seu domínio em **Settings** → **Domains**
- Configure DNS conforme instruções

### Notificações
- Configure notificações em **Settings** → **Notifications**
- Receba email quando deploy terminar

---

## 🔍 Verificar Status do Deploy

1. **Dashboard do Vercel**
   - Veja todos os deployments
   - Status: Building, Ready, Error

2. **Logs do Build**
   - Clique no deployment
   - Veja logs em tempo real
   - Identifique erros rapidamente

3. **URLs**
   - Production: `https://seu-projeto.vercel.app`
   - Preview: URL única para cada PR

---

**Pronto!** Agora suas alterações vão aparecer no site online após cada deploy no Vercel. 🎉

**Ação imediata:** Vá para https://vercel.com/dashboard e faça um redeploy manual agora para atualizar o site!





