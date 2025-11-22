import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';

  const supabase = await createClient();

  try {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        author:profiles(full_name)
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Tag filter
    if (tag) {
      const { data: tagData } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tag)
        .single();

      if (tagData) {
        const { data: postIds } = await supabase
          .from('post_tags')
          .select('post_id')
          .eq('tag_id', tagData.id);

        const ids = postIds?.map(pt => pt.post_id) || [];
        if (ids.length > 0) {
          query = query.in('id', ids);
        } else {
          return NextResponse.json({ posts: [], totalPages: 0, total: 0 });
        }
      }
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Fetch tags for each post
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
