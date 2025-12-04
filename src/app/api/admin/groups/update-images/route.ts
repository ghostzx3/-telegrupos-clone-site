import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { fetchTelegramGroupImage } from '@/lib/telegram/image-fetcher';

/**
 * API Route para atualizar imagens de grupos existentes
 * 
 * Busca todos os grupos sem imagem e tenta buscar a imagem do Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Obter parâmetros opcionais
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 50; // Limitar para não sobrecarregar
    const force = body.force || false; // Se true, atualiza mesmo grupos com imagem

    // Buscar grupos sem imagem ou com placeholder
    let query = supabase
      .from('groups')
      .select('id, title, telegram_link, image_url')
      .not('telegram_link', 'is', null);

    if (!force) {
      // Buscar apenas grupos sem imagem ou com imagem vazia/null
      query = query.or('image_url.is.null,image_url.eq.,image_url.eq.null');
    }

    query = query.limit(limit);

    const { data: groups, error: fetchError } = await query;

    if (fetchError) {
      console.error('[Update Images] Erro ao buscar grupos:', fetchError);
      return NextResponse.json(
        { error: 'Erro ao buscar grupos', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!groups || groups.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum grupo encontrado para atualizar',
        updated: 0,
        failed: 0,
        total: 0,
      });
    }

    console.log(`[Update Images] Encontrados ${groups.length} grupos para atualizar`);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let updated = 0;
    let failed = 0;
    const errors: Array<{ id: string; title: string; error: string }> = [];

    // Processar cada grupo
    for (const group of groups) {
      try {
        console.log(`[Update Images] Processando grupo: ${group.title} (${group.id})`);

        // Buscar imagem do Telegram
        const result = await fetchTelegramGroupImage(group.telegram_link, botToken);

        if (!result.success) {
          console.warn(`[Update Images] Erro ao buscar imagem para ${group.title}:`, result.error);
          failed++;
          errors.push({
            id: group.id,
            title: group.title || 'Sem título',
            error: result.error || 'Erro desconhecido',
          });
          continue;
        }

        // Preparar dados para atualização
        const updateData: { image_url?: string; title?: string } = {};

        // Atualizar imagem se encontrada
        if (result.imageUrl) {
          updateData.image_url = result.imageUrl;
          console.log(`[Update Images] Imagem encontrada para ${group.title}: ${result.imageUrl}`);
        }

        // Atualizar título se encontrado e o grupo não tiver título
        if (result.title && !group.title) {
          updateData.title = result.title;
        }

        // Só atualizar se houver algo para atualizar
        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('groups')
            .update(updateData)
            .eq('id', group.id);

          if (updateError) {
            console.error(`[Update Images] Erro ao atualizar grupo ${group.id}:`, updateError);
            failed++;
            errors.push({
              id: group.id,
              title: group.title || 'Sem título',
              error: updateError.message,
            });
          } else {
            updated++;
            console.log(`[Update Images] ✅ Grupo ${group.title} atualizado com sucesso`);
          }
        } else {
          console.log(`[Update Images] Nenhuma atualização necessária para ${group.title}`);
        }

        // Pequeno delay para não sobrecarregar a API do Telegram
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`[Update Images] Erro ao processar grupo ${group.id}:`, error);
        failed++;
        errors.push({
          id: group.id,
          title: group.title || 'Sem título',
          error: error.message || 'Erro desconhecido',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processamento concluído: ${updated} atualizados, ${failed} falharam`,
      updated,
      failed,
      total: groups.length,
      errors: errors.slice(0, 10), // Limitar erros retornados
    });
  } catch (error: any) {
    console.error('[Update Images] Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro ao processar atualização', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Retorna informações sobre grupos que precisam de atualização
 */
export async function GET() {
  try {
    const supabase = await createClient();

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

    // Contar grupos sem imagem
    const { count, error } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .or('image_url.is.null,image_url.eq.,image_url.eq.null')
      .not('telegram_link', 'is', null);

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao contar grupos', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      groupsWithoutImage: count || 0,
      message: `Existem ${count || 0} grupos sem imagem que podem ser atualizados`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao buscar informações', details: error.message },
      { status: 500 }
    );
  }
}



