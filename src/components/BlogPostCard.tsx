"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye } from "lucide-react";
import type { BlogPostWithTags } from "@/lib/types/database";

interface BlogPostCardProps {
  post: BlogPostWithTags;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer h-full">
        <CardContent className="p-0">
          <div className="relative">
            {/* Image */}
            <div className="relative w-full h-48 bg-gray-200">
              {post.image_url ? (
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#038ede] to-[#0277c7]">
                  <span className="text-white text-4xl font-bold">
                    {post.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Meta info */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{post.view_count || 0} views</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 min-h-[48px]">
                {post.title}
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Read more */}
              <div className="text-[#038ede] text-sm font-medium hover:underline">
                LER MAIS...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
