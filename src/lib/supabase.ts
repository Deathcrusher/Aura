import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let supabaseClient: SupabaseClient | null = null

if (isSupabaseConfigured) {
  supabaseClient = createClient(supabaseUrl as string, supabaseAnonKey as string)
} else if (typeof window !== 'undefined') {
  console.warn(
    '[Aura] Supabase-Umgebungsvariablen fehlen. Die App läuft im Demo-Modus mit lokalem Speicher.'
  )
}

export const supabase = supabaseClient