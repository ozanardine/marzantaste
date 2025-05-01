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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          is_admin: boolean
        }
        Insert: {
          id: string
          email: string
          full_name: string
          created_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
          is_admin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          transaction_id: string
          amount: number
          purchased_at: string
          verified: boolean
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id: string
          amount: number
          purchased_at?: string
          verified?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string
          amount?: number
          purchased_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          reward_type: string
          claimed_at: string | null
          expiry_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reward_type: string
          claimed_at?: string | null
          expiry_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reward_type?: string
          claimed_at?: string | null
          expiry_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          promotional_price: number | null
          promotion_end_date: string | null
          image_url: string
          category: string
          active: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          price: number
          promotional_price?: number | null
          promotion_end_date?: string | null
          image_url: string
          category: string
          active?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          promotional_price?: number | null
          promotion_end_date?: string | null
          image_url?: string
          category?: string
          active?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}