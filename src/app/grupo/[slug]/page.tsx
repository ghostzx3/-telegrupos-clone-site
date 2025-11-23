"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, AlertTriangle, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { GroupWithCategory } from "@/lib/types/database";

// Lazy load modals - só carregam quando necessário
const LoginModal = dynamic(() => import("@/components/LoginModal").then(mod => ({ default: mod.LoginModal })), {
  ssr: false,
});

const SubmitGroupModal = dynamic(() => import("@/components/SubmitGroupModal").then(mod => ({ default: mod.SubmitGroupModal })), {
  ssr: false,
});

// Lazy load RecommendedGroups - só carrega quando visível
const RecommendedGroups = dynamic(() => import("@/components/RecommendedGroups").then(mod => ({ default: mod.RecommendedGroups })), {
  ssr: false,
});

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<GroupWithCategory | null>(null);
  const [recommended, setRecommended] = useState<GroupWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitGroupModalOpen, setIsSubmitGroupModalOpen] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchGroup(params.slug as string);
    }
  }, [params.slug]);

  async function fetchGroup(slug: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/groups/${slug}`);
      const data = await response.json();

      if (data.error) {
        router.push('/');
        return;
      }

      setGroup(data.group);
      setRecommended(data.recommended || []);
    } catch (error) {
      console.error('Error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnterGroup() {
    if (!group) return;

    // Track click
    await fetch(`/api/groups/${group.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    });

    // Redirect to Telegram
    window.open(group.telegram_link, '_blank');
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const parseRules = (rulesText?: string) => {
    if (!rulesText) return [];
    return rulesText.split('\n').filter(rule => rule.trim());
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

  if (!group) {
    return null;
  }

  const rules = parseRules(group.rules);

  return (
    <div className="min-h-screen flex flex-col bg-[#2c2c2c]">
      <Header
        onSearch={() => {}}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSubmitGroupClick={() => setIsSubmitGroupModalOpen(true)}
      />

      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Group Content */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 sm:mb-8">
            {/* Group Image/Icon */}
            <div className="flex justify-center pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-[#038ede] to-[#0277c7] flex items-center justify-center">
                {group.image_url ? (
                  <Image
                    src={group.image_url}
                    alt={group.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="160px"
                  />
                ) : (
                  <span className="text-white text-5xl font-bold">
                    {group.title.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 pt-2 sm:pt-3 md:pt-4">
              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
                {group.title}
                {group.is_premium && (
                  <Badge className="ml-2 bg-green-600 text-white text-xs sm:text-sm">Plus</Badge>
                )}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(group.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{group.view_count || 0} VIEWS</span>
                </div>
                <Button
                  variant="link"
                  className="text-[#038ede] hover:underline p-0 h-auto text-sm"
                  onClick={() => alert('Função de denúncia em desenvolvimento')}
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  DENUNCIAR
                </Button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: group.description_full || group.description || 'Grupo sem descrição.'
                  }}
                />
              </div>

              {/* Enter Button */}
              <div className="mb-6">
                <Button
                  onClick={handleEnterGroup}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  ENTRAR NO GRUPO
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-600">
                <p className="mb-2">
                  Ao acessar o grupo de telegram <strong>{group.title}</strong>, esteja ciente que você deve estar de acordo com todas as regras do grupo. É importante dizer também que este é um grupo independente, sem nenhuma relação com o nosso site e o único responsável por ele é o administrador do grupo. Caso encontre algo inadequado, clique em <strong>DENUNCIAR</strong> para denunciar esse grupo.
                </p>
              </div>

              {/* Rules */}
              {rules.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <h3 className="font-bold text-gray-900">Regras do grupo:</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Veja as regras desse grupo de telegram:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    {rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Category & Tags */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Category Badge */}
                  <Badge
                    className="bg-[#038ede] text-white cursor-pointer hover:bg-[#0277c7]"
                    onClick={() => router.push(`/?category=${group.categories?.slug}`)}
                  >
                    {group.categories?.name || 'Divulgação'}
                  </Badge>

                  {/* Tag Badges */}
                  {group.tags && group.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-gray-300"
                      onClick={() => router.push(`/?tag=${tag.slug}`)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                  <p className="text-gray-700 mb-2">
                    <Link href="/submit" className="text-[#038ede] hover:underline font-medium">
                      Envie seu grupo do telegram
                    </Link>{' '}
                    também e comece a receber novos integrantes. O grupo{' '}
                    <strong>{group.title}</strong> já teve{' '}
                    <strong>{group.view_count || 0} acessos</strong>. No Telegrupos você encontra uma variedade de{' '}
                    <Link href="/" className="text-[#038ede] hover:underline">
                      grupos telegram
                    </Link>{' '}
                    organizados em diversas categorias.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Recommended Groups */}
          <RecommendedGroups groups={recommended} />

          {/* Blog CTA */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-900">
              Visite nosso <Link href="/blog" className="font-bold hover:underline">Blog</Link> para encontrar artigos com dicas e perguntas frequentes relacionadas ao Telegram e sociais.
            </p>
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
