export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      asset_registry: {
        Row: {
          approval_state: string;
          approved_at: string | null;
          approved_by: string | null;
          asset_key: string;
          asset_version: number;
          checksum_sha256: string | null;
          created_at: string;
          day: number | null;
          duration_seconds: number | null;
          height: number | null;
          id: string;
          kind: string;
          license: string;
          metadata: Json;
          model_version: string | null;
          negative_prompt: string | null;
          prompt: string | null;
          prompt_ref: string | null;
          published_at: string | null;
          reference_assets: string[];
          scope: string;
          scope_id: string | null;
          seed: string | null;
          slot: string;
          source_tool: string | null;
          storage_path: string | null;
          updated_at: string;
          width: number | null;
        };
        Insert: {
          approval_state?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          asset_key: string;
          asset_version?: number;
          checksum_sha256?: string | null;
          created_at?: string;
          day?: number | null;
          duration_seconds?: number | null;
          height?: number | null;
          id?: string;
          kind: string;
          license?: string;
          metadata?: Json;
          model_version?: string | null;
          negative_prompt?: string | null;
          prompt?: string | null;
          prompt_ref?: string | null;
          published_at?: string | null;
          reference_assets?: string[];
          scope?: string;
          scope_id?: string | null;
          seed?: string | null;
          slot: string;
          source_tool?: string | null;
          storage_path?: string | null;
          updated_at?: string;
          width?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["asset_registry"]["Insert"]>;
        Relationships: [{
          foreignKeyName: "asset_registry_day_fkey";
          columns: ["day"];
          isOneToOne: false;
          referencedRelation: "codex_days";
          referencedColumns: ["day"];
        }];
      };
      attribute_state: {
        Row: {
          bio: number;
          dis: number;
          hip: number;
          int: number;
          per: number;
          sin: number;
          updated_at: string;
          user_id: string;
          vnt: number;
        };
        Insert: {
          bio?: number;
          dis?: number;
          hip?: number;
          int?: number;
          per?: number;
          sin?: number;
          updated_at?: string;
          user_id: string;
          vnt?: number;
        };
        Update: Partial<Database["public"]["Tables"]["attribute_state"]["Insert"]>;
        Relationships: [];
      };
      audio_presets: {
        Row: {
          beat_hz: number | null;
          carrier_left_hz: number | null;
          carrier_right_hz: number | null;
          day: number;
          duration_seconds: number;
          engine_version: string;
          fade_in_seconds: number;
          fade_out_seconds: number;
          layers: Json;
          solfeggio_hz: number | null;
          status: string;
          updated_at: string;
          waveform: string;
        };
        Insert: {
          beat_hz?: number | null;
          carrier_left_hz?: number | null;
          carrier_right_hz?: number | null;
          day: number;
          duration_seconds?: number;
          engine_version?: string;
          fade_in_seconds?: number;
          fade_out_seconds?: number;
          layers?: Json;
          solfeggio_hz?: number | null;
          status?: string;
          updated_at?: string;
          waveform?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audio_presets"]["Insert"]>;
        Relationships: [{
          foreignKeyName: "audio_presets_day_fkey";
          columns: ["day"];
          isOneToOne: true;
          referencedRelation: "codex_days";
          referencedColumns: ["day"];
        }];
      };
      codex_days: {
        Row: {
          angel: string | null;
          chapter: number;
          content: Json;
          day: number;
          editorial_version: string;
          epistemic_protocol: string;
          level: number;
          published_at: string | null;
          sephira: string;
          slug: string;
          source_path: string;
          source_sha: string;
          status: string;
          synced_at: string;
          title: string;
          tracks: string[];
          world: string;
          xp: number;
        };
        Insert: {
          angel?: string | null;
          chapter: number;
          content?: Json;
          day: number;
          editorial_version?: string;
          epistemic_protocol?: string;
          level: number;
          published_at?: string | null;
          sephira: string;
          slug: string;
          source_path: string;
          source_sha: string;
          status?: string;
          synced_at?: string;
          title: string;
          tracks?: string[];
          world: string;
          xp?: number;
        };
        Update: Partial<Database["public"]["Tables"]["codex_days"]["Insert"]>;
        Relationships: [];
      };
      codex_import_runs: {
        Row: {
          created_at: string;
          days_imported: number;
          error_message: string | null;
          finished_at: string | null;
          id: string;
          source_repo: string;
          source_sha: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          days_imported?: number;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          source_repo?: string;
          source_sha: string;
          status: string;
        };
        Update: Partial<Database["public"]["Tables"]["codex_import_runs"]["Insert"]>;
        Relationships: [];
      };
      day_completions: {
        Row: {
          client_completed_at: string | null;
          completed_at: string;
          completion_version: string;
          day: number;
          first_completion_session_id: string | null;
          local_record_hash: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          client_completed_at?: string | null;
          completed_at?: string;
          completion_version?: string;
          day: number;
          first_completion_session_id?: string | null;
          local_record_hash?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["day_completions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "day_completions_day_fkey";
            columns: ["day"];
            isOneToOne: false;
            referencedRelation: "codex_days";
            referencedColumns: ["day"];
          },
          {
            foreignKeyName: "day_completions_first_completion_session_id_fkey";
            columns: ["first_completion_session_id"];
            isOneToOne: false;
            referencedRelation: "practice_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      journal_vault: {
        Row: {
          aad: string | null;
          checksum_sha256: string | null;
          ciphertext: string;
          client_created_at: string | null;
          created_at: string;
          crypto_alg: string;
          crypto_version: number;
          day: number | null;
          id: string;
          nonce: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          aad?: string | null;
          checksum_sha256?: string | null;
          ciphertext: string;
          client_created_at?: string | null;
          created_at?: string;
          crypto_alg?: string;
          crypto_version?: number;
          day?: number | null;
          id?: string;
          nonce: string;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["journal_vault"]["Insert"]>;
        Relationships: [{
          foreignKeyName: "journal_vault_day_fkey";
          columns: ["day"];
          isOneToOne: false;
          referencedRelation: "codex_days";
          referencedColumns: ["day"];
        }];
      };
      practice_sessions: {
        Row: {
          app_version: string | null;
          client_session_id: string;
          created_at: string;
          day: number;
          duration_seconds: number | null;
          ended_at: string | null;
          evidence: Json;
          id: string;
          local_record_hash: string | null;
          metrics: Json;
          mode: string;
          started_at: string;
          state: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          app_version?: string | null;
          client_session_id: string;
          created_at?: string;
          day: number;
          duration_seconds?: number | null;
          ended_at?: string | null;
          evidence?: Json;
          id?: string;
          local_record_hash?: string | null;
          metrics?: Json;
          mode?: string;
          started_at?: string;
          state?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["practice_sessions"]["Insert"]>;
        Relationships: [{
          foreignKeyName: "practice_sessions_day_fkey";
          columns: ["day"];
          isOneToOne: false;
          referencedRelation: "codex_days";
          referencedColumns: ["day"];
        }];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          created_at: string;
          display_name: string | null;
          locale: string;
          onboarding_completed: boolean;
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          display_name?: string | null;
          locale?: string;
          onboarding_completed?: boolean;
          timezone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      user_progress: {
        Row: {
          current_chapter: number;
          current_day: number;
          current_sephira: string;
          initiatory_grade: number;
          initiatory_title: string;
          streak_days: number;
          updated_at: string;
          user_id: string;
          xp_total: number;
        };
        Insert: {
          current_chapter?: number;
          current_day?: number;
          current_sephira?: string;
          initiatory_grade?: number;
          initiatory_title?: string;
          streak_days?: number;
          updated_at?: string;
          user_id: string;
          xp_total?: number;
        };
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Insert"]>;
        Relationships: [];
      };
      xp_events: {
        Row: {
          amount: number;
          created_at: string;
          day: number | null;
          id: number;
          idempotency_key: string;
          metadata: Json;
          source: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          day?: number | null;
          id?: never;
          idempotency_key: string;
          metadata?: Json;
          source: string;
          user_id: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["xp_events"]["Insert"], "id">>;
        Relationships: [{
          foreignKeyName: "xp_events_day_fkey";
          columns: ["day"];
          isOneToOne: false;
          referencedRelation: "codex_days";
          referencedColumns: ["day"];
        }];
      };
    };
    Views: Record<string, never>;
    Functions: {
      complete_codex_day: {
        Args: {
          p_client_completed_at?: string;
          p_day: number;
          p_local_record_hash?: string;
          p_session_id: string;
        };
        Returns: Json;
      };
      get_kether_crown_state: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PublicTables = Database["public"]["Tables"];
export type TableName = keyof PublicTables;
export type Row<T extends TableName> = PublicTables[T]["Row"];
export type Insert<T extends TableName> = PublicTables[T]["Insert"];
export type Update<T extends TableName> = PublicTables[T]["Update"];
