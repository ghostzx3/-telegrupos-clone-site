"use client";

import { useState } from "react";

interface GroupImageProps {
  imageUrl: string | null | undefined;
  title: string;
  className?: string;
}

export function GroupImage({ imageUrl, title, className = "" }: GroupImageProps) {
  const [hasError, setHasError] = useState(false);

  // Validar URL da imagem
  const validImageUrl = imageUrl && 
    typeof imageUrl === 'string' && 
    imageUrl.trim() !== '' && 
    imageUrl !== 'null' && 
    imageUrl !== 'undefined';

  // Se não houver URL válida ou houver erro, mostrar placeholder
  if (!validImageUrl || hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-2xl">📱</span>
      </div>
    );
  }

  // Mostrar imagem diretamente sem verificação prévia
  return (
    <img
      src={imageUrl}
      alt={title}
      className={`w-full h-full object-cover ${className}`}
      loading="lazy"
      onError={() => {
        console.error('[GroupImage] Erro ao carregar imagem:', {
          title,
          imageUrl,
          error: 'Falha ao carregar imagem'
        });
        setHasError(true);
      }}
      onLoad={() => {
        console.log('[GroupImage] Imagem carregada com sucesso:', {
          title,
          imageUrl
        });
      }}
    />
  );
}

