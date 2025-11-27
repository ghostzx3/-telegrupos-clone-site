import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para buscar informações de grupo/canal do Telegram
 * 
 * Esta rota extrai o username do link do Telegram e busca informações
 * usando a API pública do Telegram (sem necessidade de bot token)
 */
export async function POST(request: NextRequest) {
  try {
    const { link } = await request.json();

    if (!link) {
      return NextResponse.json(
        { error: 'Link do Telegram é obrigatório' },
        { status: 400 }
      );
    }

    // Extrair username ou ID do link do Telegram
    // Suporta formatos:
    // - Públicos: https://t.me/username, t.me/username, @username
    // - Privados: https://t.me/+XXXXXXXXXXXX, t.me/+XXXXXXXXXXXX
    const telegramLinkRegex = /(?:https?:\/\/)?(?:t\.me\/|@)(\+?[a-zA-Z0-9_-]+)/;
    const match = link.match(telegramLinkRegex);

    if (!match || !match[1]) {
      return NextResponse.json(
        { error: 'Link do Telegram inválido' },
        { status: 400 }
      );
    }

    const identifier = match[1]; // Pode ser username ou link privado (+XXXXXXXXXXXX)
    const isPrivateLink = identifier.startsWith('+');

    console.log('[Telegram API] Buscando informações para:', identifier, 'Privado:', isPrivateLink);

    // Se não houver bot token, usar método alternativo via scraping da página pública
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      // Método alternativo: usar a página pública do Telegram
      // A foto do grupo/canal está disponível em: https://t.me/{identifier}
      // Podemos extrair a foto usando a meta tag og:image
      try {
        const pageUrl = `https://t.me/${identifier}`;
        const response = await fetch(pageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          throw new Error('Não foi possível acessar a página do Telegram');
        }

        const html = await response.text();
        
        // Buscar a meta tag og:image que contém a foto do grupo/canal
        const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        // Buscar a meta tag og:title que contém o nome do grupo/canal
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        // Buscar também no título da página como fallback
        const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        
        // Extrair o título (prioridade: og:title > title tag)
        let extractedTitle = identifier;
        if (ogTitleMatch && ogTitleMatch[1]) {
          extractedTitle = ogTitleMatch[1].trim();
          // Limpar caracteres especiais do Telegram (emojis, etc) se necessário
          extractedTitle = extractedTitle.replace(/\s*-\s*Telegram$/, '').trim();
        } else if (titleTagMatch && titleTagMatch[1]) {
          extractedTitle = titleTagMatch[1].trim();
          extractedTitle = extractedTitle.replace(/\s*-\s*Telegram$/, '').trim();
        }
        
        if (ogImageMatch && ogImageMatch[1]) {
          const imageUrl = ogImageMatch[1];
          
          // A URL pode vir com parâmetros, vamos limpar
          const cleanImageUrl = imageUrl.split('?')[0];
          
          return NextResponse.json({
            success: true,
            imageUrl: cleanImageUrl,
            username: identifier,
            title: extractedTitle,
            isPrivate: isPrivateLink
          });
        }

        // Se não encontrar og:image, tentar buscar a foto padrão do Telegram
        // Grupos/canais públicos têm uma foto padrão disponível
        const defaultImageUrl = `https://telegram.org/img/t_logo.png`;
        
        // Extrair título mesmo se não tiver imagem
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        let extractedTitle = identifier;
        if (ogTitleMatch && ogTitleMatch[1]) {
          extractedTitle = ogTitleMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
        } else if (titleTagMatch && titleTagMatch[1]) {
          extractedTitle = titleTagMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
        }
        
        return NextResponse.json({
          success: true,
          imageUrl: defaultImageUrl,
          username: identifier,
          title: extractedTitle,
          isDefault: true,
          isPrivate: isPrivateLink
        });
      } catch (error: any) {
        console.error('Erro ao buscar foto do Telegram:', error);
        
        // Retornar foto padrão em caso de erro
        // Tentar extrair título da URL da página mesmo com erro
        let extractedTitle = identifier;
        try {
          const pageUrl = `https://t.me/${identifier}`;
          const errorResponse = await fetch(pageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (errorResponse.ok) {
            const errorHtml = await errorResponse.text();
            const ogTitleMatch = errorHtml.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
            if (ogTitleMatch && ogTitleMatch[1]) {
              extractedTitle = ogTitleMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
            }
          }
        } catch (e) {
          // Ignorar erro ao tentar extrair título
        }
        
        return NextResponse.json({
          success: true,
          imageUrl: `https://telegram.org/img/t_logo.png`,
          username: identifier,
          title: extractedTitle,
          isDefault: true,
          isPrivate: isPrivateLink
        });
      }
    }

    // Se tiver bot token, usar a API oficial do Telegram
    // Nota: Links privados podem não funcionar com a API do bot, então vamos tentar o método alternativo primeiro
    if (isPrivateLink) {
      // Links privados: usar método de scraping
      try {
        const pageUrl = `https://t.me/${identifier}`;
        const response = await fetch(pageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          const html = await response.text();
          const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
          const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
          const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          
          // Extrair título
          let extractedTitle = identifier;
          if (ogTitleMatch && ogTitleMatch[1]) {
            extractedTitle = ogTitleMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
          } else if (titleTagMatch && titleTagMatch[1]) {
            extractedTitle = titleTagMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
          }
          
          // Retornar mesmo sem imagem, mas com título
          return NextResponse.json({
            success: true,
            imageUrl: ogImageMatch?.[1]?.split('?')[0] || `https://telegram.org/img/t_logo.png`,
            username: identifier,
            title: extractedTitle,
            isPrivate: true,
            isDefault: !ogImageMatch?.[1]
          });
        }
      } catch (error) {
        console.error('Erro ao buscar link privado:', error);
        // Retornar resposta padrão mesmo com erro
        return NextResponse.json({
          success: true,
          imageUrl: `https://telegram.org/img/t_logo.png`,
          username: identifier,
          title: identifier,
          isPrivate: true,
          isDefault: true
        });
      }
    }

    // Tentar API do bot para links públicos
    try {
      const apiUrl = isPrivateLink 
        ? `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChat?chat_id=${encodeURIComponent(identifier)}`
        : `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChat?chat_id=@${identifier}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.description || 'Erro ao buscar informações do Telegram');
      }

      const chat = data.result;
      const photoUrl = chat.photo?.big_file_id 
        ? `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${chat.photo.big_file_id}`
        : null;

      let imageUrl = null;
      if (photoUrl) {
        const fileResponse = await fetch(photoUrl);
        const fileData = await fileResponse.json();
        if (fileData.ok) {
          imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
        }
      }

      // Garantir que sempre retorne um título válido
      const chatTitle = chat.title || chat.first_name || chat.username || identifier;
      
      return NextResponse.json({
        success: true,
        imageUrl: imageUrl || `https://telegram.org/img/t_logo.png`,
        title: chatTitle,
        username: identifier,
        description: chat.description || null,
        isDefault: !imageUrl,
        isPrivate: isPrivateLink
      });
    } catch (error: any) {
      console.error('Erro ao usar API do Telegram:', error);
      
      // Fallback para método alternativo
      const pageUrl = `https://t.me/${identifier}`;
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        
        // Extrair título
        let extractedTitle = identifier;
        if (ogTitleMatch && ogTitleMatch[1]) {
          extractedTitle = ogTitleMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
        } else if (titleTagMatch && titleTagMatch[1]) {
          extractedTitle = titleTagMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
        }
        
        if (ogImageMatch && ogImageMatch[1]) {
          return NextResponse.json({
            success: true,
            imageUrl: ogImageMatch[1].split('?')[0],
            username: identifier,
            title: extractedTitle,
            isPrivate: isPrivateLink
          });
        }
      }

      // Fallback: tentar extrair título mesmo sem imagem
      let extractedTitle = identifier;
      try {
        const fallbackResponse = await fetch(`https://t.me/${identifier}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (fallbackResponse.ok) {
          const fallbackHtml = await fallbackResponse.text();
          const ogTitleMatch = fallbackHtml.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
          if (ogTitleMatch && ogTitleMatch[1]) {
            extractedTitle = ogTitleMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
          }
        }
      } catch (e) {
        // Ignorar erro
      }

      return NextResponse.json({
        success: true,
        imageUrl: `https://telegram.org/img/t_logo.png`,
        username: identifier,
        title: extractedTitle,
        isDefault: true,
        isPrivate: isPrivateLink
      });
    }
  } catch (error: any) {
    console.error('Erro na API de busca do Telegram:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações do Telegram: ' + error.message },
      { status: 500 }
    );
  }
}

