import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'created_at'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')

  const supabase = await createClient()

  let query = supabase
    .from('groups')
    .select('*, categories(*)', { count: 'exact' })
    .not('approved_at', 'is', null)

  // Filter by category
  if (category) {
    query = query.eq('category_id', category)
  }

  // Search by title
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  // Sorting
  if (sort === 'popular') {
    query = query.order('view_count', { ascending: false })
  } else if (sort === 'members') {
    query = query.order('member_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    groups: data,
    total: count,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('groups')
    .insert({
      ...body,
      submitted_by: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ group: data }, { status: 201 })
}
