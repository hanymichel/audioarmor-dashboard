import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase: any;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );

  supabase = {
    auth: {
      async signInWithPassword() {
        return {
          data: null,
          error: new Error(
            "Supabase environment variables are missing."
          ),
        };
      },

      async signUp() {
        return {
          data: null,
          error: new Error(
            "Supabase environment variables are missing."
          ),
        };
      },

      async signOut() {
        return {
          error: null,
        };
      },

      async getSession() {
        return {
          data: {
            session: null,
          },
        };
      },
    },

    from() {
      throw new Error(
        "Supabase environment variables are missing."
      );
    },
  };
} else {
  supabase = createClient(
    supabaseUrl,
    supabasePublishableKey
  );
}

export { supabase };