"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PromotionModal({ isOpen, onClose }: PromotionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[#038ede] p-1.5 text-white hover:bg-[#0277c7] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="space-y-4">
          <div className="relative w-full h-48 bg-gradient-to-r from-[#038ede] to-[#0277c7] rounded-lg overflow-hidden">
            <Image
              src="https://ext.same-assets.com/1088239773/3963962454.jpeg"
              alt="Promoção"
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 512px"
            />
          </div>

          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Quer divulgar mais?
          </DialogTitle>

          <p className="text-center text-gray-600">
            Junte-se ao novo divulgador e encontre as melhores oportunidades para
            divulgar seus links com mais alcance!
          </p>

          <Button
            onClick={() => {
              window.open("https://divulgadordelinks.com", "_blank");
              onClose();
            }}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-lg py-6"
          >
            Acessar agora!
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}