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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      food_products: {
        Row: {
          agricultural_practice:
            | Database["public"]["Enums"]["agricultural_practice"]
            | null
          barcode: string | null
          brand: string | null
          category: string
          created_at: string
          id: string
          image_url: string | null
          impact_score: number
          ingredient_co2e_pct: number
          land_use_m2_per_kg: number | null
          name: string
          origin_country: string | null
          packaging_co2e_pct: number
          packaging_material: string | null
          packaging_recyclable: boolean | null
          total_co2e_per_kg: number
          transport_co2e_pct: number
          transport_distance_km: number | null
          transport_method:
            | Database["public"]["Enums"]["transport_method"]
            | null
          updated_at: string
          water_use_liters_per_kg: number | null
        }
        Insert: {
          agricultural_practice?:
            | Database["public"]["Enums"]["agricultural_practice"]
            | null
          barcode?: string | null
          brand?: string | null
          category: string
          created_at?: string
          id?: string
          image_url?: string | null
          impact_score: number
          ingredient_co2e_pct?: number
          land_use_m2_per_kg?: number | null
          name: string
          origin_country?: string | null
          packaging_co2e_pct?: number
          packaging_material?: string | null
          packaging_recyclable?: boolean | null
          total_co2e_per_kg: number
          transport_co2e_pct?: number
          transport_distance_km?: number | null
          transport_method?:
            | Database["public"]["Enums"]["transport_method"]
            | null
          updated_at?: string
          water_use_liters_per_kg?: number | null
        }
        Update: {
          agricultural_practice?:
            | Database["public"]["Enums"]["agricultural_practice"]
            | null
          barcode?: string | null
          brand?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          impact_score?: number
          ingredient_co2e_pct?: number
          land_use_m2_per_kg?: number | null
          name?: string
          origin_country?: string | null
          packaging_co2e_pct?: number
          packaging_material?: string | null
          packaging_recyclable?: boolean | null
          total_co2e_per_kg?: number
          transport_co2e_pct?: number
          transport_distance_km?: number | null
          transport_method?:
            | Database["public"]["Enums"]["transport_method"]
            | null
          updated_at?: string
          water_use_liters_per_kg?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agricultural_practice:
        | "conventional"
        | "organic"
        | "regenerative"
        | "hydroponic"
        | "free_range"
        | "factory_farmed"
      transport_method: "air" | "sea" | "rail" | "road" | "local"
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
      agricultural_practice: [
        "conventional",
        "organic",
        "regenerative",
        "hydroponic",
        "free_range",
        "factory_farmed",
      ],
      transport_method: ["air", "sea", "rail", "road", "local"],
    },
  },
} as const
