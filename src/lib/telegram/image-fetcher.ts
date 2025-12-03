/**
 * Utilitário para buscar imagens de grupos do Telegram usando a API oficial
 */

interface TelegramImageResult {
  success: boolean;
  imageUrl?: string;
  title?: string;
  error?: string;
}

/**
 * Extrai o username ou ID do link do Telegram
 */
export function extractTelegramIdentifier(link: string): string | null {
  if (!link || typeof link !== 'string') return null;

  // Padrões suportados:
  // - https://t.me/username
  // - t.me/username
  // - @username
  // - https://t.me/+XXXXXXXXXXXX (links privados)
  const patterns = [
    /(?:https?:\/\/)?(?:t\.me\/|@)(\+?[a-zA-Z0-9_-]+)/,
    /@([a-zA-Z0-9_]+)/,
  ];

  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Busca imagem do grupo usando a API oficial do Telegram
 */
export async function fetchTelegramGroupImage(
  telegramLink: string,
  botToken?: string
): Promise<TelegramImageResult> {
  try {
    // Extrair identificador do link
    const identifier = extractTelegramIdentifier(telegramLink);
    
    if (!identifier) {
      return {
        success: false,
        error: 'Link do Telegram inválido',
      };
    }

    // Se não houver bot token, tentar método alternativo (scraping)
    if (!botToken) {
      return await fetchImageViaScraping(identifier);
    }

    // Usar API oficial do Telegram
    const isPrivateLink = identifier.startsWith('+');
    const chatId = isPrivateLink ? identifier : `@${identifier}`;

    // 1. Buscar informações do chat
    const getChatUrl = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${encodeURIComponent(chatId)}`;
    const chatResponse = await fetch(getChatUrl);
    const chatData = await chatResponse.json();

    if (!chatData.ok) {
      console.warn('[Telegram API] Erro ao buscar chat:', chatData.description);
      
      // Fallback para scraping se a API falhar
      return await fetchImageViaScraping(identifier);
    }

    const chat = chatData.result;
    const title = chat.title || chat.first_name || chat.username || identifier;

    // 2. Verificar se tem foto
    if (!chat.photo) {
      // Sem foto, retornar apenas o título
      return {
        success: true,
        title,
        imageUrl: undefined,
      };
    }

    // 3. Buscar informações do arquivo da foto
    const fileId = chat.photo.big_file_id || chat.photo.small_file_id;
    if (!fileId) {
      return {
        success: true,
        title,
        imageUrl: undefined,
      };
    }

    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    const fileResponse = await fetch(getFileUrl);
    const fileData = await fileResponse.json();

    if (!fileData.ok || !fileData.result?.file_path) {
      console.warn('[Telegram API] Erro ao buscar arquivo:', fileData);
      return {
        success: true,
        title,
        imageUrl: undefined,
      };
    }

    // 4. Gerar URL final da imagem
    const imageUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;

    return {
      success: true,
      imageUrl,
      title,
    };
  } catch (error: any) {
    console.error('[Telegram API] Erro ao buscar imagem:', error);
    
    // Fallback para scraping
    const identifier = extractTelegramIdentifier(telegramLink);
    if (identifier) {
      return await fetchImageViaScraping(identifier);
    }

    return {
      success: false,
      error: error.message || 'Erro desconhecido ao buscar imagem',
    };
  }
}

/**
 * Método alternativo: buscar imagem via scraping da página pública
 */
async function fetchImageViaScraping(identifier: string): Promise<TelegramImageResult> {
  try {
    const pageUrl = `https://t.me/${identifier}`;
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Não foi possível acessar a página do Telegram',
      };
    }

    const html = await response.text();

    // Buscar og:image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    // Buscar og:title
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    // Buscar title tag
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    // Extrair título
    let title = identifier;
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
    } else if (titleTagMatch && titleTagMatch[1]) {
      title = titleTagMatch[1].trim().replace(/\s*-\s*Telegram$/, '').trim();
    }

    // Extrair imagem
    if (ogImageMatch && ogImageMatch[1]) {
      const imageUrl = ogImageMatch[1].split('?')[0];
      return {
        success: true,
        imageUrl,
        title,
      };
    }

    // Sem imagem, mas retornar título
    return {
      success: true,
      title,
      imageUrl: undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao fazer scraping',
    };
  }
}

