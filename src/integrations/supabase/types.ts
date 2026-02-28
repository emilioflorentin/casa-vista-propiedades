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
      budgets: {
        Row: {
          budget_number: string
          client_address: string | null
          client_email: string | null
          client_name: string | null
          client_nif: string | null
          client_phone: string | null
          created_at: string
          execution_days: string | null
          id: string
          items: Json
          notes: string | null
          payment_terms: string | null
          status: string
          title: string | null
          updated_at: string
          user_id: string
          validity_days: number | null
        }
        Insert: {
          budget_number: string
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_nif?: string | null
          client_phone?: string | null
          created_at?: string
          execution_days?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_terms?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
          validity_days?: number | null
        }
        Update: {
          budget_number?: string
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_nif?: string | null
          client_phone?: string | null
          created_at?: string
          execution_days?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_terms?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          validity_days?: number | null
        }
        Relationships: []
      }
      incident_costs: {
        Row: {
          created_at: string
          id: string
          incident_id: string
          materials_cost: number | null
          notes: string | null
          receipts: string[] | null
          repair_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          incident_id: string
          materials_cost?: number | null
          notes?: string | null
          receipts?: string[] | null
          repair_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          incident_id?: string
          materials_cost?: number | null
          notes?: string | null
          receipts?: string[] | null
          repair_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_costs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: true
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_history: {
        Row: {
          category: string
          charge_amount: number | null
          created_at: string
          description: string | null
          id: string
          incident_created_at: string | null
          incident_id: string
          materials_cost: number | null
          profit: number | null
          property_location: string | null
          property_title: string | null
          receipts: string[] | null
          repair_cost: number | null
          resolved_at: string | null
          tenant_name: string | null
          tenant_phone: string | null
          title: string
          total_cost: number | null
        }
        Insert: {
          category?: string
          charge_amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          incident_created_at?: string | null
          incident_id: string
          materials_cost?: number | null
          profit?: number | null
          property_location?: string | null
          property_title?: string | null
          receipts?: string[] | null
          repair_cost?: number | null
          resolved_at?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          title: string
          total_cost?: number | null
        }
        Update: {
          category?: string
          charge_amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          incident_created_at?: string | null
          incident_id?: string
          materials_cost?: number | null
          profit?: number | null
          property_location?: string | null
          property_title?: string | null
          receipts?: string[] | null
          repair_cost?: number | null
          resolved_at?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          title?: string
          total_cost?: number | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          images: string[] | null
          property_id: string
          status: string
          tenant_access_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          property_id: string
          status?: string
          tenant_access_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          property_id?: string
          status?: string
          tenant_access_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_tenant_access_id_fkey"
            columns: ["tenant_access_id"]
            isOneToOne: false
            referencedRelation: "tenant_access"
            referencedColumns: ["id"]
          },
        ]
      }
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
          contact_phone: string | null
          created_at: string
          currency: string
          description: string | null
          energy_consumption_rating: string | null
          energy_consumption_value: number | null
          energy_emissions_rating: string | null
          energy_emissions_value: number | null
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
          contact_phone?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          energy_consumption_rating?: string | null
          energy_consumption_value?: number | null
          energy_emissions_rating?: string | null
          energy_emissions_value?: number | null
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
          contact_phone?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          energy_consumption_rating?: string | null
          energy_consumption_value?: number | null
          energy_emissions_rating?: string | null
          energy_emissions_value?: number | null
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
          floor_plan_id: string | null
          id: string
          property_id: string | null
          rent_amount: number | null
          room_id: string
          room_name: string | null
          room_size: number | null
          room_type: string | null
          start_date: string | null
          tenant_email: string | null
          tenant_name: string | null
          tenant_phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          floor_plan_id?: string | null
          id?: string
          property_id?: string | null
          rent_amount?: number | null
          room_id: string
          room_name?: string | null
          room_size?: number | null
          room_type?: string | null
          start_date?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          floor_plan_id?: string | null
          id?: string
          property_id?: string | null
          rent_amount?: number | null
          room_id?: string
          room_name?: string | null
          room_size?: number | null
          room_type?: string | null
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
      tenant_access: {
        Row: {
          access_code: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          property_id: string
          tenant_email: string | null
          tenant_name: string
          tenant_phone: string | null
          updated_at: string
        }
        Insert: {
          access_code?: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          property_id: string
          tenant_email?: string | null
          tenant_name: string
          tenant_phone?: string | null
          updated_at?: string
        }
        Update: {
          access_code?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          property_id?: string
          tenant_email?: string | null
          tenant_name?: string
          tenant_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_access_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_resolved_incidents: { Args: never; Returns: undefined }
      create_incident: {
        Args: {
          p_access_code: string
          p_category?: string
          p_description: string
          p_images?: string[]
          p_title: string
        }
        Returns: string
      }
      generate_budget_number: { Args: never; Returns: string }
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
      get_tenant_incidents: {
        Args: { p_access_code: string }
        Returns: {
          category: string
          created_at: string
          description: string
          id: string
          images: string[]
          status: string
          title: string
          updated_at: string
        }[]
      }
      update_profile_email: { Args: never; Returns: undefined }
      validate_tenant_access: {
        Args: { p_access_code: string }
        Returns: {
          property_id: string
          property_location: string
          property_title: string
          tenant_access_id: string
          tenant_name: string
        }[]
      }
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
