import { createClient } from "@supabase/supabase-js"

// Service role client — only for server-side API routes
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
