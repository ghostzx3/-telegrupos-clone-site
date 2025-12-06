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

  // Função para lidar com erro de carregamento
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Se já tentou carregar a imagem padrão, não tentar novamente
    if (target.src.includes('data:image/svg+xml')) {
      return;
    }
    
    console.error('[GroupImage] Erro ao carregar imagem:', {
      title,
      originalUrl: imageUrl,
      finalUrl,
    });
    
    // Tentar usar imagem padrão SVG como fallback (sem base64)
    const firstLetter = title.charAt(0).toUpperCase();
    const svgContent = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#038ede;stop-opacity:1" /><stop offset="100%" style="stop-color:#0277c7;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(#grad)"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${firstLetter}</text></svg>`);
    const defaultSvg = `data:image/svg+xml;charset=utf-8,${svgContent}`;
    
    target.src = defaultSvg;
    setHasError(true);
  };

  // Se não houver URL válida ou houver erro, mostrar placeholder
  if (!finalUrl || hasError) {
    // Criar SVG padrão inline (sem base64)
    const firstLetter = title.charAt(0).toUpperCase();
    const svgContent = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#038ede;stop-opacity:1" /><stop offset="100%" style="stop-color:#0277c7;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(#grad)"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${firstLetter}</text></svg>`);
    const defaultSvg = `data:image/svg+xml;charset=utf-8,${svgContent}`;
    
    return (
      <img
        src={defaultSvg}
        alt={title}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  // Mostrar imagem diretamente
  return (
    <img
      src={finalUrl}
      alt={title}
      className={`w-full h-full object-cover ${className}`}
      loading="lazy"
      onError={handleImageError}
      onLoad={() => {
        console.log('[GroupImage] ✅ Imagem carregada com sucesso:', {
          title,
          url: finalUrl
        });
      }}
    />
  );
}

