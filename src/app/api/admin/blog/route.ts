import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar todos os posts (admin)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(id, name, slug),
        author:profiles(id, full_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Buscar tags para cada post
    const postsWithTags = await Promise.all(
      (data || []).map(async (post) => {
        const { data: postTags } = await supabase
          .from('post_tags')
          .select(`
            tags (
              id,
              name,
              slug
            )
          `)
          .eq('post_id', post.id);

        return {
          ...post,
          tags: postTags?.map(pt => pt.tags).filter(Boolean) || []
        };
      })
    );

    return NextResponse.json({
      posts: postsWithTags,
      totalPages: Math.ceil((count || 0) / limit),
      total: count || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar novo post
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      image_url,
      video_url,
      category_id,
      meta_title,
      meta_description,
      is_published,
      tags,
      media,
      links
    } = body;

    // Criar slug se não fornecido
    const finalSlug = slug || title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Criar post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: finalSlug,
        excerpt,
        content,
        image_url,
        video_url,
        category_id: category_id || null,
        meta_title,
        meta_description,
        author_id: user.id,
        is_published: is_published || false,
        published_at: is_published ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (postError) throw postError;

    // Adicionar tags
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId
      }));

      await supabase.from('post_tags').insert(tagInserts);
    }

    // Adicionar mídia
    if (media && media.length > 0) {
      const mediaInserts = media.map((item: any) => ({
        post_id: post.id,
        media_type: item.media_type,
        media_url: item.media_url,
        alt_text: item.alt_text,
        caption: item.caption,
        display_order: item.display_order || 0
      }));

      await supabase.from('blog_media').insert(mediaInserts);
    }

    // Adicionar links
    if (links && links.length > 0) {
      const linkInserts = links.map((link: any) => ({
        post_id: post.id,
        link_text: link.link_text,
        link_url: link.link_url,
        link_type: link.link_type || 'external',
        display_order: link.display_order || 0
      }));

      await supabase.from('blog_links').insert(linkInserts);
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}






