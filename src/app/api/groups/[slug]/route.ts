import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const { slug } = await params;

  try {
    // Fetch group
    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();

    if (error) throw error;
    if (!group) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 });
    }

    // Fetch tags
    const { data: groupTags } = await supabase
      .from('group_tags')
      .select(`
        tags (
          id,
          name,
          slug
        )
      `)
      .eq('group_id', group.id);

    const groupWithTags = {
      ...group,
      tags: groupTags?.map(gt => gt.tags).filter(Boolean) || []
    };

    // Increment view count
    await supabase
      .from('groups')
      .update({ view_count: (group.view_count || 0) + 1 })
      .eq('id', group.id);

    // Fetch recommended groups (same category)
    const { data: recommended } = await supabase
      .from('groups')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('category_id', group.category_id)
      .eq('status', 'approved')
      .neq('id', group.id)
      .order('is_featured', { ascending: false })
      .order('is_premium', { ascending: false })
      .limit(6);

    return NextResponse.json({ 
      group: groupWithTags,
      recommended: recommended || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const { slug } = await params;
  const { action } = await request.json();

  try {
    // Get group
    const { data: group } = await supabase
      .from('groups')
      .select('id, click_count')
      .eq('slug', slug)
      .single();

    if (!group) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 });
    }

    // Increment click count
    if (action === 'click') {
      await supabase
        .from('groups')
        .update({ click_count: (group.click_count || 0) + 1 })
        .eq('id', group.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}