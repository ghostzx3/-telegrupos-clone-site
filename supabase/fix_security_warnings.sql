-- ============================================
-- Correção de Avisos de Segurança do Supabase
-- ============================================
-- Este arquivo corrige os avisos de "Caminho de busca de função mutável"
-- adicionando SET search_path = '' para garantir segurança

-- 1. Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 2. Corrigir função handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. Criar/Corrigir função generate_slug (se não existir, será criada; se existir, será atualizada)
-- Nota: Esta função requer a extensão unaccent. Se não estiver disponível, use uma versão alternativa abaixo.
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Converte para minúsculas
  slug := lower(input_text);
  -- Remove acentos manualmente (alternativa se unaccent não estiver disponível)
  slug := translate(slug, 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiioooouuuucn');
  -- Remove caracteres especiais e substitui espaços por hífens
  slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
  -- Remove hífens no início e fim
  slug := trim(both '-' from slug);
  -- Limita o tamanho
  IF length(slug) > 100 THEN
    slug := left(slug, 100);
    slug := trim(both '-' from slug);
  END IF;
  RETURN slug;
END;
$$;

-- 4. Criar/Corrigir função set_group_slug (se não existir, será criada; se existir, será atualizada)
CREATE OR REPLACE FUNCTION public.set_group_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  slug_exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  -- Gera slug baseado no título
  base_slug := public.generate_slug(NEW.title);
  final_slug := base_slug;
  
  -- Verifica se o slug já existe (exceto para o próprio registro se for update)
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.groups 
      WHERE slug = final_slug 
      AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) INTO slug_exists;
    
    EXIT WHEN NOT slug_exists;
    
    -- Se existe, adiciona um número
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

-- Nota: Se a função set_group_slug for usada como trigger, você precisará criar o trigger:
-- CREATE TRIGGER set_group_slug_trigger
--   BEFORE INSERT OR UPDATE ON public.groups
--   FOR EACH ROW
--   WHEN (NEW.slug IS NULL OR NEW.slug = '')
--   EXECUTE FUNCTION public.set_group_slug();

