"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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
    <Card className="bg-[#f0f0f0] border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Image */}
          <div className="relative w-full h-48 bg-gray-200">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
            {/* Premium Badge */}
            {isPremium && (
              <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700 text-white">
                Plus
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px]">
              {title}
            </h3>
            <p className="text-xs text-gray-600 mb-3">{getCategoryDisplay(category)}</p>

            {/* Enter Button */}
            <Button
              onClick={() => window.open(link, '_blank')}
              className="w-full bg-[#1796a6] hover:bg-[#15869a] text-white"
            >
              ENTRAR
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
