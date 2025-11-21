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
    <aside className="w-64 flex-shrink-0">
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="space-y-2 p-4">
          {/* Action Buttons */}
          <Button
            onClick={onSubmitGroupClick}
            className="w-full justify-start bg-[#1796a6] hover:bg-[#15869a] text-white"
          >
            Enviar grupo
          </Button>

          <Button
            onClick={onLoginClick}
            className="w-full justify-start bg-[#1796a6] hover:bg-[#15869a] text-white"
          >
            Minha Conta
          </Button>

          <Button
            onClick={onBoostClick}
            className="w-full justify-start bg-[#d97706] hover:bg-[#c26806] text-white"
          >
            Impulsionar Grupo
          </Button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => onCategorySelect(category.id === selectedCategory ? null : category.id)}
              className="w-full justify-start text-white"
              style={{
                backgroundColor: selectedCategory === category.id ? '#15869a' : category.color,
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
