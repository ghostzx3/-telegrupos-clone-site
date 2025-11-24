"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { 
  Users, 
  Plus, 
  Crown, 
  User, 
  HelpCircle, 
  Lock, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface DashboardSidebarProps {
  activeItem: string;
}

export function DashboardSidebar({ activeItem }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    window.location.reload();
  }

  const menuItems = [
    { id: 'grupos', label: 'Meus grupos', icon: Users, href: '/dashboard' },
    { id: 'cadastrar', label: 'Cadastrar grupo', icon: Plus, href: '/dashboard/cadastrar' },
    { id: 'planos', label: 'Planos', icon: Crown, href: '/dashboard/planos' },
    { id: 'dados', label: 'Meus Dados', icon: User, href: '/dashboard/dados' },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle, href: '#' },
    { id: 'senha', label: 'Senha de Acesso', icon: Lock, href: '/dashboard/senha' },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Overlay for mobile - Deve estar antes do sidebar para não bloquear */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[45]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white rounded-md shadow-lg transition-colors"
        aria-label="Toggle menu"
        type="button"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[50]
        w-64 bg-gray-100 min-h-screen p-4
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-2 relative">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          if (item.id === 'suporte') {
            return (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Redirecionamento temporário
                  window.open('https://suporte.exemplo.com', '_blank');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-lg transition-colors min-h-[44px] text-sm sm:text-base ${
                  isActive
                    ? 'bg-[#038ede] text-white'
                    : 'text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-lg transition-colors min-h-[44px] text-sm sm:text-base ${
                isActive
                  ? 'bg-[#038ede] text-white'
                  : 'text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        <button
          onClick={() => {
            handleLogout();
            setIsMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-lg text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-colors min-h-[44px] text-sm sm:text-base"
          type="button"
        >
          <LogOut className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
    </>
  );
}

