/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string
    readonly VITE_SUPABASE_ANON_KEY?: string
    readonly VITE_API_KEY?: string
    readonly VITE_GEMINI_API_KEY?: string
    readonly VITE_APP_URL?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  // Legacy API key fallback from vite.config.ts (for GEMINI_API_KEY or API_KEY)
  const __LEGACY_API_KEY__: string;
}

export { }
