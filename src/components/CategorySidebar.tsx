"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onSubmitGroupClick: () => void;
  onLoginClick: () => void;
  onBoostClick: () => void;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onCategorySelect,
  onSubmitGroupClick,
  onLoginClick,
  onBoostClick,
}: CategorySidebarProps) {
  return (
    <aside className="w-64 sm:w-72 flex-shrink-0 bg-[#2c2c2c] lg:bg-transparent h-screen lg:h-auto">
      <ScrollArea className="h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)]">
        <div className="space-y-2.5 sm:space-y-3 p-3 sm:p-4">
          {/* Action Buttons */}
          <Button
            onClick={onSubmitGroupClick}
            className="w-full justify-start bg-[#FF0000] hover:bg-[#E60000] active:bg-[#CC0000] text-white text-sm sm:text-base font-medium h-11 sm:h-12 min-h-[44px] px-4"
          >
            Enviar grupo
          </Button>

          <Button
            onClick={onLoginClick}
            className="w-full justify-start bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-sm sm:text-base font-medium h-11 sm:h-12 min-h-[44px] px-4"
          >
            Minha Conta
          </Button>

          <Button
            onClick={onBoostClick}
            className="w-full justify-start bg-[#FF0000] hover:bg-[#E60000] active:bg-[#CC0000] text-white text-sm sm:text-base font-medium h-11 sm:h-12 min-h-[44px] px-4"
          >
            Impulsionar Grupo
          </Button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => onCategorySelect(category.id === selectedCategory ? null : category.id)}
              className="w-full justify-start text-white text-sm sm:text-base font-medium h-11 sm:h-12 min-h-[44px] px-4 transition-all"
              style={{
                backgroundColor: selectedCategory === category.id ? '#0277c7' : category.color,
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}