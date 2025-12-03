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

  // Filter by category - IMPORTANT: Only show groups from selected category
  // Sem categoria selecionada, não retorna grupos (a página sempre terá uma categoria padrão)
  if (category) {
    query = query.eq('category_id', category)
  } else {
    // Se nenhuma categoria estiver selecionada, retornar vazio
    // A página inicial sempre terá a categoria "adulto" selecionada por padrão
    return NextResponse.json({
      groups: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    })
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

  // Log para debug - verificar se as imagens estão sendo retornadas
  if (data && data.length > 0) {
    console.log('[API Groups] Grupos retornados:', data.length);
    data.forEach((group: any) => {
      console.log('[API Groups] Grupo:', {
        id: group.id,
        title: group.title,
        image_url: group.image_url,
        hasImage: !!group.image_url
      });
    });
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

  // Se não tiver image_url ou title, buscar automaticamente do Telegram
  if (body.telegram_link && (!body.image_url || !body.title)) {
    try {
      const { fetchTelegramGroupImage } = await import('@/lib/telegram/image-fetcher');
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      console.log('[API Groups] Buscando informações do Telegram para:', body.telegram_link);
      
      const telegramData = await fetchTelegramGroupImage(body.telegram_link, botToken);
      
      if (telegramData.success) {
        // Preencher imagem se não foi fornecida
        if (!body.image_url && telegramData.imageUrl) {
          body.image_url = telegramData.imageUrl;
          console.log('[API Groups] Imagem preenchida automaticamente:', telegramData.imageUrl);
        }
        
        // Preencher título se não foi fornecido
        if (!body.title && telegramData.title) {
          body.title = telegramData.title;
          console.log('[API Groups] Título preenchido automaticamente:', telegramData.title);
        }
      } else {
        console.warn('[API Groups] Não foi possível buscar dados do Telegram:', telegramData.error);
      }
    } catch (error: any) {
      console.error('[API Groups] Erro ao buscar dados do Telegram:', error);
      // Continuar mesmo se falhar - o usuário pode ter preenchido manualmente
    }
  }

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
