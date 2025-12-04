"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, ArrowLeft, Upload } from "lucide-react";
import type { BlogPostWithTags, Category, Tag, BlogMedia, BlogLink } from "@/lib/types/database";

export default function BlogPostEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form data
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  
  // Options
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Media and Links
  const [media, setMedia] = useState<BlogMedia[]>([]);
  const [links, setLinks] = useState<BlogLink[]>([]);
  
  // New media/link forms
  const [newMedia, setNewMedia] = useState({ media_type: 'image' as 'image' | 'video', media_url: '', alt_text: '', caption: '' });
  const [newLink, setNewLink] = useState({ link_text: '', link_url: '', link_type: 'external' as 'external' | 'internal' | 'affiliate' });

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
      fetchTags();
      if (!isNew) {
        fetchPost();
      } else {
        setLoading(false);
      }
    }
  }, [isAdmin, isNew]);

  async function checkAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      router.push('/');
      return;
    }

    setIsAdmin(true);
  }

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

  async function fetchPost() {
    setLoading(true);
    const response = await fetch(`/api/admin/blog/${params.id}`);
    const data = await response.json();
    
    if (data.post) {
      const post = data.post;
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setExcerpt(post.excerpt || '');
      setContent(post.content || '');
      setImageUrl(post.image_url || '');
      setVideoUrl(post.video_url || '');
      setCategoryId(post.category_id || '');
      setMetaTitle(post.meta_title || '');
      setMetaDescription(post.meta_description || '');
      setIsPublished(post.is_published || false);
      setSelectedTags(post.tags?.map((t: Tag) => t.id) || []);
      setMedia(post.media || []);
      setLinks(post.links || []);
    }
    
    setLoading(false);
  }

  function generateSlug(text: string) {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async function handleSave() {
    setSaving(true);
    
    try {
      const postData = {
        title,
        slug: slug || generateSlug(title),
        excerpt,
        content,
        image_url: imageUrl || null,
        video_url: videoUrl || null,
        category_id: categoryId || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        is_published: isPublished,
        tags: selectedTags,
        media: media.map((m, idx) => ({ ...m, display_order: idx })),
        links: links.map((l, idx) => ({ ...l, display_order: idx }))
      };

      const url = isNew ? '/api/admin/blog' : `/api/admin/blog/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  function addMedia() {
    if (newMedia.media_url) {
      setMedia([...media, {
        id: Date.now().toString(),
        post_id: '',
        media_type: newMedia.media_type,
        media_url: newMedia.media_url,
        alt_text: newMedia.alt_text,
        caption: newMedia.caption,
        display_order: media.length,
        created_at: new Date().toISOString()
      }]);
      setNewMedia({ media_type: 'image', media_url: '', alt_text: '', caption: '' });
    }
  }

  function removeMedia(index: number) {
    setMedia(media.filter((_, i) => i !== index));
  }

  function addLink() {
    if (newLink.link_text && newLink.link_url) {
      setLinks([...links, {
        id: Date.now().toString(),
        post_id: '',
        link_text: newLink.link_text,
        link_url: newLink.link_url,
        link_type: newLink.link_type,
        display_order: links.length,
        created_at: new Date().toISOString()
      }]);
      setNewLink({ link_text: '', link_url: '', link_type: 'external' });
    }
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function toggleTag(tagId: string) {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2c2c2c]">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2c2c2c] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            {isNew ? 'Novo Post' : 'Editar Post'}
          </h1>
          <Button
            onClick={() => router.push('/admin/blog')}
            variant="outline"
            className="text-white border-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-[#f0f0f0]">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug) setSlug(generateSlug(e.target.value));
                  }}
                  placeholder="Título do post"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-amigavel-do-post"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resumo</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Breve descrição do post"
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Conteúdo *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Conteúdo do post (HTML permitido)"
                  className="w-full min-h-[300px] px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card className="bg-[#f0f0f0]">
            <CardHeader>
              <CardTitle>Categoria e Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag.id)
                          ? 'bg-[#038ede] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="bg-[#f0f0f0]">
            <CardHeader>
              <CardTitle>Imagens e Vídeos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Imagem Principal (URL)</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vídeo (URL - YouTube, Vimeo, etc)</label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Mídia Adicional</h3>
                <div className="space-y-2 mb-4">
                  <select
                    value={newMedia.media_type}
                    onChange={(e) => setNewMedia({ ...newMedia, media_type: e.target.value as 'image' | 'video' })}
                    className="h-9 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                  </select>
                  <Input
                    value={newMedia.media_url}
                    onChange={(e) => setNewMedia({ ...newMedia, media_url: e.target.value })}
                    placeholder="URL da mídia"
                  />
                  <Input
                    value={newMedia.alt_text}
                    onChange={(e) => setNewMedia({ ...newMedia, alt_text: e.target.value })}
                    placeholder="Texto alternativo (para imagens)"
                  />
                  <Input
                    value={newMedia.caption}
                    onChange={(e) => setNewMedia({ ...newMedia, caption: e.target.value })}
                    placeholder="Legenda (opcional)"
                  />
                  <Button onClick={addMedia} size="sm" className="bg-[#038ede]">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Mídia
                  </Button>
                </div>
                
                {media.length > 0 && (
                  <div className="space-y-2">
                    {media.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                        <span className="flex-1 text-sm">
                          {item.media_type === 'image' ? '🖼️' : '🎥'} {item.media_url}
                        </span>
                        <Button
                          onClick={() => removeMedia(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="bg-[#f0f0f0]">
            <CardHeader>
              <CardTitle>Links Relacionados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  value={newLink.link_text}
                  onChange={(e) => setNewLink({ ...newLink, link_text: e.target.value })}
                  placeholder="Texto do link"
                />
                <Input
                  value={newLink.link_url}
                  onChange={(e) => setNewLink({ ...newLink, link_url: e.target.value })}
                  placeholder="URL do link"
                />
                <select
                  value={newLink.link_type}
                  onChange={(e) => setNewLink({ ...newLink, link_type: e.target.value as any })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background"
                >
                  <option value="external">Link Externo</option>
                  <option value="internal">Link Interno</option>
                  <option value="affiliate">Link Afiliado</option>
                </select>
                <Button onClick={addLink} size="sm" className="bg-[#038ede]">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Link
                </Button>
              </div>
              
              {links.length > 0 && (
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                      <span className="flex-1 text-sm">
                        {link.link_text} → {link.link_url} ({link.link_type})
                      </span>
                      <Button
                        onClick={() => removeLink(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="bg-[#f0f0f0]">
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Título para SEO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Descrição para SEO"
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
            </CardContent>
          </Card>

          {/* Publish */}
          <Card className="bg-[#f0f0f0]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Publicar post</span>
                </label>
                <Button
                  onClick={handleSave}
                  disabled={saving || !title || !content}
                  className="bg-[#038ede] hover:bg-[#0277c7] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Post'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

















