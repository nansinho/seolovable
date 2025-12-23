export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_at: string
          blocked_by: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string
          blocked_by: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string
          blocked_by?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bot_activity: {
        Row: {
          bot_name: string
          bot_type: string
          crawled_at: string
          id: string
          pages_crawled: number
          site_id: string | null
          user_id: string
        }
        Insert: {
          bot_name: string
          bot_type: string
          crawled_at?: string
          id?: string
          pages_crawled?: number
          site_id?: string | null
          user_id: string
        }
        Update: {
          bot_name?: string
          bot_type?: string
          crawled_at?: string
          id?: string
          pages_crawled?: number
          site_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_activity_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          allowed_domains: string[]
          created_at: string | null
          email: string | null
          id: string
          name: string
          plan: string
          prerender_token: string
          status: string
          updated_at: string | null
        }
        Insert: {
          allowed_domains?: string[]
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          plan?: string
          prerender_token?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          allowed_domains?: string[]
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          plan?: string
          prerender_token?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          ai_crawls: number
          created_at: string
          date: string
          google_crawls: number
          id: string
          total_bots: number
          total_pages_rendered: number
          user_id: string
        }
        Insert: {
          ai_crawls?: number
          created_at?: string
          date?: string
          google_crawls?: number
          id?: string
          total_bots?: number
          total_pages_rendered?: number
          user_id: string
        }
        Update: {
          ai_crawls?: number
          created_at?: string
          date?: string
          google_crawls?: number
          id?: string
          total_bots?: number
          total_pages_rendered?: number
          user_id?: string
        }
        Relationships: []
      }
      landing_tests: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string
          test_result: Json | null
          url: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address: string
          test_result?: Json | null
          url: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string
          test_result?: Json | null
          url?: string
        }
        Relationships: []
      }
      prerender_logs: {
        Row: {
          bot_name: string | null
          bot_type: string | null
          cached: boolean
          client_id: string | null
          created_at: string | null
          domain: string
          id: number
          render_time_ms: number | null
          site_id: string | null
          source: string | null
          token: string
          url: string
          user_agent: string
        }
        Insert: {
          bot_name?: string | null
          bot_type?: string | null
          cached?: boolean
          client_id?: string | null
          created_at?: string | null
          domain: string
          id?: number
          render_time_ms?: number | null
          site_id?: string | null
          source?: string | null
          token: string
          url: string
          user_agent: string
        }
        Update: {
          bot_name?: string | null
          bot_type?: string | null
          cached?: boolean
          client_id?: string | null
          created_at?: string | null
          domain?: string
          id?: number
          render_time_ms?: number | null
          site_id?: string | null
          source?: string | null
          token?: string
          url?: string
          user_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "prerender_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prerender_logs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          cname_target: string | null
          coolify_service_id: string | null
          created_at: string
          dns_verified: boolean | null
          dns_verified_at: string | null
          id: string
          last_crawl: string | null
          name: string
          pages_rendered: number
          prerender_token: string
          status: string
          txt_record_token: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          cname_target?: string | null
          coolify_service_id?: string | null
          created_at?: string
          dns_verified?: boolean | null
          dns_verified_at?: string | null
          id?: string
          last_crawl?: string | null
          name: string
          pages_rendered?: number
          prerender_token?: string
          status?: string
          txt_record_token?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          cname_target?: string | null
          coolify_service_id?: string | null
          created_at?: string
          dns_verified?: boolean | null
          dns_verified_at?: string | null
          id?: string
          last_crawl?: string | null
          name?: string
          pages_rendered?: number
          prerender_token?: string
          status?: string
          txt_record_token?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string
          id: string
          is_auto: boolean
          key: string
          lang: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_auto?: boolean
          key: string
          lang: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_auto?: boolean
          key?: string
          lang?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          plan_type: string
          sites_limit: number
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          plan_type?: string
          sites_limit?: number
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          plan_type?: string
          sites_limit?: number
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
