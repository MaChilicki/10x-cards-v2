/// <reference types="astro/client" />

import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      session: Session | null;
      user: {
        id: string;
        email: string;
        email_verified: boolean;
        raw_user_meta_data: Record<string, unknown>;
      } | null;
      supabaseUrl: string;
      supabaseAnonKey: string;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
