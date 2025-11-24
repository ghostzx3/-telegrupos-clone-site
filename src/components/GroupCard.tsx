"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface GroupCardProps {
  title: string;
  category: string;
  image: string;
  isPremium: boolean;
  link: string;
}

export function GroupCard({ title, category, image, isPremium, link }: GroupCardProps) {
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
    <Card className="bg-[#f0f0f0] border-none shadow-md hover:shadow-lg active:shadow-xl transition-all overflow-hidden h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative flex flex-col h-full">
          {/* Image */}
          <div className="relative w-full h-40 sm:h-48 md:h-52 bg-gray-200 flex-shrink-0">
            {image && (
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            )}
            {/* Premium Badge */}
            {isPremium && (
              <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 py-1">
                Plus
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 flex flex-col flex-1">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{getCategoryDisplay(category)}</p>

            {/* Enter Button */}
            <Link href={link} className="mt-auto">
              <Button className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-sm sm:text-base font-medium h-11 sm:h-12 min-h-[44px]">
                ENTRAR
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}