# 📝 Painel Admin do Blog - Guia de Instalação

## ✅ O que foi criado

### 1. **Schema do Banco de Dados**
- Tabela `blog_posts` com suporte a categorias, vídeos e links
- Tabela `blog_media` para gerenciar múltiplas imagens/vídeos por post
- Tabela `blog_links` para gerenciar links relacionados aos posts
- Suporte completo a tags (já existente)
- Políticas de segurança (RLS) configuradas

### 2. **APIs Criadas**
- `GET /api/admin/blog` - Listar todos os posts (admin)
- `POST /api/admin/blog` - Criar novo post
- `GET /api/admin/blog/[id]` - Buscar post específico
- `PUT /api/admin/blog/[id]` - Atualizar post
- `DELETE /api/admin/blog/[id]` - Deletar post
- `POST /api/admin/blog/upload` - Upload de imagens/vídeos

### 3. **Interface Admin**
- `/admin/blog` - Listagem de posts com busca e paginação
- `/admin/blog/new` - Criar novo post
- `/admin/blog/[id]` - Editar post existente

### 4. **Funcionalidades do Editor**
- ✅ Título e slug (geração automática)
- ✅ Resumo (excerpt)
- ✅ Editor de conteúdo (HTML permitido)
- ✅ Seleção de categoria
- ✅ Seleção múltipla de tags
- ✅ Imagem principal
- ✅ Vídeo (URL do YouTube, Vimeo, etc)
- ✅ Múltiplas imagens/vídeos adicionais
- ✅ Links relacionados (externo, interno, afiliado)
- ✅ Meta title e description (SEO)
- ✅ Publicar/Rascunho

## 📋 Passo a Passo de Instalação

### **PASSO 1: Executar SQL no Supabase**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute o arquivo `supabase/blog_schema.sql`

Ou copie e cole o conteúdo do arquivo no SQL Editor do Supabase.

### **PASSO 2: Verificar Permissões**

Certifique-se de que seu usuário tem `is_admin = true` na tabela `profiles`:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'seu-email@exemplo.com';
```

### **PASSO 3: Acessar o Painel**

1. Faça login no site
2. Acesse `/admin` (painel principal)
3. Clique em **"Gerenciar Blog"**
4. Ou acesse diretamente `/admin/blog`

## 🎯 Como Usar

### **Criar Novo Post**

1. Clique em **"Novo Post"** na página `/admin/blog`
2. Preencha:
   - **Título**: O título do post (slug será gerado automaticamente)
   - **Resumo**: Breve descrição (aparece na listagem)
   - **Conteúdo**: HTML permitido
   - **Categoria**: Selecione uma categoria
   - **Tags**: Clique nas tags para selecionar
   - **Imagem Principal**: URL da imagem
   - **Vídeo**: URL do vídeo (YouTube, Vimeo, etc)
3. **Adicionar Mídia**:
   - Selecione tipo (Imagem ou Vídeo)
   - Cole a URL
   - Adicione texto alternativo e legenda (opcional)
   - Clique em "Adicionar Mídia"
4. **Adicionar Links**:
   - Digite o texto do link
   - Cole a URL
   - Selecione o tipo (Externo, Interno ou Afiliado)
   - Clique em "Adicionar Link"
5. **SEO**: Preencha meta title e description
6. Marque **"Publicar post"** se quiser publicar imediatamente
7. Clique em **"Salvar Post"**

### **Editar Post**

1. Na listagem (`/admin/blog`), clique em **"Editar"** no post desejado
2. Faça as alterações necessárias
3. Clique em **"Salvar Post"**

### **Deletar Post**

1. Na listagem, clique em **"Deletar"**
2. Confirme a ação

## 📝 Estrutura dos Dados

### **Blog Post**
```typescript
{
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // HTML
  image_url?: string;
  video_url?: string;
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  tags: string[]; // IDs das tags
  media: BlogMedia[];
  links: BlogLink[];
}
```

### **Blog Media**
```typescript
{
  media_type: 'image' | 'video';
  media_url: string;
  alt_text?: string;
  caption?: string;
  display_order: number;
}
```

### **Blog Link**
```typescript
{
  link_text: string;
  link_url: string;
  link_type: 'external' | 'internal' | 'affiliate';
  display_order: number;
}
```

## 🔒 Segurança

- Apenas usuários com `is_admin = true` podem acessar
- Row Level Security (RLS) configurado
- Validação de permissões em todas as APIs

## 🚀 Próximos Passos (Opcional)

1. **Editor Rich Text**: Integrar um editor WYSIWYG (ex: TinyMCE, Quill)
2. **Upload de Arquivos**: Configurar Supabase Storage para upload real
3. **Preview**: Adicionar preview antes de publicar
4. **Agendamento**: Permitir agendar publicação
5. **Versões**: Sistema de versões/rascunhos

## 📞 Suporte

Se tiver problemas:
1. Verifique se executou o SQL corretamente
2. Confirme que seu usuário é admin
3. Verifique os logs do console do navegador
4. Verifique os logs do Supabase












