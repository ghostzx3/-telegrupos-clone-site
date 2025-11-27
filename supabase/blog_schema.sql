-- Blog Posts table (se não existir)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT, -- URL do vídeo (YouTube, Vimeo, etc)
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL, -- Categoria do blog
  meta_title TEXT,
  meta_description TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table (se não existir)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Tags junction table (se não existir)
CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, tag_id)
);

-- Blog Media table - para gerenciar múltiplas imagens/vídeos por post
CREATE TABLE IF NOT EXISTS public.blog_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  alt_text TEXT, -- Para imagens
  caption TEXT, -- Legenda opcional
  display_order INTEGER DEFAULT 0, -- Ordem de exibição
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Links table - para gerenciar links relacionados ao post
CREATE TABLE IF NOT EXISTS public.blog_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  link_text TEXT NOT NULL, -- Texto do link
  link_url TEXT NOT NULL, -- URL do link
  link_type TEXT DEFAULT 'external' CHECK (link_type IN ('external', 'internal', 'affiliate')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_post_tags_post ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON public.post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_blog_media_post ON public.blog_media(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_links_post ON public.blog_links(post_id);

-- Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_links ENABLE ROW LEVEL SECURITY;

-- Policies para blog_posts
CREATE POLICY "Blog posts are viewable by everyone when published" ON public.blog_posts
  FOR SELECT USING (is_published = true OR author_id = auth.uid());

CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Authors can manage own blog posts" ON public.blog_posts
  FOR ALL USING (author_id = auth.uid());

-- Policies para tags
CREATE POLICY "Tags are viewable by everyone" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON public.tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policies para post_tags
CREATE POLICY "Post tags are viewable by everyone" ON public.post_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage post tags" ON public.post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policies para blog_media
CREATE POLICY "Blog media is viewable by everyone" ON public.blog_media
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog media" ON public.blog_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policies para blog_links
CREATE POLICY "Blog links are viewable by everyone" ON public.blog_links
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog links" ON public.blog_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Trigger para updated_at
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();












