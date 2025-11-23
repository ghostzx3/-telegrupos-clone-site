import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar post específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(id, name, slug),
        author:profiles(id, full_name, email)
      `)
      .eq('id', params.id)
      .single();

    if (postError) throw postError;

    // Buscar tags
    const { data: postTags } = await supabase
      .from('post_tags')
      .select(`
        tags (
          id,
          name,
          slug
        )
      `)
      .eq('post_id', params.id);

    // Buscar mídia
    const { data: media } = await supabase
      .from('blog_media')
      .select('*')
      .eq('post_id', params.id)
      .order('display_order', { ascending: true });

    // Buscar links
    const { data: links } = await supabase
      .from('blog_links')
      .select('*')
      .eq('post_id', params.id)
      .order('display_order', { ascending: true });

    return NextResponse.json({
      post: {
        ...post,
        tags: postTags?.map(pt => pt.tags).filter(Boolean) || [],
        media: media || [],
        links: links || []
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Atualizar post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar post atual para verificar se já foi publicado
    const { data: currentPost } = await supabase
      .from('blog_posts')
      .select('published_at')
      .eq('id', params.id)
      .single();

    // Atualizar post
    const updateData: any = {
      title,
      slug,
      excerpt,
      content,
      image_url,
      video_url,
      category_id: category_id || null,
      meta_title,
      meta_description,
      is_published
    };

    // Só atualizar published_at se estiver publicando pela primeira vez
    if (is_published && !currentPost?.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (postError) throw postError;

    // Atualizar tags (remover antigas e adicionar novas)
    await supabase.from('post_tags').delete().eq('post_id', params.id);
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
        post_id: params.id,
        tag_id: tagId
      }));
      await supabase.from('post_tags').insert(tagInserts);
    }

    // Atualizar mídia
    await supabase.from('blog_media').delete().eq('post_id', params.id);
    if (media && media.length > 0) {
      const mediaInserts = media.map((item: any) => ({
        post_id: params.id,
        media_type: item.media_type,
        media_url: item.media_url,
        alt_text: item.alt_text,
        caption: item.caption,
        display_order: item.display_order || 0
      }));
      await supabase.from('blog_media').insert(mediaInserts);
    }

    // Atualizar links
    await supabase.from('blog_links').delete().eq('post_id', params.id);
    if (links && links.length > 0) {
      const linkInserts = links.map((link: any) => ({
        post_id: params.id,
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

// DELETE - Deletar post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await supabase.from('blog_posts').delete().eq('id', params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

