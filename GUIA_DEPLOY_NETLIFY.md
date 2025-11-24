# 🚀 Guia de Deploy no Netlify

## ⚠️ Problema: Alterações não aparecem no site online

Quando você faz `git push`, as alterações vão para o GitHub, mas **o Netlify precisa fazer um novo deploy** para atualizar o site.

---

## ✅ Solução 1: Deploy Automático (Recomendado)

### Configurar Integração GitHub → Netlify

1. **Acesse o Netlify Dashboard**
   - Vá para: https://app.netlify.com
   - Faça login na sua conta

2. **Verifique a Integração**
   - Clique no seu site
   - Vá em **Site settings** (⚙️)
   - Clique em **Build & deploy**
   - Em **Continuous Deployment**, verifique se está conectado ao GitHub

3. **Se NÃO estiver conectado:**
   - Clique em **Link repository**
   - Escolha o repositório: `ghostzx3/-telegrupos-clone-site`
   - Configure:
     - **Branch**: `main`
     - **Build command**: `bun run build` (ou `npm run build`)
     - **Publish directory**: `.next` (o plugin Next.js gerencia isso)

4. **Ativar Deploy Automático**
   - Após conectar, cada `git push` no `main` vai fazer deploy automático
   - Você verá o deploy iniciando automaticamente

---

## ✅ Solução 2: Deploy Manual (Imediato)

Se você já tem o site no Netlify, faça um deploy manual agora:

1. **Acesse o Dashboard do Netlify**
   - https://app.netlify.com

2. **Vá para Deploys**
   - Clique no seu site
   - Clique na aba **Deploys** (no topo)

3. **Trigger Deploy**
   - Clique no botão **"Trigger deploy"** (canto superior direito)
   - Escolha **"Deploy site"**
   - O Netlify vai fazer um novo build com as alterações mais recentes do GitHub

4. **Aguarde o Build**
   - O deploy vai aparecer na lista
   - Clique nele para ver o progresso
   - Quando terminar, o site estará atualizado!

---

## 🔧 Verificar Configuração do Build

### Configuração Correta no Netlify:

1. **Site settings** → **Build & deploy** → **Build settings**

2. **Verifique:**
   - **Base directory**: (deixe vazio)
   - **Build command**: `bun run build` ou `npm run build`
   - **Publish directory**: `.next` (mas o plugin Next.js gerencia isso)

3. **Plugins:**
   - Certifique-se de que `@netlify/plugin-nextjs` está instalado
   - O Netlify deve detectar automaticamente pelo `netlify.toml`

---

## 🔑 Verificar Variáveis de Ambiente

**IMPORTANTE:** As variáveis de ambiente precisam estar configuradas no Netlify!

1. **Site settings** → **Environment variables**

2. **Adicione todas as variáveis do `.env.local`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_PUSHINPAY_API_URL
   PUSHINPAY_API_KEY
   ```

3. **Após adicionar variáveis, faça um novo deploy!**

---

## 🐛 Problemas Comuns

### ❌ Build Falha

**Causa:** Erro no código ou dependências

**Solução:**
1. Veja os logs do deploy no Netlify
2. Procure por erros em vermelho
3. Corrija os erros e faça novo push

### ❌ Site não atualiza após deploy

**Causa:** Cache do navegador

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Ou faça hard refresh (Ctrl+Shift+R)
3. Ou teste em aba anônima

### ❌ Variáveis de ambiente não funcionam

**Causa:** Variáveis não configuradas no Netlify

**Solução:**
1. Adicione todas as variáveis em **Environment variables**
2. Faça um novo deploy após adicionar

---

## 📝 Checklist Rápido

- [ ] Alterações foram commitadas e enviadas para GitHub (`git push`)
- [ ] Netlify está conectado ao repositório GitHub
- [ ] Variáveis de ambiente estão configuradas no Netlify
- [ ] Deploy foi acionado (automático ou manual)
- [ ] Build foi concluído com sucesso
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

# 4. Push para GitHub
git push origin main

# 5. Ir para Netlify e fazer deploy manual (se não for automático)
```

---

## 💡 Dica

**Configure notificações no Netlify:**
- Vá em **Site settings** → **Notifications**
- Ative notificações por email quando o deploy terminar
- Assim você sabe quando o site está atualizado!

---

**Pronto!** Agora suas alterações vão aparecer no site online após cada deploy. 🎉



