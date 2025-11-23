export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface Group {
  id: string;
  title: string;
  slug: string;
  telegram_link: string;
  category_id: string;
  description?: string;
  description_full?: string;
  rules?: string;
  image_url?: string;
  is_premium: boolean;
  is_featured: boolean;
  view_count: number;
  click_count: number;
  meta_title?: string;
  meta_description?: string;
  submitted_by: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GroupWithCategory extends Group {
  categories: Category | null;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface GroupTag {
  id: string;
  group_id: string;
  tag_id: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image_url?: string;
  video_url?: string;
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  author_id?: string;
  view_count: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithTags extends BlogPost {
  tags?: Tag[];
  category?: Category | null;
  author?: {
    full_name: string;
  };
  media?: BlogMedia[];
  links?: BlogLink[];
}

export interface BlogMedia {
  id: string;
  post_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  alt_text?: string;
  caption?: string;
  display_order: number;
  created_at: string;
}

export interface BlogLink {
  id: string;
  post_id: string;
  link_text: string;
  link_url: string;
  link_type: 'external' | 'internal' | 'affiliate';
  display_order: number;
  created_at: string;
}

export interface PostTag {
  id: string;
  post_id: string;
  tag_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  is_admin: boolean;
  created_at: string;
}