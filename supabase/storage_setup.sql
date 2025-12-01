-- ============================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE
-- Para Upload de Imagens de Grupos
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Clique em "Run"
-- 5. Pronto! O storage estará configurado
--
-- ============================================

-- 1. Criar o bucket 'group-images' (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-images',
  'group-images',
  true, -- Bucket público
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Política para INSERT (Upload) - Apenas usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-images'
);

-- 3. Política para SELECT (Leitura) - Público (qualquer um pode ver)
CREATE POLICY "Imagens públicas podem ser lidas"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'group-images'
);

-- 4. Política para UPDATE (Atualização) - Apenas usuários autenticados
-- Permite que usuários atualizem suas próprias imagens
CREATE POLICY "Usuários podem atualizar suas próprias imagens"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'group-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'group-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Política para UPDATE (Atualização) - Administradores podem atualizar qualquer imagem
-- Primeiro, precisamos criar uma função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
$$;

-- Política para admins atualizarem qualquer imagem
CREATE POLICY "Admins podem atualizar qualquer imagem"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'group-images'
  AND public.is_admin()
)
WITH CHECK (
  bucket_id = 'group-images'
  AND public.is_admin()
);

-- 6. Política para DELETE (Exclusão) - Apenas administradores
CREATE POLICY "Apenas admins podem excluir imagens"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-images'
  AND public.is_admin()
);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se está tudo configurado:

-- Verificar se o bucket foi criado:
-- SELECT * FROM storage.buckets WHERE id = 'group-images';

-- Verificar políticas:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- FIM DO SCRIPT
-- ============================================



