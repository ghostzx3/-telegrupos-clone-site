"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";

interface GroupCardProps {
  title: string;
  category: string;
  image: string;
  isPremium: boolean;
  link: string;
}

export function GroupCard({ title, category, image, isPremium, link }: GroupCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Validar e processar URL da imagem
  // Remove espaços, verifica se não é null/undefined, e se não houve erro anterior
  // Aceita qualquer URL válida (http, https, data URIs, ou caminhos relativos)
  const validImage = image && 
    typeof image === 'string' && 
    image.trim() !== '' && 
    image !== 'null' && 
    image !== 'undefined' && 
    !imageError;

  // Debug: log da imagem recebida
  useEffect(() => {
    if (image) {
      console.log('[GroupCard] Imagem recebida:', {
        title,
        image,
        imageType: typeof image,
        imageLength: image.length,
        isValid: validImage
      });
    }
  }, [image, title, validImage]);
  
  const getCategoryDisplay = (cat: string) => {
    const categoryMap: Record<string, string> = {
      "apostas": "Apostas",
      "ganhar-dinheiro": "Ganhar Dinheiro",
      "filmes-series": "Filmes e Séries",
      "ofertas-cupons": "Ofertas e Cupons",
      "divulgacao": "Divulgação",
      "criptomoedas": "Criptomoedas",
      "culinaria": "Culinária e Receitas",
      "amizade": "Amizade",
      "namoro": "Namoro",
      "cursos": "Cursos",
      "educacao": "Educação",
      "empreendedorismo": "Empreendedorismo",
      "esportes": "Esportes",
      "futebol": "Futebol",
      "adulto": "Adulto",
      "outros": "Outros",
    };
    return categoryMap[cat] || cat;
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col w-full">
      <CardContent className="p-0 flex flex-col h-full w-full">
        <div className="relative flex flex-col h-full w-full">
          {/* Image - Proporção quadrada/retangular */}
          <div className="relative w-full bg-gray-200 flex-shrink-0 rounded-t-lg overflow-hidden" style={{ aspectRatio: '1 / 1', minHeight: '120px' }}>
            {validImage && !imageError ? (
              <>
                <img
                  src={image}
                  alt={title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onError={(e) => {
                    console.error('[GroupCard] Erro ao carregar imagem:', {
                      title,
                      image,
                      error: e
                    });
                    setImageError(true);
                    setImageLoaded(false);
                  }}
                  onLoad={() => {
                    console.log('[GroupCard] Imagem carregada com sucesso:', {
                      title,
                      image
                    });
                    setImageLoaded(true);
                    setImageError(false);
                  }}
                />
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📱</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📱</span>
              </div>
            )}
            {/* Premium Badge */}
            {isPremium && (
              <Badge className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-10">
                Plus
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-4 flex flex-col flex-1 w-full">
            {/* Título do Grupo */}
            <h3 className="font-semibold text-gray-900 text-xs sm:text-base mb-1.5 sm:mb-2 line-clamp-2 leading-tight">
              {title}
            </h3>
            
            {/* Categoria */}
            <p className="text-[10px] sm:text-sm text-gray-500 mb-2.5 sm:mb-4 font-medium">
              {getCategoryDisplay(category)}
            </p>

            {/* Enter Button */}
            <Link href={link} className="mt-auto w-full">
              <Button className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-[11px] sm:text-base font-semibold h-8 sm:h-10 min-h-[32px] sm:min-h-[40px] rounded-md shadow-sm">
                ENTRAR
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}