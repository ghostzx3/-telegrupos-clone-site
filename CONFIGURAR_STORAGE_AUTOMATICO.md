# 🚀 Configuração Automática do Supabase Storage

Este guia mostra como configurar o Supabase Storage para upload de imagens **de forma automática** usando SQL.

## ⚡ Método Rápido (2 minutos)

### Passo 1: Acessar SQL Editor

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **"New query"**

### Passo 2: Executar Script SQL

1. Abra o arquivo `supabase/storage_setup.sql` neste projeto
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Aguarde alguns segundos

### Passo 3: Verificar Configuração

Execute esta query para verificar:

```sql
SELECT * FROM storage.buckets WHERE id = 'group-images';
```

Deve retornar uma linha com o bucket `group-images`.

## ✅ O que o Script Faz

O script `storage_setup.sql` configura automaticamente:

1. ✅ **Bucket `group-images`**
   - Público (qualquer um pode ver imagens)
   - Limite de 5MB por arquivo
   - Tipos permitidos: JPG, PNG, GIF, WEBP

2. ✅ **Políticas de Segurança (RLS)**
   - **Upload**: Apenas usuários autenticados
   - **Leitura**: Público (qualquer um pode ver)
   - **Atualização**: Usuários podem atualizar suas próprias imagens + Admins podem atualizar qualquer imagem
   - **Exclusão**: Apenas administradores

3. ✅ **Função Helper**
   - Função `is_admin()` para verificar se usuário é admin

## 🎯 Pronto!

Após executar o script, o storage estará **100% configurado** e pronto para uso!

## 🧪 Testar

1. Acesse o painel administrativo: `/admin`
2. Clique em "Editar" em um grupo
3. Clique em "Selecionar Imagem"
4. Escolha uma imagem do seu computador
5. A imagem deve ser enviada e salva automaticamente!

## 🐛 Problemas?

### Erro: "bucket already exists"
- **Solução**: Isso é normal! O script usa `ON CONFLICT` para atualizar se já existir.

### Erro: "policy already exists"
- **Solução**: Delete as políticas antigas primeiro:
  ```sql
  DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
  DROP POLICY IF EXISTS "Imagens públicas podem ser lidas" ON storage.objects;
  DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias imagens" ON storage.objects;
  DROP POLICY IF EXISTS "Admins podem atualizar qualquer imagem" ON storage.objects;
  DROP POLICY IF EXISTS "Apenas admins podem excluir imagens" ON storage.objects;
  ```
  Depois execute o script novamente.

### Imagens não aparecem
- Verifique se o bucket está público: `SELECT public FROM storage.buckets WHERE id = 'group-images';`
- Deve retornar `true`

### Upload não funciona
- Verifique se você está logado
- Verifique se você é admin (para upload no painel admin)
- Veja os logs do console do navegador (F12)

## 📝 Notas

- O bucket é **público**, então qualquer um pode ver as imagens (isso é necessário para exibir no site)
- Apenas usuários **autenticados** podem fazer upload
- Apenas **administradores** podem excluir imagens
- O limite de tamanho é **5MB** por arquivo

---

**🎉 Pronto! Storage configurado automaticamente!**



