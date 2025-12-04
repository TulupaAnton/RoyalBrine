import { createClient } from '@supabase/supabase-js'

export const database = createClient(
  import.meta.env.VITE_SUPABASECAT_URL,
  import.meta.env.VITE_SUPABASECAT_ANON_KEY
)
