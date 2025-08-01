export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      business_items: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          price: number | null
          unit: string | null
          category: string | null
          sku: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          price?: number | null
          unit?: string | null
          category?: string | null
          sku?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          price?: number | null
          unit?: string | null
          category?: string | null
          sku?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_items_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      businesses: {
        Row: {
          address: string | null
          business_category: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          region: string | null
          registration_number: string | null
          social_media_links: Json | null
          tax_id: string | null
          town_city: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          region?: string | null
          registration_number?: string | null
          social_media_links?: Json | null
          tax_id?: string | null
          town_city?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          region?: string | null
          registration_number?: string | null
          social_media_links?: Json | null
          tax_id?: string | null
          town_city?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      document_shares: {
        Row: {
          access_count: number | null
          created_at: string
          document_id: string
          expires_at: string | null
          id: string
          recipient_info: Json | null
          share_type: string
          share_url: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string
          document_id: string
          expires_at?: string | null
          id?: string
          recipient_info?: Json | null
          share_type: string
          share_url: string
        }
        Update: {
          access_count?: number | null
          created_at?: string
          document_id?: string
          expires_at?: string | null
          id?: string
          recipient_info?: Json | null
          share_type?: string
          share_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          business_id: string
          content: Json
          created_at: string
          id: string
          number: string
          pdf_url: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          template_id: string | null
          title: string | null
          total_amount: number | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
        }
        Insert: {
          business_id: string
          content: Json
          created_at?: string
          id?: string
          number: string
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          template_id?: string | null
          title?: string | null
          total_amount?: number | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          content?: Json
          created_at?: string
          id?: string
          number?: string
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          template_id?: string | null
          title?: string | null
          total_amount?: number | null
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_passes: {
        Row: {
          created_at: string
          document_id: string | null
          event_id: string
          holder_email: string | null
          holder_name: string
          holder_phone: string | null
          id: string
          metadata: Json | null
          pass_code: string
          qr_code_url: string | null
          status: Database["public"]["Enums"]["pass_status"] | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          verification_url: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          event_id: string
          holder_email?: string | null
          holder_name: string
          holder_phone?: string | null
          id?: string
          metadata?: Json | null
          pass_code: string
          qr_code_url?: string | null
          status?: Database["public"]["Enums"]["pass_status"] | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          verification_url?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          event_id?: string
          holder_email?: string | null
          holder_name?: string
          holder_phone?: string | null
          id?: string
          metadata?: Json | null
          pass_code?: string
          qr_code_url?: string | null
          status?: Database["public"]["Enums"]["pass_status"] | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_passes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_passes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          end_date: string | null
          entry_fee: number | null
          gps_address: string | null
          id: string
          is_active: boolean | null
          max_capacity: number | null
          name: string
          region: string | null
          start_date: string | null
          town_city: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          gps_address?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          name: string
          region?: string | null
          start_date?: string | null
          town_city?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          gps_address?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          name?: string
          region?: string | null
          start_date?: string | null
          town_city?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      pass_scans: {
        Row: {
          id: string
          location: string | null
          metadata: Json | null
          pass_id: string
          scanned_at: string
          scanner_info: string | null
        }
        Insert: {
          id?: string
          location?: string | null
          metadata?: Json | null
          pass_id: string
          scanned_at?: string
          scanner_info?: string | null
        }
        Update: {
          id?: string
          location?: string | null
          metadata?: Json | null
          pass_id?: string
          scanned_at?: string
          scanner_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pass_scans_pass_id_fkey"
            columns: ["pass_id"]
            isOneToOne: false
            referencedRelation: "entry_passes"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          business_id: string
          content: Json
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
        }
        Insert: {
          business_id: string
          content: Json
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          content?: Json
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
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
      document_status: "draft" | "published" | "archived"
      document_type: "invoice" | "receipt" | "entry_pass"
      pass_status: "active" | "used" | "expired" | "cancelled"
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
      document_status: ["draft", "published", "archived"],
      document_type: ["invoice", "receipt", "entry_pass"],
      pass_status: ["active", "used", "expired", "cancelled"],
    },
  },
} as const
