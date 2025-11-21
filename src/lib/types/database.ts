export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color?: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          icon?: string | null
          created_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          title: string
          description: string | null
          category_id: string | null
          image_url: string | null
          telegram_link: string
          member_count: number
          view_count: number
          is_premium: boolean
          is_featured: boolean
          status: 'pending' | 'approved' | 'rejected'
          submitted_by: string | null
          approved_by: string | null
          approved_at: string | null
          premium_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category_id?: string | null
          image_url?: string | null
          telegram_link: string
          member_count?: number
          view_count?: number
          is_premium?: boolean
          is_featured?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          submitted_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category_id?: string | null
          image_url?: string | null
          telegram_link?: string
          member_count?: number
          view_count?: number
          is_premium?: boolean
          is_featured?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          submitted_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string | null
          group_id: string | null
          payment_provider: string
          external_id: string | null
          pix_code: string | null
          pix_qrcode: string | null
          amount: number
          currency: string
          status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded'
          plan_type: 'premium' | 'featured' | 'boost'
          duration_days: number
          expires_at: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          group_id?: string | null
          payment_provider?: string
          external_id?: string | null
          pix_code?: string | null
          pix_qrcode?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded'
          plan_type: 'premium' | 'featured' | 'boost'
          duration_days: number
          expires_at?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          group_id?: string | null
          payment_provider?: string
          external_id?: string | null
          pix_code?: string | null
          pix_qrcode?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded'
          plan_type?: 'premium' | 'featured' | 'boost'
          duration_days?: number
          expires_at?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          group_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']

export type GroupWithCategory = Group & {
  categories: Category | null
}
