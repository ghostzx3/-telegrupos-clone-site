import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient();

  try {
    // Fetch post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:profiles(full_name)
      `)
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single();

    if (error) throw error;
    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    // Fetch tags
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

    const postWithTags = {
      ...post,
      tags: postTags?.map(pt => pt.tags).filter(Boolean) || []
    };

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', post.id);

    return NextResponse.json({ post: postWithTags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
