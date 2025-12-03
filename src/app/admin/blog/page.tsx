"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import type { BlogPostWithTags } from "@/lib/types/database";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin, currentPage, searchQuery]);

  async function checkAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/';
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      window.location.href = '/';
      return;
    }

    setIsAdmin(true);
  }

  async function fetchPosts() {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '20',
    });

    if (searchQuery) params.append('search', searchQuery);

    const response = await fetch(`/api/admin/blog?${params}`);
    const data = await response.json();
    setPosts(data.posts || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  async function deletePost(id: string) {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;

    const response = await fetch(`/api/admin/blog/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchPosts();
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2c2c2c] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Gerenciar Blog</h1>
          <Link href="/admin/blog/new">
            <Button className="bg-[#038ede] hover:bg-[#0277c7] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Post
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar posts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <p className="text-white">Carregando...</p>
        ) : posts.length === 0 ? (
          <Card className="bg-[#f0f0f0]">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Nenhum post encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="bg-[#f0f0f0]">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    {post.image_url && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover rounded"
                          unoptimized
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                          {post.category && (
                            <p className="text-sm text-gray-600">
                              Categoria: {post.category.name}
                            </p>
                          )}
                          {post.author && (
                            <p className="text-sm text-gray-600">
                              Autor: {post.author.full_name || 'N/A'}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {format(new Date(post.created_at), 'dd/MM/yyyy HH:mm')}
                          </p>
                          {post.excerpt && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={
                            post.is_published
                              ? 'bg-green-600'
                              : 'bg-yellow-600'
                          }
                        >
                          {post.is_published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>👁️ {post.view_count || 0} visualizações</span>
                        {post.video_url && <span>🎥 Tem vídeo</span>}
                        {post.media && post.media.length > 0 && (
                          <span>🖼️ {post.media.length} mídia(s)</span>
                        )}
                        {post.links && post.links.length > 0 && (
                          <span>🔗 {post.links.length} link(s)</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/${post.id}`}>
                          <Button className="bg-[#038ede] hover:bg-[#0277c7] text-white" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          onClick={() => deletePost(post.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Anterior
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? 'default' : 'outline'}
                  className={currentPage === page ? 'bg-[#038ede]' : ''}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Próximo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}















