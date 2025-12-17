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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          description: string | null
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: number
          bathrooms: number
          bedrooms: number
          created_at: string
          currency: string
          description: string | null
          features: string[] | null
          id: string
          image: string | null
          is_rented: boolean
          location: string
          operation: string
          price: number
          reference: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area: number
          bathrooms: number
          bedrooms: number
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          is_rented?: boolean
          location: string
          operation: string
          price: number
          reference: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          is_rented?: boolean
          location?: string
          operation?: string
          price?: number
          reference?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_floor_plans: {
        Row: {
          created_at: string
          floor_plan_data: Json | null
          id: string
          property_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          floor_plan_data?: Json | null
          id?: string
          property_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          floor_plan_data?: Json | null
          id?: string
          property_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      room_assignments: {
        Row: {
          created_at: string
          end_date: string | null
          floor_plan_id: string
          id: string
          rent_amount: number | null
          room_id: string
          start_date: string | null
          tenant_email: string | null
          tenant_name: string | null
          tenant_phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          floor_plan_id: string
          id?: string
          rent_amount?: number | null
          room_id: string
          start_date?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          floor_plan_id?: string
          id?: string
          rent_amount?: number | null
          room_id?: string
          start_date?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_assignments_floor_plan_id_fkey"
            columns: ["floor_plan_id"]
            isOneToOne: false
            referencedRelation: "property_floor_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_property_reference: { Args: never; Returns: string }
      get_complete_profile_info: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          company_name: string
          email: string
          full_name: string
          id: string
          phone: string
          user_type: string
        }[]
      }
      get_property_owner_contact: {
        Args: { property_id: string }
        Returns: {
          company_name: string
          email: string
          full_name: string
          id: string
          phone: string
          user_type: string
        }[]
      }
      get_public_profile_info: {
        Args: { profile_user_id: string }
        Returns: {
          company_name: string
          full_name: string
          id: string
          user_type: string
        }[]
      }
      update_profile_email: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
