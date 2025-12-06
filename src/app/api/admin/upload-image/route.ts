import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Tamanho máximo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Tipos de imagem permitidos
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para enviar imagens.' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem fazer upload.' },
        { status: 403 }
      );
    }

    // Obter arquivo do FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WEBP.' 
        },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileName = `admin/${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `group-images/${fileName}`;

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('group-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('[Upload Admin] Erro ao fazer upload:', uploadError);
      
      // Se o bucket não existir, retornar erro específico
      if (uploadError.message.includes('Bucket not found')) {
        return NextResponse.json(
          { 
            error: 'Bucket de storage não configurado. Configure o bucket "group-images" no Supabase.',
            details: 'Acesse Storage no Supabase Dashboard e crie um bucket público chamado "group-images"'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Erro ao fazer upload da imagem', details: uploadError.message },
        { status: 500 }
      );
    }

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('group-images')
      .getPublicUrl(filePath);

    console.log('[Upload Admin] Imagem enviada com sucesso:', {
      fileName: uploadData.path,
      size: file.size,
      type: file.type,
      url: publicUrl,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uploadData.path,
      size: file.size,
      type: file.type,
    });
  } catch (error: unknown) {
    console.error('[Upload Admin] Erro inesperado:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar upload',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}







