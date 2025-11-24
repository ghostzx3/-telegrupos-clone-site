"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { CategorySidebar } from "@/components/CategorySidebar";
import { BlogPostCard } from "@/components/BlogPostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category, BlogPostWithTags, Tag } from "@/lib/types/database";

// Lazy load modals - só carregam quando necessário
const LoginModal = dynamic(() => import("@/components/LoginModal").then(mod => ({ default: mod.LoginModal })), {
  ssr: false,
});

const SubmitGroupModal = dynamic(() => import("@/components/SubmitGroupModal").then(mod => ({ default: mod.SubmitGroupModal })), {
  ssr: false,
});

// PromotionModal removido - redirecionando para planos

const ITEMS_PER_PAGE = 12;

export default function BlogPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitGroupModalOpen, setIsSubmitGroupModalOpen] = useState(false);
  const [posts, setPosts] = useState<BlogPostWithTags[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedTag, currentPage]);

  async function fetchCategories() {
    const response = await fetch('/api/categories');
    const data = await response.json();
    setCategories(data.categories || []);
  }

  async function fetchTags() {
    const response = await fetch('/api/tags');
    const data = await response.json();
    setTags(data.tags || []);
  }

  async function fetchPosts() {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    });

    if (selectedTag) params.append('tag', selectedTag);
    if (searchQuery) params.append('search', searchQuery);

    const response = await fetch(`/api/blog?${params}`);
    const data = await response.json();

    setPosts(data.posts || []);
    setTotalPages(data.totalPages || 0);
    setLoading(false);
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchQuery, selectedTag]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSearch={setSearchQuery}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSubmitGroupClick={() => setIsSubmitGroupModalOpen(true)}
      />

      <div className="flex flex-1 relative">
        {/* CategorySidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <CategorySidebar
            categories={categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              color: cat.color
            }))}
            selectedCategory={null}
            onCategorySelect={() => {}}
            onSubmitGroupClick={() => setIsSubmitGroupModalOpen(true)}
            onLoginClick={() => setIsLoginModalOpen(true)}
            onBoostClick={() => router.push('/dashboard/planos')}
          />
        </div>

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Blog</h1>
              <p className="text-sm sm:text-base text-gray-300">
                Encontre tudo sobre grupos de Telegram no blog do Telegrupos. Dicas, novidades e conteúdos exclusivos para você explorar!
              </p>
            </div>

            {/* Tag Filter */}
            {tags.length > 0 && (
              <div className="mb-6">
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <p className="text-white text-sm mb-3 font-medium">GRUPOS TELEGRAM</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      onClick={() => setSelectedTag(null)}
                      className={`cursor-pointer ${
                        selectedTag === null
                          ? 'bg-[#038ede] text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Todos
                    </Badge>
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.slug)}
                        className={`cursor-pointer ${
                          selectedTag === tag.slug
                            ? 'bg-[#038ede] text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-white text-lg">Carregando posts...</p>
              </div>
            ) : (
              <>
                {/* Posts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {posts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* No results message */}
                {posts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white text-lg">
                      Nenhum post encontrado. Tente outra busca ou tag.
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
