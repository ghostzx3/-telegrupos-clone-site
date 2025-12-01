"use client";

import { GroupCard } from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { GroupWithCategory } from "@/lib/types/database";

interface RecommendedGroupsProps {
  groups: GroupWithCategory[];
}

export function RecommendedGroups({ groups }: RecommendedGroupsProps) {
  const router = useRouter();

  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-[#038ede] mb-2">Recomendados</h2>
      <p className="text-gray-600 mb-6">
        Confira grupos e canais relacionados para participar!
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            title={group.title}
            category={group.categories?.slug || ''}
            image={group.image_url || ''}
            isPremium={group.is_premium}
            link={`/grupo/${group.slug}`}
          />
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={() => router.push('/')}
          className="bg-[#038ede] hover:bg-[#0277c7] text-white"
        >
          + Mais grupos
        </Button>
      </div>
    </div>
  );
}
