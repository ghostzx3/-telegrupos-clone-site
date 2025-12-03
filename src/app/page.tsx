"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { CategorySidebar } from "@/components/CategorySidebar";
import { GroupCard } from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import type { Category, GroupWithCategory } from "@/lib/types/database";

// Lazy load modals - só carregam quando necessário
const LoginModal = dynamic(() => import("@/components/LoginModal").then(mod => ({ default: mod.LoginModal })), {
  ssr: false,
});

const SubmitGroupModal = dynamic(() => import("@/components/SubmitGroupModal").then(mod => ({ default: mod.SubmitGroupModal })), {
  ssr: false,
});

// PromotionModal removido - redirecionando para planos

const ITEMS_PER_PAGE = 24;

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'popular' | 'members'>('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitGroupModalOpen, setIsSubmitGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState<GroupWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal promocional removido

  // Fetch categories and set default to "adulto"
  useEffect(() => {
    fetchCategories();
  }, []);

  // Set default category to "adulto" after categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const adultoCategory = categories.find(cat => cat.slug === 'adulto');
      if (adultoCategory) {
        setSelectedCategory(adultoCategory.id);
      }
    }
  }, [categories, selectedCategory]);

  // Fetch groups when filters change (only if category is selected)
  useEffect(() => {
    if (selectedCategory) {
      fetchGroups();
    }
  }, [searchQuery, selectedCategory, sortBy, currentPage]);

  async function fetchCategories() {
    const response = await fetch('/api/categories');
    const data = await response.json();
    setCategories(data.categories || []);
  }

  async function fetchGroups() {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
      sort: sortBy,
    });

    if (selectedCategory) params.append('category', selectedCategory);
    if (searchQuery) params.append('search', searchQuery);

    const response = await fetch(`/api/groups?${params}`);
    const data = await response.json();

    setGroups(data.groups || []);
    setTotalPages(data.totalPages || 0);
    setLoading(false);
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSearch={setSearchQuery}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSubmitGroupClick={() => setIsSubmitGroupModalOpen(true)}
      />

      <div className="flex flex-1 relative">
        {/* CategorySidebar - Hidden on mobile, shown on desktop */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <CategorySidebar
            categories={categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              color: cat.color
            }))}
            selectedCategory={selectedCategory}
            onCategorySelect={(id) => {
              handleCategorySelect(id);
              setIsSidebarOpen(false);
            }}
            onSubmitGroupClick={() => {
              setIsSubmitGroupModalOpen(true);
              setIsSidebarOpen(false);
            }}
            onLoginClick={() => {
              setIsLoginModalOpen(true);
              setIsSidebarOpen(false);
            }}
            onBoostClick={async () => {
              setIsSidebarOpen(false);
              try {
                // Verificar se o usuário está logado
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                  // Usuário logado - redirecionar para planos
                  window.location.href = '/dashboard/planos';
                } else {
                  // Usuário não logado - abrir modal de login
                  setIsLoginModalOpen(true);
                }
              } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                // Em caso de erro, abrir modal de login
                setIsLoginModalOpen(true);
              }
            }}
          />
        </div>
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-3 sm:p-4 md:p-6 w-full lg:w-auto">
          <div className="max-w-7xl mx-auto w-full">
            {/* Title and Sort */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Mobile Menu Button - Abrir categorias */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsSidebarOpen(!isSidebarOpen);
                  }}
                  className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:bg-white/10 active:bg-white/20 rounded-md transition-colors flex-shrink-0"
                  aria-label="Abrir categorias"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  Grupos Telegram
                </h2>
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-md bg-white text-gray-900 border-none text-xs sm:text-base w-auto h-auto sm:min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#038ede] flex-shrink-0"
              >
                <option value="created_at">Mais Recentes</option>
                <option value="popular">Mais Populares</option>
                <option value="members">Mais Membros</option>
              </select>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-white text-lg">Carregando grupos...</p>
              </div>
            ) : (
              <>
                {/* Groups Grid - 2 colunas no mobile, 3-4 no desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 w-full" style={{ display: 'grid' }}>
                  {groups.map((group) => {
                    // Log para debug
                    console.log('[HomePage] Renderizando grupo:', {
                      id: group.id,
                      title: group.title,
                      image_url: group.image_url,
                      hasImage: !!group.image_url
                    });
                    
                    return (
                      <GroupCard
                        key={group.id}
                        title={group.title}
                        category={group.categories?.slug || ''}
                        image={group.image_url || ''}
                        isPremium={group.is_premium}
                        link={group.slug ? `/grupo/${group.slug}` : (group.telegram_link || '#')}
                      />
                    );
                  })}
                </div>

                {/* No results message */}
                {groups.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white text-lg">
                      Nenhum grupo encontrado. Tente outra busca ou categoria.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6 sm:mt-8">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white disabled:opacity-50 text-sm sm:text-base px-4 sm:px-5 h-11 sm:h-10 min-h-[44px]"
                >
                  Anterior
                </Button>

                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`text-sm sm:text-base min-w-[44px] min-h-[44px] h-11 sm:h-10 ${
                        currentPage === page
                          ? "bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white disabled:opacity-50 text-sm sm:text-base px-4 sm:px-5 h-11 sm:h-10 min-h-[44px]"
                >
                  Próximo
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 sm:mt-16 py-6 sm:py-8 border-t border-gray-600">
            <div className="max-w-7xl mx-auto text-center px-4">
              <p className="text-white mb-3 sm:mb-4 text-sm sm:text-base">
                Bem-vindo ao <strong>Telegrupos</strong>! Aqui você encontrará uma seleção dos
                melhores links para canais, bots e grupos do Telegram. Somos o maior site para a
                divulgação de canais e grupos, oferecendo um diretório para participação na
                comunidade Telegram.
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
                É importante notar que o Telegrupos não tem qualquer vínculo com o Telegram FZ-LLC.
                As informações disponibilizadas neste site têm caráter meramente informativo e não
                nos responsabilizamos pelo conteúdo das conversas sensíveis dos pets veiculador dos
                grupos listados. Todas as interações ocorrem diretamente nos canais e grupos do
                Telegram, fora do nosso site.
              </p>
              <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#038ede]">
                <a href="#" className="hover:underline">Política de Privacidade</a>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <a href="#" className="hover:underline">Termos de Uso</a>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <a href="#" className="hover:underline">DMCA</a>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <a href="#" className="hover:underline">Remoção de Links</a>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <Link href="/blog" className="hover:underline">Blog</Link>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <a href="#" className="hover:underline">Contato</a>
              </div>
              <p className="mt-3 sm:mt-4 text-xs text-gray-500">
                © 2025 - Grupos Telegram
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <SubmitGroupModal
        isOpen={isSubmitGroupModalOpen}
        onClose={() => setIsSubmitGroupModalOpen(false)}
      />
    </div>
  );
}