"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { CategorySidebar } from "@/components/CategorySidebar";
import { GroupCard } from "@/components/GroupCard";
import { LoginModal } from "@/components/LoginModal";
import { SubmitGroupModal } from "@/components/SubmitGroupModal";
import { PromotionModal } from "@/components/PromotionModal";
import { Button } from "@/components/ui/button";
import type { Category, GroupWithCategory } from "@/lib/types/database";

const ITEMS_PER_PAGE = 24;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'popular' | 'members'>('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitGroupModalOpen, setIsSubmitGroupModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [groups, setGroups] = useState<GroupWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Show promotion modal on first visit
  useEffect(() => {
    const hasSeenPromo = sessionStorage.getItem("hasSeenPromo");
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsPromotionModalOpen(true);
        sessionStorage.setItem("hasSeenPromo", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch groups when filters change
  useEffect(() => {
    fetchGroups();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSearch={setSearchQuery}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSubmitGroupClick={() => setIsSubmitGroupModalOpen(true)}
      />

      <div className="flex flex-1">
        <CategorySidebar
          categories={categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color
          }))}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onSubmitGroupClick={() => setIsSubmitGroupModalOpen(true)}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onBoostClick={() => setIsPromotionModalOpen(true)}
        />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Title and Sort */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Grupos Telegram
              </h2>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-md bg-white text-gray-900 border-none"
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
                {/* Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      title={group.title}
                      category={group.categories?.slug || ''}
                      image={group.image_url || ''}
                      isPremium={group.is_premium}
                      link={group.telegram_link}
                    />
                  ))}
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
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-[#1796a6] hover:bg-[#15869a] text-white disabled:opacity-50"
                >
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`${
                        currentPage === page
                          ? "bg-[#1796a6] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-[#1796a6] hover:bg-[#15869a] text-white disabled:opacity-50"
                >
                  Próximo
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-16 py-8 border-t border-gray-600">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-white mb-4">
                Bem-vindo ao <strong>Telegrupos</strong>! Aqui você encontrará uma seleção dos
                melhores links para canais, bots e grupos do Telegram. Somos o maior site para a
                divulgação de canais e grupos, oferecendo um diretório para participação na
                comunidade Telegram.
              </p>
              <p className="text-sm text-gray-400">
                É importante notar que o Telegrupos não tem qualquer vínculo com o Telegram FZ-LLC.
                As informações disponibilizadas neste site têm caráter meramente informativo e não
                nos responsabilizamos pelo conteúdo das conversas sensíveis dos pets veiculador dos
                grupos listados. Todas as interações ocorrem diretamente nos canais e grupos do
                Telegram, fora do nosso site.
              </p>
              <div className="mt-6 flex justify-center gap-4 text-sm text-[#1796a6]">
                <a href="#" className="hover:underline">Política de Privacidade</a>
                <span className="text-gray-500">|</span>
                <a href="#" className="hover:underline">Termos de Uso</a>
                <span className="text-gray-500">|</span>
                <a href="#" className="hover:underline">DMCA</a>
                <span className="text-gray-500">|</span>
                <a href="#" className="hover:underline">Contato</a>
              </div>
              <p className="mt-4 text-xs text-gray-500">
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
      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
      />
    </div>
  );
}
