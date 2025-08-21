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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      acoes_pdi: {
        Row: {
          categoria: string
          created_at: string | null
          descricao: string
          id: string
          nivel_maximo: Database["public"]["Enums"]["nivel_senioridade"]
          nivel_minimo: Database["public"]["Enums"]["nivel_senioridade"]
          prazo_sugerido: number | null
          titulo: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descricao: string
          id?: string
          nivel_maximo: Database["public"]["Enums"]["nivel_senioridade"]
          nivel_minimo: Database["public"]["Enums"]["nivel_senioridade"]
          prazo_sugerido?: number | null
          titulo: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descricao?: string
          id?: string
          nivel_maximo?: Database["public"]["Enums"]["nivel_senioridade"]
          nivel_minimo?: Database["public"]["Enums"]["nivel_senioridade"]
          prazo_sugerido?: number | null
          titulo?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          created_at: string | null
          id: string
          nivel_calculado: Database["public"]["Enums"]["nivel_senioridade"]
          observacoes: string | null
          pontuacao_total: number
          questionario_id: string
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          created_at?: string | null
          id?: string
          nivel_calculado: Database["public"]["Enums"]["nivel_senioridade"]
          observacoes?: string | null
          pontuacao_total: number
          questionario_id: string
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          created_at?: string | null
          id?: string
          nivel_calculado?: Database["public"]["Enums"]["nivel_senioridade"]
          observacoes?: string | null
          pontuacao_total?: number
          questionario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_avaliado_id_fkey"
            columns: ["avaliado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_questionario_id_fkey"
            columns: ["questionario_id"]
            isOneToOne: false
            referencedRelation: "questionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pdis: {
        Row: {
          avaliacao_id: string
          colaborador_id: string
          created_at: string | null
          id: string
          plano_html: string
        }
        Insert: {
          avaliacao_id: string
          colaborador_id: string
          created_at?: string | null
          id?: string
          plano_html: string
        }
        Update: {
          avaliacao_id?: string
          colaborador_id?: string
          created_at?: string | null
          id?: string
          plano_html?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdis_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdis_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perguntas: {
        Row: {
          categoria: string
          created_at: string | null
          id: string
          ordem: number
          peso: number
          questionario_id: string
          texto: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          id?: string
          ordem: number
          peso: number
          questionario_id: string
          texto: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: string
          ordem?: number
          peso?: number
          questionario_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "perguntas_questionario_id_fkey"
            columns: ["questionario_id"]
            isOneToOne: false
            referencedRelation: "questionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          gestor_id: string | null
          id: string
          nome: string
          papel: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          gestor_id?: string | null
          id?: string
          nome: string
          papel?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          gestor_id?: string | null
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questionarios: {
        Row: {
          created_at: string | null
          created_by: string
          descricao: string | null
          id: string
          status: Database["public"]["Enums"]["questionario_status"]
          titulo: string
          updated_at: string | null
          versao: number
        }
        Insert: {
          created_at?: string | null
          created_by: string
          descricao?: string | null
          id?: string
          status?: Database["public"]["Enums"]["questionario_status"]
          titulo: string
          updated_at?: string | null
          versao?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string
          descricao?: string | null
          id?: string
          status?: Database["public"]["Enums"]["questionario_status"]
          titulo?: string
          updated_at?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "questionarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas: {
        Row: {
          avaliacao_id: string
          created_at: string | null
          id: string
          pergunta_id: string
          valor: number
        }
        Insert: {
          avaliacao_id: string
          created_at?: string | null
          id?: string
          pergunta_id: string
          valor: number
        }
        Update: {
          avaliacao_id?: string
          created_at?: string | null
          id?: string
          pergunta_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "respostas_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_manager_of: {
        Args: { colaborador_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      nivel_senioridade: "junior" | "pleno" | "senior"
      questionario_status: "ativo" | "inativo" | "rascunho"
      user_role: "admin" | "gestor" | "colaborador"
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
      nivel_senioridade: ["junior", "pleno", "senior"],
      questionario_status: ["ativo", "inativo", "rascunho"],
      user_role: ["admin", "gestor", "colaborador"],
    },
  },
} as const
