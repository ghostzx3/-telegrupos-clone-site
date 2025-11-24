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
      <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <h1 className="text-white font-bold text-xs sm:text-base md:text-lg lg:text-xl truncate">
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
              className="bg-white/90 border-none h-10 sm:h-11 pr-10 text-sm sm:text-base"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 pointer-events-none" />
          </div>

          {/* Mobile Menu Button - Minimum touch target 44x44px */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors active:bg-white/20"
            aria-label="Toggle menu"
            type="button"
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
              className="bg-[#d97706] hover:bg-[#c26806] text-white text-sm sm:text-base h-10 sm:h-11 px-3 sm:px-4 lg:px-5 min-h-[44px]"
            >
              <span className="hidden lg:inline">+ Enviar grupo</span>
              <span className="lg:hidden">+ Enviar</span>
            </Button>
            <Button
              onClick={onLoginClick}
              className="bg-transparent border border-white hover:bg-white/10 text-white text-sm sm:text-base h-10 sm:h-11 px-3 sm:px-4 lg:px-5 min-h-[44px]"
            >
              <span className="hidden lg:inline">Entrar / Cadastrar</span>
              <span className="lg:hidden">Entrar</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/20 animate-in slide-in-from-top-2">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Faça sua busca..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-white/90 border-none h-12 pr-12 w-full text-base"
                autoFocus={false}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  onSubmitGroupClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#d97706] hover:bg-[#c26806] active:bg-[#b85d05] text-white text-base font-medium h-12 min-h-[44px]"
              >
                + Enviar grupo
              </Button>
              <Button
                onClick={() => {
                  onLoginClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-transparent border-2 border-white hover:bg-white/10 active:bg-white/20 text-white text-base font-medium h-12 min-h-[44px]"
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