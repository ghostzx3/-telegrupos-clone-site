"use client";

import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onLoginClick: () => void;
  onSubmitGroupClick: () => void;
  onMenuToggle?: () => void;
}

export function Header({ onSearch, onLoginClick, onSubmitGroupClick, onMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    // Se o menu mobile do header fechar, não fechar o sidebar de categorias
    // O sidebar de categorias tem seu próprio controle
  };

  return (
    <header className="bg-[#038ede] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <h1 className="text-white font-bold text-sm sm:text-lg md:text-xl truncate">
              Grupostelegramx.com
            </h1>
          </div>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <Input
              type="text"
              placeholder="Faça sua busca..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-white/90 border-none h-9 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Mobile Search Icon */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Action Buttons - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              onClick={onSubmitGroupClick}
              className="bg-[#d97706] hover:bg-[#c26806] text-white text-sm h-9 px-3 lg:px-4"
            >
              <span className="hidden lg:inline">+ Enviar grupo</span>
              <span className="lg:hidden">+ Enviar</span>
            </Button>
            <Button
              onClick={onLoginClick}
              className="bg-transparent border border-white hover:bg-white/10 text-white text-sm h-9 px-3 lg:px-4"
            >
              <span className="hidden lg:inline">Entrar / Cadastrar</span>
              <span className="lg:hidden">Entrar</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/20">
            {/* Mobile Search */}
            <div className="relative mb-3">
              <Input
                type="text"
                placeholder="Faça sua busca..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-white/90 border-none h-10 pr-10 w-full"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  onSubmitGroupClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#d97706] hover:bg-[#c26806] text-white text-sm h-10"
              >
                + Enviar grupo
              </Button>
              <Button
                onClick={() => {
                  onLoginClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-transparent border border-white hover:bg-white/10 text-white text-sm h-10"
              >
                Entrar / Cadastrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}