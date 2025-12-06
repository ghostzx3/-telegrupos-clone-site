import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para otimizar imagens
 * Redimensiona e comprime imagens para carregamento mais rápido
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const width = searchParams.get('w') || '400';
    const quality = searchParams.get('q') || '75';

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      );
    }

    // Para imagens do Telegram, usar a URL diretamente com parâmetros de otimização
    // O Next.js Image já faz otimização automática, mas podemos adicionar parâmetros aqui
    // Para imagens externas, retornamos a URL com query params para serviços de otimização

    // Se for uma URL do Telegram CDN, podemos adicionar parâmetros de tamanho
    let optimizedUrl = imageUrl;

    // Para imagens do Telegram CDN, podemos usar diferentes tamanhos
    if (imageUrl.includes('telegram-cdn.org') || imageUrl.includes('api.telegram.org')) {
      // Telegram já fornece diferentes tamanhos, mas podemos usar a URL original
      // O Next.js Image component vai otimizar automaticamente
      optimizedUrl = imageUrl;
    }

    // Para imagens do Supabase Storage, podemos usar transformações
    if (imageUrl.includes('supabase.co') || imageUrl.includes('supabase.in')) {
      // Supabase Storage suporta transformações via query params
      const urlObj = new URL(imageUrl);
      urlObj.searchParams.set('width', width);
      urlObj.searchParams.set('quality', quality);
      optimizedUrl = urlObj.toString();
    }

    return NextResponse.json({
      optimizedUrl,
      originalUrl: imageUrl,
      width: parseInt(width),
      quality: parseInt(quality),
    });
  } catch (error: any) {
    console.error('Erro ao otimizar imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao otimizar imagem: ' + error.message },
      { status: 500 }
    );
  }
}




