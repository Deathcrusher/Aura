import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_ACCOUNTS_KEY = 'aura-demo-auth-accounts'
const DEMO_ACTIVE_USER_KEY = 'aura-demo-auth-active-user'

type DemoAccount = {
  id: string
  email: string
  password: string
  name: string
}

const readLocalStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('[Aura] Konnte lokale Demo-Daten nicht lesen:', error)
    return fallback
  }
}

const writeLocalStorage = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('[Aura] Konnte lokale Demo-Daten nicht speichern:', error)
  }
}

const removeLocalStorage = (key: string) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn('[Aura] Konnte lokale Demo-Daten nicht entfernen:', error)
  }
}

const toSupabaseUser = (account: DemoAccount): User => ({
  id: account.id,
  email: account.email,
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: null,
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'demo' },
  user_metadata: { full_name: account.name },
  identities: [],
  factors: [],
} as unknown as User)

const generateDemoId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `demo-user-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const isDemoMode = !isSupabaseConfigured || !supabase

  useEffect(() => {
    if (isDemoMode) {
      const activeAccount = readLocalStorage<DemoAccount | null>(DEMO_ACTIVE_USER_KEY, null)
      setUser(activeAccount ? toSupabaseUser(activeAccount) : null)
      setSession(null)
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    // Initiale Session laden
    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Fehler beim Laden der Session:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()

    // Auth State Listener (KEINE async Operationen im Callback!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Wenn ein neuer User sich mit OAuth anmeldet, erstelle Profil
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Prüfe ob Profil bereits existiert
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .maybeSingle()

            if (!existingProfile) {
              // Erstelle Profil für neuen OAuth-User
              const userName = session.user.user_metadata?.full_name || 
                             session.user.user_metadata?.name || 
                             session.user.email?.split('@')[0] || 
                             'User'
              
              await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  name: userName,
                  email: session.user.email,
                  voice: 'Zephyr',
                  language: 'de-DE',
                  onboarding_completed: false,
                })

              // Erstelle Aura Memory nur wenn noch keiner existiert
              const { data: existingMemory } = await supabase
                .from('aura_memory')
                .select('id')
                .eq('user_id', session.user.id)
                .limit(1)
                .maybeSingle()
              
              if (!existingMemory) {
                await supabase
                  .from('aura_memory')
                  .insert({
                    user_id: session.user.id,
                  })
              }
            }
          } catch (error) {
            console.error('Fehler beim Erstellen des Profils für OAuth-User:', error)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [isDemoMode])

  const loadAccounts = () => readLocalStorage<DemoAccount[]>(DEMO_ACCOUNTS_KEY, [])
  const saveAccounts = (accounts: DemoAccount[]) => writeLocalStorage(DEMO_ACCOUNTS_KEY, accounts)
  const setActiveAccount = (account: DemoAccount | null) => {
    if (account) {
      writeLocalStorage(DEMO_ACTIVE_USER_KEY, account)
    } else {
      removeLocalStorage(DEMO_ACTIVE_USER_KEY)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (isDemoMode || !supabase) {
      try {
        const accounts = loadAccounts()
        const exists = accounts.some(account => account.email.toLowerCase() === email.toLowerCase())
        if (exists) {
          return { error: new Error('Diese E-Mail-Adresse ist in der Demo bereits registriert.') }
        }

        const account: DemoAccount = {
          id: generateDemoId(),
          email,
          password,
          name,
        }

        const updatedAccounts = [...accounts, account]
        saveAccounts(updatedAccounts)
        setActiveAccount(account)
        setUser(toSupabaseUser(account))
        setSession(null)
        setLoading(false)
        return { error: null }
      } catch (error) {
        return { error: error as Error }
      }
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      // Warte kurz auf die Session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Erstelle Profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            name: name,
            email: email,
            voice: 'Zephyr',
            language: 'de-DE',
            onboarding_completed: false,
          })

        if (profileError) throw profileError

        // Erstelle Aura Memory nur wenn noch keiner existiert
        const { data: existingMemory } = await supabase
          .from('aura_memory')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle()
        
        if (!existingMemory) {
          await supabase
            .from('aura_memory')
            .insert({
              user_id: session.user.id,
            })
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (isDemoMode || !supabase) {
      try {
        const accounts = loadAccounts()
        const account = accounts.find(
          acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password,
        )

        if (!account) {
          return { error: new Error('Ungültige Demo-Zugangsdaten.') }
        }

        setActiveAccount(account)
        setUser(toSupabaseUser(account))
        setSession(null)
        setLoading(false)
        return { error: null }
      } catch (error) {
        return { error: error as Error }
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithGoogle = async () => {
    if (isDemoMode || !supabase) {
      // Im Demo-Modus: Simuliere Google-Login mit Demo-Account
      const demoGoogleAccount: DemoAccount = {
        id: generateDemoId(),
        email: 'demo@google.com',
        password: '',
        name: 'Google User',
      }
      const accounts = loadAccounts()
      const existingAccount = accounts.find(acc => acc.email === demoGoogleAccount.email)
      if (!existingAccount) {
        saveAccounts([...accounts, demoGoogleAccount])
      }
      setActiveAccount(demoGoogleAccount)
      setUser(toSupabaseUser(demoGoogleAccount))
      setSession(null)
      setLoading(false)
      return
    }

    try {
      // Bestimme die Redirect-URL: 
      // WICHTIG: Die Redirect-URL muss die App-URL sein, nicht die Supabase Callback-URL
      // Die Supabase Callback-URL ist bereits in Google Cloud Console konfiguriert
      const getRedirectUrl = () => {
        if (typeof window === 'undefined') {
          return 'https://aura-two-beta.vercel.app'
        }
        
        // Prüfe ob wir auf Vercel sind (Production)
        const hostname = window.location.hostname
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
        
        if (isLocalhost) {
          // Lokal: localhost verwenden
          console.warn('⚠️ Lokaler Test-Modus: Verwende localhost als Redirect-URL')
          return window.location.origin
        }
        
        // Production: Immer die Vercel-Domain verwenden
        return 'https://aura-two-beta.vercel.app'
      }
      
      const redirectTo = getRedirectUrl()
      console.log('🔐 Google OAuth Redirect URL:', redirectTo)
      console.log('🔐 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR')
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        },
      })
      if (error) {
        console.error('Google OAuth Fehler:', error)
        // Spezielle Fehlermeldung wenn Provider nicht aktiviert ist
        if (error.message?.includes('not enabled') || error.message?.includes('Unsupported provider')) {
          throw new Error('Google-Login ist noch nicht aktiviert. Bitte aktiviere Google OAuth im Supabase Dashboard unter Authentication → Providers → Google.')
        }
        throw error
      }
    } catch (error: any) {
      console.error('Fehler beim Google-Login:', error)
      // Wenn es bereits eine benutzerfreundliche Nachricht ist, weiterwerfen
      if (error.message?.includes('Supabase Dashboard')) {
        throw error
      }
      throw new Error(error.message || 'Fehler beim Google-Login. Bitte versuche es erneut.')
    }
  }

  const signOut = async () => {
    if (isDemoMode || !supabase) {
      setActiveAccount(null)
      setUser(null)
      setSession(null)
      return
    }

    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden')
  }
  return context
}