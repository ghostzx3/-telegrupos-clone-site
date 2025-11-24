"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

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
                  Nome do Grupo *
                </label>
                <Input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nome do seu grupo"
                  required
                  disabled={saving}
                  className="h-12 sm:h-11 text-base"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Link do Grupo *
                </label>
                <Input
                  type="url"
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  placeholder="https://t.me/..."
                  required
                  disabled={saving}
                  className="h-12 sm:h-11 text-base"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  URL da Imagem
                </label>
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  disabled={saving}
                  className="h-12 sm:h-11 text-base"
                />
              </div>

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
                  Descrição (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu grupo..."
                  className="w-full min-h-[120px] sm:min-h-[100px] px-4 py-3 text-base rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-[#038ede]"
                  disabled={saving}
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-base font-medium h-12 min-h-[44px]"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Enviando..." : "Enviar Grupo"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}



