"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Save, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Category } from "@/lib/types/database";

export default function CadastrarGrupoPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [groupName, setGroupName] = useState("");
  const [groupLink, setGroupLink] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const linkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    setIsAuthenticated(true);
    fetchCategories();
  }

  async function fetchCategories() {
    const response = await fetch('/api/categories');
    const data = await response.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  // Função para buscar foto do Telegram automaticamente
  async function fetchTelegramImage(link: string) {
    // Validar se é um link do Telegram
    // Suporta links públicos (username) e privados (+XXXXXXXXXXXX)
    const telegramLinkRegex = /(?:https?:\/\/)?(?:t\.me\/|@)(\+?[a-zA-Z0-9_-]+)/;
    if (!telegramLinkRegex.test(link)) {
      return;
    }

    setFetchingImage(true);
    try {
      console.log('[Telegram] Buscando informações para:', link);
      const response = await fetch('/api/telegram/fetch-group-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      });

      console.log('[Telegram] Resposta recebida:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('[Telegram] Dados recebidos:', data);
        
        if (data.success) {
          // Sempre preencher a imagem se disponível
          if (data.imageUrl) {
            console.log('[Telegram] Preenchendo imagem:', data.imageUrl);
            setImageUrl(data.imageUrl);
            setImagePreview(data.imageUrl);
          }
          
          // Sempre preencher o nome do grupo com o título do Telegram
          // Preencher mesmo se o campo já tiver algo (substituir pelo nome oficial)
          if (data.title) {
            console.log('[Telegram] Preenchendo nome:', data.title);
            setGroupName(data.title);
          }
        } else {
          console.warn('[Telegram] Resposta não teve sucesso:', data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Telegram] Erro na resposta:', response.status, errorData);
      }
    } catch (err) {
      console.error('[Telegram] Erro ao buscar informações:', err);
    } finally {
      setFetchingImage(false);
    }
  }

  // Detectar quando o link do Telegram é inserido
  function handleGroupLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const link = e.target.value;
    setGroupLink(link);

    // Se o link foi removido, limpar dados do grupo
    if (!link.trim()) {
      setGroupName("");
      setImageUrl("");
      setImagePreview(null);
      if (linkTimeoutRef.current) {
        clearTimeout(linkTimeoutRef.current);
      }
      return;
    }

    // Limpar timeout anterior
    if (linkTimeoutRef.current) {
      clearTimeout(linkTimeoutRef.current);
    }

    // Aguardar 1 segundo após parar de digitar antes de buscar
    linkTimeoutRef.current = setTimeout(() => {
      if (link.trim()) {
        fetchTelegramImage(link);
      }
    }, 1000);
  }

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (linkTimeoutRef.current) {
        clearTimeout(linkTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validações
    if (!groupName) {
      setError("Aguarde o carregamento das informações do grupo.");
      setSaving(false);
      return;
    }

    if (!description.trim()) {
      setError("A descrição do grupo é obrigatória.");
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Você precisa estar logado para enviar um grupo");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: groupName,
          telegram_link: groupLink,
          category_id: categoryId,
          description: description || null,
          image_url: imageUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar grupo');
      }

      alert("Grupo enviado com sucesso! Aguarde a aprovação.");
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Erro ao enviar grupo");
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <DashboardSidebar activeItem="cadastrar" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Cadastrar Grupo</h1>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Informações do Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Link do Grupo *
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    value={groupLink}
                    onChange={handleGroupLinkChange}
                    placeholder="https://t.me/..."
                    required
                    disabled={saving}
                    className="h-12 sm:h-11 text-base"
                  />
                  {fetchingImage && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {fetchingImage && (
                  <p className="text-xs text-gray-500 mt-1">
                    Buscando informações do grupo...
                  </p>
                )}
                {!fetchingImage && groupLink && !groupName && (
                  <p className="text-xs text-amber-600 mt-1">
                    Aguarde enquanto buscamos as informações do grupo...
                  </p>
                )}
              </div>

              {/* Exibição do Nome e Foto do Grupo (somente leitura) */}
              {(groupName || imagePreview) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5 space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-2">
                      Nome do Grupo (preenchido automaticamente)
                    </label>
                    <div className="bg-white border border-gray-200 rounded-md px-4 py-3 text-sm sm:text-base font-medium text-gray-900">
                      {groupName || "Carregando..."}
                    </div>
                  </div>

                  {imagePreview && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-2">
                        Foto do Grupo (preenchida automaticamente)
                      </label>
                      <div className="relative w-full h-48 sm:h-56 rounded-md overflow-hidden border border-gray-200 bg-white">
                        <Image
                          src={imagePreview}
                          alt={groupName || "Foto do grupo"}
                          fill
                          className="object-cover"
                          onError={() => setImagePreview(null)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-12 sm:h-11 px-4 text-base rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-[#038ede]"
                  required
                  disabled={saving}
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
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Descrição do Grupo *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu grupo... (obrigatório)"
                  className="w-full min-h-[120px] sm:min-h-[100px] px-4 py-3 text-base rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-[#038ede]"
                  disabled={saving}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  A descrição é obrigatória para ajudar outros usuários a entenderem sobre o grupo.
                </p>
              </div>

              <Button
                type="submit"
                disabled={saving || !groupName || !description.trim()}
                className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-base font-medium h-12 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Enviando..." : "Enviar Grupo"}
              </Button>
              {(!groupName || !description.trim()) && (
                <p className="text-xs text-gray-500 text-center">
                  {!groupName && "Aguarde o carregamento das informações do grupo. "}
                  {!description.trim() && "Preencha a descrição do grupo."}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}



