"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onLoginClick: () => void;
  onSubmitGroupClick: () => void;
}

export function Header({ onSearch, onLoginClick, onSubmitGroupClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <header className="bg-[#1796a6] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <h1 className="text-white font-bold text-xl">Grupostelegramx.com</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <Input
              type="text"
              placeholder="Faça sua busca..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-white/90 border-none h-9 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onSubmitGroupClick}
              className="bg-[#d97706] hover:bg-[#c26806] text-white text-sm h-9 px-4"
            >
              + Enviar grupo
            </Button>
            <Button
              onClick={onLoginClick}
              className="bg-transparent border border-white hover:bg-white/10 text-white text-sm h-9 px-4"
            >
              Entrar / Cadastrar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
