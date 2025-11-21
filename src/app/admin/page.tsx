"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";

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

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-white">Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#2c2c2c] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Painel Administrativo</h1>

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
                        <div>
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
                      <div className="flex gap-2 mt-4">
                        {group.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => approveGroup(group.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Aprovar
                            </Button>
                            <Button
                              onClick={() => rejectGroup(group.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Rejeitar
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => deleteGroup(group.id)}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
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
      </div>
    </div>
  );
}
