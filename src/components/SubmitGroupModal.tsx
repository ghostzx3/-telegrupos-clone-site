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
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types/database";

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

  useEffect(() => {
    fetchCategories();
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
      setGroupName("");
      setGroupLink("");
      setCategoryId("");
      setDescription("");
      setImageUrl("");
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
              Nome do Grupo
            </label>
            <Input
              type="text"
              placeholder="Nome do seu grupo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Link do Grupo
            </label>
            <Input
              type="url"
              placeholder="https://t.me/..."
              value={groupLink}
              onChange={(e) => setGroupLink(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              URL da Imagem
            </label>
            <Input
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
            />
          </div>

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
              Descrição (opcional)
            </label>
            <textarea
              placeholder="Descreva seu grupo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background resize-none"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#d97706] hover:bg-[#c26806] text-white"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Grupo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
