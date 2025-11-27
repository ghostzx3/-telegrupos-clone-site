import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST - Upload de imagens/vídeos
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mediaType = formData.get('media_type') as string || 'image';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    if (mediaType === 'image' && !validImageTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de imagem inválido' }, { status: 400 });
    }
    
    if (mediaType === 'video' && !validVideoTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de vídeo inválido' }, { status: 400 });
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `blog/${mediaType}s/${fileName}`;

    // Upload para Supabase Storage (se configurado)
    // Por enquanto, retornamos uma URL temporária
    // Você pode configurar Supabase Storage ou usar outro serviço
    
    // Para desenvolvimento, vamos retornar uma URL base64 ou URL externa
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Se você tiver Supabase Storage configurado, use:
    /*
    const { data, error } = await supabase.storage
      .from('blog-media')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('blog-media')
      .getPublicUrl(filePath);
    */

    // Por enquanto, retornamos a data URL (para produção, use um serviço de storage)
    return NextResponse.json({
      url: dataUrl,
      fileName,
      filePath,
      mediaType,
      size: file.size
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}












