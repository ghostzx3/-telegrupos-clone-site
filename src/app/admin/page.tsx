"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import Image from "next/image";
import { Loader2, Edit2, Save, X, Upload } from "lucide-react";

type Group = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  telegram_link: string;
  status: string;
  created_at: string;
  categories: { name: string } | null;
  profiles: { email: string; full_name: string | null } | null;
};

export default function AdminDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchGroups();
  }, [filter]);

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

  async function fetchGroups() {
    setLoading(true);
    const response = await fetch(`/api/admin/groups?status=${filter}`);
    const data = await response.json();
    setGroups(data.groups || []);
    setLoading(false);
  }

  async function approveGroup(id: string) {
    const response = await fetch(`/api/admin/groups/${id}/approve`, {
      method: 'POST',
    });

    if (response.ok) {
      fetchGroups();
    }
  }

  async function rejectGroup(id: string) {
    const supabase = createClient();
    await supabase
      .from('groups')
      .update({ status: 'rejected' })
      .eq('id', id);

    fetchGroups();
  }

  async function deleteGroup(id: string) {
    if (!confirm('Tem certeza que deseja deletar este grupo?')) return;

    const supabase = createClient();
    await supabase.from('groups').delete().eq('id', id);
    fetchGroups();
  }

  function startEditing(group: Group) {
    setEditingGroup(group.id);
    setEditTitle(group.title);
    setEditImageUrl(group.image_url || "");
  }

  function cancelEditing() {
    setEditingGroup(null);
    setEditTitle("");
    setEditImageUrl("");
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, groupId: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WEBP.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB.');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      setEditImageUrl(data.url);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload';
      alert(errorMessage);
    } finally {
      setUploadingImage(false);
      // Limpar input
      e.target.value = '';
    }
  }

  async function saveGroupChanges(groupId: string) {
    if (!editTitle.trim()) {
      alert('O nome do grupo é obrigatório.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          image_url: editImageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar alterações');
      }

      // Atualizar lista local
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { ...g, title: editTitle.trim(), image_url: editImageUrl || null }
          : g
      ));

      cancelEditing();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar alterações';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-white">Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#2c2c2c] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <Link href="/admin/blog">
            <Button className="bg-[#038ede] hover:bg-[#0277c7] text-white">
              Gerenciar Blog
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-[#1796a6]' : ''}
          >
            Todos ({groups.length})
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'default' : 'outline'}
            className={filter === 'pending' ? 'bg-[#d97706]' : ''}
          >
            Pendentes
          </Button>
          <Button
            onClick={() => setFilter('approved')}
            variant={filter === 'approved' ? 'default' : 'outline'}
            className={filter === 'approved' ? 'bg-green-600' : ''}
          >
            Aprovados
          </Button>
          <Button
            onClick={() => setFilter('rejected')}
            variant={filter === 'rejected' ? 'default' : 'outline'}
            className={filter === 'rejected' ? 'bg-red-600' : ''}
          >
            Rejeitados
          </Button>
        </div>

        {/* Groups List */}
        {loading ? (
          <p className="text-white">Carregando...</p>
        ) : groups.length === 0 ? (
          <p className="text-white">Nenhum grupo encontrado.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.id} className="bg-[#f0f0f0]">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    {group.image_url && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={group.image_url}
                          alt={group.title}
                          fill
                          className="object-cover rounded"
                          unoptimized
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {editingGroup === group.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                  Nome do Grupo *
                                </label>
                                <Input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full"
                                  disabled={saving}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                  Foto do Grupo
                                </label>
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={(e) => handleFileSelect(e, group.id)}
                                    disabled={uploadingImage || saving}
                                    className="hidden"
                                    id={`file-input-${group.id}`}
                                  />
                                  <div className="flex gap-2 items-center">
                                    <Button
                                      type="button"
                                      onClick={() => document.getElementById(`file-input-${group.id}`)?.click()}
                                      disabled={uploadingImage || saving}
                                      variant="outline"
                                      size="sm"
                                    >
                                      {uploadingImage ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Enviando...
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="w-4 h-4 mr-2" />
                                          Selecionar Imagem
                                        </>
                                      )}
                                    </Button>
                                    {editImageUrl && (
                                      <div className="relative w-20 h-20 rounded border border-gray-200 overflow-hidden bg-gray-100">
                                        <Image
                                          src={editImageUrl}
                                          alt="Preview"
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <Input
                                    type="url"
                                    value={editImageUrl}
                                    onChange={(e) => setEditImageUrl(e.target.value)}
                                    placeholder="Ou cole uma URL de imagem"
                                    className="w-full text-sm"
                                    disabled={saving}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => saveGroupChanges(group.id)}
                                  disabled={saving || !editTitle.trim()}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {saving ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button
                                  onClick={cancelEditing}
                                  disabled={saving}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-xl font-bold text-gray-900">{group.title}</h3>
                              <p className="text-sm text-gray-600">
                                Categoria: {group.categories?.name || 'N/A'}
                              </p>
                              {group.profiles && (
                                <p className="text-sm text-gray-600">
                                  Enviado por: {group.profiles.full_name || group.profiles.email}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {format(new Date(group.created_at), 'dd/MM/yyyy HH:mm')}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={
                            group.status === 'approved'
                              ? 'bg-green-600'
                              : group.status === 'pending'
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }
                        >
                          {group.status === 'approved' ? 'Aprovado' :
                           group.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                        </Badge>
                      </div>

                      {group.description && (
                        <p className="text-gray-700 mb-3">{group.description}</p>
                      )}

                      <a
                        href={group.telegram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1796a6] hover:underline text-sm"
                      >
                        {group.telegram_link}
                      </a>

                      {/* Actions */}
                      {editingGroup !== group.id && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() => startEditing(group)}
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          {group.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => approveGroup(group.id)}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                Aprovar
                              </Button>
                              <Button
                                onClick={() => rejectGroup(group.id)}
                                className="bg-red-600 hover:bg-red-700"
                                size="sm"
                              >
                                Rejeitar
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => deleteGroup(group.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            Deletar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
