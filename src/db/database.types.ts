export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      documents: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          name: string;
          topic_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          name: string;
          topic_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          name?: string;
          topic_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcards: {
        Row: {
          back_modified: string | null;
          back_original: string;
          created_at: string;
          document_id: string | null;
          front_modified: string | null;
          front_original: string;
          id: string;
          is_approved: boolean;
          is_disabled: boolean;
          is_modified: boolean;
          modification_percentage: number | null;
          source: "ai" | "manual";
          spaced_repetition_data: Json | null;
          topic_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          back_modified?: string | null;
          back_original: string;
          created_at?: string;
          document_id?: string | null;
          front_modified?: string | null;
          front_original: string;
          id?: string;
          is_approved?: boolean;
          is_disabled?: boolean;
          is_modified?: boolean;
          modification_percentage?: number | null;
          source?: "ai" | "manual";
          spaced_repetition_data?: Json | null;
          topic_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          back_modified?: string | null;
          back_original?: string;
          created_at?: string;
          document_id?: string | null;
          front_modified?: string | null;
          front_original?: string;
          id?: string;
          is_approved?: boolean;
          is_disabled?: boolean;
          is_modified?: boolean;
          modification_percentage?: number | null;
          source?: "ai" | "manual";
          spaced_repetition_data?: Json | null;
          topic_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcards_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      study_session_results: {
        Row: {
          created_at: string;
          difficulty_rating: number | null;
          flashcard_id: string;
          id: string;
          is_correct: boolean;
          response_time: number;
          scheduled_for: string | null;
          session_id: string;
        };
        Insert: {
          created_at?: string;
          difficulty_rating?: number | null;
          flashcard_id: string;
          id?: string;
          is_correct: boolean;
          response_time: number;
          scheduled_for?: string | null;
          session_id: string;
        };
        Update: {
          created_at?: string;
          difficulty_rating?: number | null;
          flashcard_id?: string;
          id?: string;
          is_correct?: boolean;
          response_time?: number;
          scheduled_for?: string | null;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_session_results_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "study_session_results_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "study_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      study_sessions: {
        Row: {
          cards_reviewed: number;
          created_at: string;
          end_time: string | null;
          id: string;
          start_time: string;
          topic_id: string | null;
          user_id: string;
        };
        Insert: {
          cards_reviewed?: number;
          created_at?: string;
          end_time?: string | null;
          id?: string;
          start_time?: string;
          topic_id?: string | null;
          user_id: string;
        };
        Update: {
          cards_reviewed?: number;
          created_at?: string;
          end_time?: string | null;
          id?: string;
          start_time?: string;
          topic_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_sessions_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      topics: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          parent_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          parent_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topics_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      user_statistics: {
        Row: {
          average_response_time: number | null;
          correct_answers: number;
          created_at: string;
          id: string;
          incorrect_answers: number;
          last_study_date: string | null;
          study_streak_days: number;
          total_cards_created: number;
          total_cards_studied: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          average_response_time?: number | null;
          correct_answers?: number;
          created_at?: string;
          id?: string;
          incorrect_answers?: number;
          last_study_date?: string | null;
          study_streak_days?: number;
          total_cards_created?: number;
          total_cards_studied?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          average_response_time?: number | null;
          correct_answers?: number;
          created_at?: string;
          id?: string;
          incorrect_answers?: number;
          last_study_date?: string | null;
          study_streak_days?: number;
          total_cards_created?: number;
          total_cards_studied?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      cleanup_old_study_sessions: {
        Args: { p_days_old: number };
        Returns: undefined;
      };
      get_current_streak: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_topic_statistics: {
        Args: { p_topic_id: string };
        Returns: {
          total_flashcards: number;
          total_study_sessions: number;
          total_correct_answers: number;
          total_incorrect_answers: number;
          average_response_time: number;
          last_studied_at: string;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
