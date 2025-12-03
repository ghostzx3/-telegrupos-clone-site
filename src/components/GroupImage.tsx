"use client";

import { useState, useEffect } from "react";

interface GroupImageProps {
  imageUrl: string | null | undefined;
  title: string;
  className?: string;
}

export function GroupImage({ imageUrl, title, className = "" }: GroupImageProps) {
  const [hasError, setHasError] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state when URL changes
    setHasError(false);
    
    // Processar e validar URL
    if (!imageUrl) {
      console.log('[GroupImage] Sem URL para:', title);
      setFinalUrl(null);
      return;
    }

    if (typeof imageUrl !== 'string') {
      console.warn('[GroupImage] URL não é string para:', title, imageUrl);
      setFinalUrl(null);
      return;
    }

    const trimmed = imageUrl.trim();
    
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '') {
      console.log('[GroupImage] URL vazia ou inválida para:', title);
      setFinalUrl(null);
      return;
    }

    // Se já é uma URL válida, usar diretamente
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
      console.log('[GroupImage] URL válida encontrada para:', title, trimmed);
      setFinalUrl(trimmed);
      return;
    }

    // Tentar adicionar protocolo se não tiver
    console.log('[GroupImage] Tentando corrigir URL para:', title, trimmed);
    setFinalUrl(`https://${trimmed}`);
  }, [imageUrl, title]);

  // Se não houver URL válida ou houver erro, mostrar placeholder
  if (!finalUrl || hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-2xl">📱</span>
      </div>
    );
  }

  // Mostrar imagem diretamente
  return (
    <img
      src={finalUrl}
      alt={title}
      className={`w-full h-full object-cover ${className}`}
      loading="lazy"
      onError={(e) => {
        console.error('[GroupImage] Erro ao carregar imagem:', {
          title,
          originalUrl: imageUrl,
          finalUrl,
          error: e
        });
        setHasError(true);
        setFinalUrl(null);
      }}
      onLoad={() => {
        console.log('[GroupImage] ✅ Imagem carregada com sucesso:', {
          title,
          url: finalUrl
        });
      }}
    />
  );
}

