-- ============================================
-- Script para Configurar Supabase Storage
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard → SQL Editor → New Query → Cole este código → Run

-- 1. Criar bucket "group-images" (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-images',
  'group-images',
  true, -- Bucket público
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para INSERT (Upload) - Usuários autenticados podem fazer upload
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-images'
);

-- 3. Política para SELECT (Leitura) - Público pode ler
CREATE POLICY "Imagens públicas podem ser lidas"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'group-images'
);

-- 4. Política para UPDATE - Usuários autenticados podem atualizar
CREATE POLICY "Usuários autenticados podem atualizar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'group-images'
)
WITH CHECK (
  bucket_id = 'group-images'
);

-- 5. Política para DELETE - Apenas admins podem deletar
-- (Vamos criar uma função para verificar se é admin)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Apenas admins podem deletar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-images' AND
  is_admin(auth.uid())
);

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'group-images';

-- Verificar políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

