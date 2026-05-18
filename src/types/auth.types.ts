import type { User } from "@supabase/supabase-js";

export interface ExtendedUser extends User {
  firstName?: string;
  lastName?: string;
  email_verified?: boolean;
  raw_user_meta_data?: {
    firstName?: string;
    lastName?: string;
  };
}
