"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types/database";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface SubmitGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitGroupModal({ isOpen, onClose }: SubmitGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupLink, setGroupLink] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const linkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  async function fetchCategories() {
    const response = await fetch('/api/categories');
    const data = await response.json();
    setCategories(data.categories || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validações
    if (!groupName) {
      setError("Aguarde o carregamento das informações do grupo.");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError("A descrição do grupo é obrigatória.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Você precisa estar logado para enviar um grupo");
      setLoading(false);
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
        throw new Error('Erro ao enviar grupo');
      }

      alert("Grupo enviado com sucesso! Aguarde a aprovação.");
      onClose();

      // Reset form
      setGroupLink("");
      setCategoryId("");
      setDescription("");
      setGroupName("");
      setImageUrl("");
      setImagePreview(null);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar grupo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Enviar Grupo</DialogTitle>
          <DialogDescription>
            Preencha as informações do seu grupo do Telegram
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Link do Grupo *
            </label>
            <div className="relative">
              <Input
                type="url"
                placeholder="https://t.me/..."
                value={groupLink}
                onChange={handleGroupLinkChange}
                disabled={loading}
                required
              />
              {fetchingImage && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Nome do Grupo (preenchido automaticamente)
                </label>
                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm font-medium text-gray-900">
                  {groupName || "Carregando..."}
                </div>
              </div>

              {imagePreview && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Foto do Grupo (preenchida automaticamente)
                  </label>
                  <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200 bg-white">
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
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              disabled={loading}
              required
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
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Descrição do Grupo *
            </label>
            <textarea
              placeholder="Descreva seu grupo... (obrigatório)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background resize-none"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              A descrição é obrigatória para ajudar outros usuários a entenderem sobre o grupo.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#d97706] hover:bg-[#c26806] text-white"
            disabled={loading || !groupName || !description.trim()}
          >
            {loading ? "Enviando..." : "Enviar Grupo"}
          </Button>
          {(!groupName || !description.trim()) && (
            <p className="text-xs text-gray-500 text-center">
              {!groupName && "Aguarde o carregamento das informações do grupo. "}
              {!description.trim() && "Preencha a descrição do grupo."}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
