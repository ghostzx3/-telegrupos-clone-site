"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import Image from "next/image";
import type { BlogPostWithTags } from "@/lib/types/database";

// Lazy load modals - só carregam quando necessário
const LoginModal = dynamic(() => import("@/components/LoginModal").then(mod => ({ default: mod.LoginModal })), {
  ssr: false,
});

const SubmitGroupModal = dynamic(() => import("@/components/SubmitGroupModal").then(mod => ({ default: mod.SubmitGroupModal })), {
  ssr: false,
});

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPostWithTags | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitGroupModalOpen, setIsSubmitGroupModalOpen] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string);
    }
  }, [params.slug]);

  async function fetchPost(slug: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();

      if (data.error) {
        router.push('/blog');
        return;
      }

      setPost(data.post);
    } catch (error) {
      console.error('Error:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#2c2c2c]">
        <Header
          onSearch={() => {}}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSubmitGroupClick={() => setIsSubmitGroupModalOpen(true)}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#2c2c2c]">
      <Header
        onSearch={() => {}}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSubmitGroupClick={() => setIsSubmitGroupModalOpen(true)}
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button
            onClick={() => router.push('/blog')}
            variant="ghost"
            className="text-white hover:text-[#038ede] mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Blog
          </Button>

          {/* Post Content */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Featured Image */}
            {post.image_url && (
              <div className="relative w-full h-96">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 896px"
                  onError={(e) => {
                    // Fallback para placeholder quando a imagem falha
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('data:image/svg+xml')) {
                      const defaultSvg = `data:image/svg+xml;base64,${btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
                          <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color:#038ede;stop-opacity:1" />
                              <stop offset="100%" style="stop-color:#0277c7;stop-opacity:1" />
                            </linearGradient>
                          </defs>
                          <rect width="800" height="400" fill="url(#grad)"/>
                          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="96" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${post.title.charAt(0).toUpperCase()}</text>
                        </svg>
                      `)}`;
                      target.src = defaultSvg;
                    }
                  }}
                />
              </div>
            )}

            <div className="p-8">
              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.view_count || 0} visualizações</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      onClick={() => router.push(`/blog?tag=${tag.slug}`)}
                      className="cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Author */}
              {post.author && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Escrito por <strong>{post.author.full_name}</strong>
                  </p>
                </div>
              )}
            </div>
          </article>

          {/* CTA */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-900 mb-4">
              Visite nosso <strong>Blog</strong> para encontrar artigos com dicas e perguntas frequentes relacionadas ao Telegram e sociais.
            </p>
            <Button
              onClick={() => router.push('/blog')}
              className="bg-[#038ede] hover:bg-[#0277c7] text-white"
            >
              Ver mais artigos
            </Button>
          </div>
        </div>
      </main>

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
