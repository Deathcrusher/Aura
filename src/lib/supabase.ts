import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Debug logging - zeigt genau was konfiguriert ist
if (typeof window !== 'undefined') {
  const configStatus = {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
    envMode: import.meta.env.MODE,
    isProduction: import.meta.env.PROD
  };
  
  console.log('🔧 Supabase Configuration Check:', configStatus);
  
  if (!isSupabaseConfigured) {
    console.error('❌ SUPABASE IST NICHT KONFIGURIERT!');
    console.error('Die App läuft im Demo-Modus mit localStorage.');
    console.error('Bitte setze in Vercel:');
    console.error('  - VITE_SUPABASE_URL');
    console.error('  - VITE_SUPABASE_ANON_KEY');
  }
}

let supabaseClient: SupabaseClient | null = null

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Timeout für Auth-Operationen
        flowType: 'pkce'
      },
      // Global timeout für alle Requests (10 Sekunden)
      global: {
        headers: {
          'x-client-info': 'aura-app'
        }
      },
      // Real-time Konfiguration
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
    console.log('✅ Supabase client erfolgreich initialisiert');
  } catch (error) {
    console.error('❌ Fehler beim Initialisieren des Supabase Clients:', error);
  }
} else if (typeof window !== 'undefined') {
  console.warn(
    '[Aura] ⚠️ Supabase-Umgebungsvariablen fehlen. Die App läuft im Demo-Modus mit lokalem Speicher.'
  )
}

export const supabase = supabaseClient