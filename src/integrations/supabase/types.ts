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
      clientes: {
        Row: {
          cpf_cnpj: string
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          razao_social: string
          status: string
          telefones: string | null
          updated_at: string
        }
        Insert: {
          cpf_cnpj: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          razao_social: string
          status?: string
          telefones?: string | null
          updated_at?: string
        }
        Update: {
          cpf_cnpj?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          razao_social?: string
          status?: string
          telefones?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      equipe: {
        Row: {
          assinatura_url: string | null
          cargo: string | null
          crea: string | null
          created_at: string
          formacao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          assinatura_url?: string | null
          cargo?: string | null
          crea?: string | null
          created_at?: string
          formacao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          assinatura_url?: string | null
          cargo?: string | null
          crea?: string | null
          created_at?: string
          formacao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      laudos: {
        Row: {
          avaliacao_final: string | null
          caracteristicas: Json | null
          cliente_id: string
          created_at: string
          endereco_imovel_vistoriado: string | null
          equipe_ids: string[] | null
          figura_fluxograma: string | null
          figura_localizacao: string | null
          fotos: Json | null
          id: string
          objetivo: string | null
          obra_id: string
          status: string
          tipo_imovel: string | null
          tipo_ocupacao: string | null
          updated_at: string
          vias_acesso: string | null
        }
        Insert: {
          avaliacao_final?: string | null
          caracteristicas?: Json | null
          cliente_id: string
          created_at?: string
          endereco_imovel_vistoriado?: string | null
          equipe_ids?: string[] | null
          figura_fluxograma?: string | null
          figura_localizacao?: string | null
          fotos?: Json | null
          id?: string
          objetivo?: string | null
          obra_id: string
          status?: string
          tipo_imovel?: string | null
          tipo_ocupacao?: string | null
          updated_at?: string
          vias_acesso?: string | null
        }
        Update: {
          avaliacao_final?: string | null
          caracteristicas?: Json | null
          cliente_id?: string
          created_at?: string
          endereco_imovel_vistoriado?: string | null
          equipe_ids?: string[] | null
          figura_fluxograma?: string | null
          figura_localizacao?: string | null
          fotos?: Json | null
          id?: string
          objetivo?: string | null
          obra_id?: string
          status?: string
          tipo_imovel?: string | null
          tipo_ocupacao?: string | null
          updated_at?: string
          vias_acesso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laudos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laudos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          bairro: string | null
          cidade: string | null
          cliente_id: string
          created_at: string
          data_inicio: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          previsao_termino: string | null
          referencia: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          cliente_id: string
          created_at?: string
          data_inicio?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          previsao_termino?: string | null
          referencia?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          cliente_id?: string
          created_at?: string
          data_inicio?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          previsao_termino?: string | null
          referencia?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
