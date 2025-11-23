"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Eye, Rocket, Edit, X, ExternalLink } from "lucide-react";

type Group = {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  view_count: number;
  status: string;
  telegram_link: string;
  created_at: string;
  categories: { name: string } | null;
  activePayment: {
    plan_type: string;
    expires_at: string;
  } | null;
};

export default function MeusGruposPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    fetchGroups();
  }

  async function fetchGroups() {
    setLoading(true);
    const response = await fetch('/api/user/groups');
    const data = await response.json();
    setGroups(data.groups || []);
    setLoading(false);
  }

  async function deleteGroup(id: string) {
    if (!confirm('Tem certeza que deseja deletar este grupo?')) return;

    const supabase = createClient();
    await supabase.from('groups').delete().eq('id', id);
    fetchGroups();
  }

  function getTimeRemaining(expiresAt: string) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days.toString().padStart(2, '0')} dias ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <DashboardSidebar activeItem="grupos" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">9 - MEUS GRUPOS</h1>

        {/* Links Informativos */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <a href="#" className="text-[#038ede] hover:underline">Como cadastrar um grupo</a>
          <a href="#" className="text-[#038ede] hover:underline">Como promover o grupo (passo a passo)</a>
          <a href="#" className="text-[#038ede] hover:underline">Como funciona o impulsionamento do grupo</a>
          <a href="#" className="text-[#038ede] hover:underline">Quero outros sites de divulgação</a>
          <a href="#" className="text-[#038ede] hover:underline">Compra canais/grupos do Telegram</a>
        </div>

        {/* Seção de Promoção */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-white">
          <h2 className="text-lg sm:text-xl font-bold mb-2">Divulgue Seus Grupos no Telegram com Facilidade</h2>
          <p className="mb-4 text-sm sm:text-base">
            O <strong>Bot Telegrupos Oficial</strong> é a forma mais prática de divulgar seus grupos e canais no Telegram. 
            Com ele, você pode cadastrar seus grupos de forma rápida e eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <Button
              onClick={() => window.open('https://t.me/telegrupos_bot', '_blank')}
              className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Acessar o Bot no Telegram
            </Button>
          </div>
          <p className="text-xs sm:text-sm mb-2">
            Quer deixar seu grupo no topo da lista do Bot para receber mais visitas?
          </p>
          <Button
            onClick={() => router.push('/dashboard/planos')}
            className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Quero meu Grupo/Canal Premium
          </Button>
        </div>

        {/* Lista de Grupos */}
        {loading ? (
          <p className="text-gray-600">Carregando grupos...</p>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Você ainda não cadastrou nenhum grupo.</p>
            <Link href="/dashboard/cadastrar">
              <Button className="bg-[#038ede] hover:bg-[#0277c7] text-white">
                Cadastrar Primeiro Grupo
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => {
                      const timeRemaining = group.activePayment?.expires_at 
                        ? getTimeRemaining(group.activePayment.expires_at)
                        : null;

                      return (
                        <tr key={group.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {group.image_url ? (
                                  <Image
                                    src={group.image_url}
                                    alt={group.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#038ede] to-[#0277c7]">
                                    <span className="text-white text-sm lg:text-lg font-bold">
                                      {group.title.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{group.title}</div>
                                {group.categories && (
                                  <div className="text-xs text-gray-500">{group.categories.name}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="text-sm text-gray-900">{group.view_count || 0}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <Badge
                              className={
                                group.status === 'approved'
                                  ? 'bg-green-600'
                                  : group.status === 'pending'
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                              }
                            >
                              {group.status === 'approved' ? 'Ativo' : 
                               group.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                            </Badge>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {group.status === 'approved' && (
                                <Link href={`/grupo/${group.slug}`} target="_blank">
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                                    <Eye className="w-4 h-4 mr-1" />
                                    <span className="hidden lg:inline">Visualizar</span>
                                  </Button>
                                </Link>
                              )}
                              <Button
                                onClick={() => router.push(`/dashboard/planos?group=${group.id}`)}
                                size="sm"
                                className={timeRemaining ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-500 hover:bg-green-600 text-white"}
                              >
                                <Rocket className="w-4 h-4 mr-1" />
                                <span className="hidden lg:inline">{timeRemaining ? timeRemaining : 'Impulsionar'}</span>
                                <span className="lg:hidden">{timeRemaining ? 'Ativo' : 'Impul.'}</span>
                              </Button>
                              <Button
                                onClick={() => router.push(`/dashboard/editar/${group.id}`)}
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => deleteGroup(group.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {groups.map((group) => {
                const timeRemaining = group.activePayment?.expires_at 
                  ? getTimeRemaining(group.activePayment.expires_at)
                  : null;

                return (
                  <div key={group.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {group.image_url ? (
                          <Image
                            src={group.image_url}
                            alt={group.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#038ede] to-[#0277c7]">
                            <span className="text-white text-lg font-bold">
                              {group.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{group.title}</h3>
                        {group.categories && (
                          <p className="text-xs text-gray-500 mt-1">{group.categories.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Views:</span>
                        <span className="ml-2 font-medium">{group.view_count || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <Badge
                          className={`ml-2 ${
                            group.status === 'approved'
                              ? 'bg-green-600'
                              : group.status === 'pending'
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                        >
                          {group.status === 'approved' ? 'Ativo' : 
                           group.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.status === 'approved' && (
                        <Link href={`/grupo/${group.slug}`} target="_blank" className="flex-1 min-w-[100px]">
                          <Button size="sm" variant="outline" className="w-full text-blue-600 border-blue-600">
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                        </Link>
                      )}
                      <Button
                        onClick={() => router.push(`/dashboard/planos?group=${group.id}`)}
                        size="sm"
                        className={`flex-1 min-w-[100px] ${
                          timeRemaining ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
                        } text-white`}
                      >
                        <Rocket className="w-4 h-4 mr-1" />
                        {timeRemaining ? 'Ativo' : 'Impulsionar'}
                      </Button>
                      <Button
                        onClick={() => router.push(`/dashboard/editar/${group.id}`)}
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteGroup(group.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

