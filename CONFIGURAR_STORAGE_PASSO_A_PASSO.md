# 📦 Configurar Supabase Storage - Passo a Passo Completo

Este guia mostra **exatamente** como configurar o Supabase Storage para permitir upload de imagens.

## ⏱️ Tempo estimado: 5 minutos

---

## 📋 Passo 1: Acessar o Supabase Dashboard

1. Acesse: **https://supabase.com/dashboard**
2. Faça login na sua conta
3. Selecione seu projeto

---

## 📋 Passo 2: Executar Script SQL

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"** (ou botão "+")
3. Abra o arquivo `supabase/configurar_storage.sql` neste projeto
4. **Copie TODO o conteúdo** do arquivo
5. **Cole no editor SQL** do Supabase
6. Clique em **"Run"** (ou pressione `Ctrl+Enter`)

### ✅ O que o script faz:

- ✅ Cria o bucket `group-images` (público)
- ✅ Configura limite de 5MB por arquivo
- ✅ Permite apenas imagens (JPG, PNG, GIF, WEBP)
- ✅ Configura políticas de segurança:
  - Usuários autenticados podem fazer upload
  - Qualquer pessoa pode ver as imagens (público)
  - Usuários autenticados podem atualizar
  - Apenas admins podem deletar

---

## 📋 Passo 3: Verificar se Funcionou

Após executar o script, você deve ver:

1. **Mensagem de sucesso** no SQL Editor
2. **Bucket criado**: Vá em **Storage** → Você deve ver `group-images`
3. **Políticas criadas**: Vá em **Storage** → `group-images` → **Policies** → Deve ter 4 políticas

---

## 🔍 Verificação Manual (Opcional)

Se quiser verificar manualmente:

### Verificar Bucket:

1. Vá em **Storage** (menu lateral)
2. Você deve ver o bucket **"group-images"**
3. Clique nele
4. Verifique:
   - ✅ **Public bucket**: Deve estar marcado
   - ✅ **File size limit**: 5MB
   - ✅ **Allowed MIME types**: image/jpeg, image/jpg, image/png, image/gif, image/webp

### Verificar Políticas:

1. No bucket `group-images`, vá em **"Policies"**
2. Você deve ver 4 políticas:
   - ✅ "Usuários autenticados podem fazer upload" (INSERT)
   - ✅ "Imagens públicas podem ser lidas" (SELECT)
   - ✅ "Usuários autenticados podem atualizar" (UPDATE)
   - ✅ "Apenas admins podem deletar" (DELETE)

---

## 🐛 Problemas Comuns

### ❌ Erro: "bucket already exists"

**Solução**: O bucket já existe. Isso é normal! O script usa `ON CONFLICT DO NOTHING`, então não vai dar erro.

### ❌ Erro: "policy already exists"

**Solução**: As políticas já existem. Você pode:
- Ignorar o erro (está tudo certo)
- Ou deletar as políticas antigas e executar o script novamente

### ❌ Erro: "permission denied"

**Solução**: Certifique-se de estar logado como owner do projeto no Supabase.

### ❌ Bucket não aparece

**Solução**:
1. Recarregue a página (F5)
2. Verifique se executou o script completo
3. Execute apenas a parte de criação do bucket:
   ```sql
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
     'group-images',
     'group-images',
     true,
     5242880,
     ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
   )
   ON CONFLICT (id) DO NOTHING;
   ```

---

## ✅ Testar se Está Funcionando

Após configurar, teste no painel administrativo:

1. Acesse `/admin`
2. Clique em **"Editar"** em um grupo
3. Clique em **"Selecionar Imagem"**
4. Escolha uma imagem do seu computador
5. Se o upload funcionar, está tudo configurado! ✅

---

## 📝 Resumo Rápido

1. ✅ Acesse Supabase Dashboard
2. ✅ Vá em SQL Editor
3. ✅ Execute o script `supabase/configurar_storage.sql`
4. ✅ Verifique se o bucket foi criado
5. ✅ Teste no painel admin

---

## 🆘 Ainda com Problemas?

Se ainda tiver problemas:

1. **Verifique os logs** no console do navegador (F12)
2. **Veja os logs do Supabase**: Storage → group-images → Logs
3. **Teste manualmente**: Tente fazer upload de uma imagem pequena
4. **Verifique permissões**: Certifique-se de que está logado como admin

---

**🎉 Pronto! Agora você pode fazer upload de imagens no painel administrativo!**

