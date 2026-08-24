import { createClient } from '@supabase/supabase-js'
console.log('URL je:', import.meta.env.VITE_SUPABASE_URL)
console.log('KEY je:', import.meta.env.VITE_SUPABASE_ANON_KEY)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)