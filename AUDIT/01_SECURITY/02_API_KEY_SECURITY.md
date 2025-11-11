# 🔒 02 - API Key Security

**Status:** [ ] Nicht gestartet  
**Priorität:** 🔴 KRITISCH  
**Geschätzter Aufwand:** 4-6 Stunden  
**Blockiert:** Nichts

## 🎯 Ziel

API Keys dürfen NICHT im Client-Code sein. Erstelle einen Backend Proxy, der die Gemini API Calls über Supabase Edge Functions abwickelt.

## 🔍 Aktuelles Problem

### ❌ Was aktuell falsch ist:
- Gemini API Key (`VITE_API_KEY`) ist im Client-Bundle sichtbar
- Keys können aus dem JavaScript Bundle extrahiert werden
- Keine Rate Limiting Kontrolle pro User
- Keine Usage Tracking
- Keys können nicht rotiert werden ohne Neudeployment

### ✅ Was wir erreichen wollen:
- API Keys nur im Backend (Supabase Edge Functions)
- Rate Limiting pro User
- Usage Tracking
- Key Rotation ohne Client-Update
- Kostenkontrolle

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Supabase Edge Functions Setup

**1.1 Supabase CLI installieren (falls nicht vorhanden):**

```bash
# Prüfe ob Supabase CLI installiert ist
supabase --version

# Falls nicht, installiere es:
npm install -g supabase
```

**1.2 Supabase CLI Login:**

```bash
# Login zu Supabase
supabase login

# Verknüpfe Projekt (ersetze PROJECT_ID mit deiner Project ID)
supabase link --project-ref swentdldrcmemkisuqcg
```

**1.3 Edge Functions initialisieren:**

```bash
# Erstelle Edge Functions Verzeichnis (falls nicht vorhanden)
mkdir -p supabase/functions

# Initialisiere eine neue Edge Function
supabase functions new gemini-proxy
```

**✅ Checkliste:**
- [ ] Supabase CLI installiert
- [ ] Eingeloggt
- [ ] Projekt verknüpft
- [ ] Edge Function `gemini-proxy` erstellt

### Schritt 2: Gemini Proxy Edge Function erstellen

**2.1 Erstelle die Function:**

Erstelle die Datei: `supabase/functions/gemini-proxy/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not set')
    }

    // Verify user is authenticated
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { model, contents, config } = await req.json()

    // Check rate limit (optional - implementiere später)
    // await checkRateLimit(user.id)

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        ...config,
      }),
    })

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text()
      console.error('Gemini API error:', error)
      return new Response(
        JSON.stringify({ error: 'Gemini API error', details: error }),
        { status: geminiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await geminiResponse.json()

    // Track usage (optional - implementiere später)
    // await trackUsage(user.id, model, contents.length)

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**✅ Checkliste:**
- [ ] Edge Function erstellt
- [ ] Code in `supabase/functions/gemini-proxy/index.ts` gespeichert

### Schritt 3: Environment Variables setzen

**3.1 In Supabase Dashboard:**

1. Gehe zu Supabase Dashboard → Project Settings → Edge Functions
2. Füge Environment Variable hinzu:
   - `GEMINI_API_KEY` = dein Gemini API Key

**3.2 Oder via CLI:**

```bash
# Setze Environment Variable
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

**✅ Checkliste:**
- [ ] `GEMINI_API_KEY` Environment Variable gesetzt
- [ ] Value ist korrekt

### Schritt 4: Edge Function deployen

```bash
# Deploye die Function
supabase functions deploy gemini-proxy

# Prüfe Status
supabase functions list
```

**✅ Checkliste:**
- [ ] Function deployed
- [ ] Keine Errors beim Deployment
- [ ] Function ist in der Liste sichtbar

### Schritt 5: Client-Code anpassen

**5.1 Erstelle einen neuen Service:**

Erstelle die Datei: `src/lib/gemini-proxy.ts`

```typescript
import { supabase } from './supabase'

export interface GeminiRequest {
  model: string
  contents: Array<{
    role: 'user' | 'assistant' | 'system'
    parts: Array<{ text: string }>
  }>
  config?: {
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    topK?: number
  }
}

export async function callGeminiAPI(request: GeminiRequest) {
  try {
    // Get session for authentication
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Not authenticated')
    }

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: request,
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}
```

**5.2 Passe App.tsx an:**

Suche alle Stellen, wo `genAIRef.current` oder direkte Gemini API Calls gemacht werden und ersetze sie:

**Vorher:**
```typescript
const response = await genAIRef.current.models.generateContent({
  model: 'gemini-2.5-pro',
  contents: [{
    role: 'user',
    parts: [{ text: 'Hello' }],
  }],
})
```

**Nachher:**
```typescript
import { callGeminiAPI } from './lib/gemini-proxy'

const response = await callGeminiAPI({
  model: 'gemini-2.5-pro',
  contents: [{
    role: 'user',
    parts: [{ text: 'Hello' }],
  }],
})
```

**✅ Checkliste:**
- [ ] `gemini-proxy.ts` Service erstellt
- [ ] Alle Gemini API Calls in App.tsx angepasst
- [ ] Alle anderen Dateien angepasst (falls vorhanden)

### Schritt 6: Environment Variables aus Client entfernen

**6.1 Entferne VITE_API_KEY aus .env.local:**

```bash
# Entferne diese Zeile aus .env.local
# VITE_API_KEY=your_key_here
```

**6.2 Entferne aus vite.config.ts:**

```typescript
// Entferne diesen Block aus vite.config.ts
define: {
  'import.meta.env.VITE_API_KEY': JSON.stringify(
    process.env.VITE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || ''
  ),
},
```

**6.3 Entferne aus Vercel Environment Variables:**

1. Gehe zu Vercel Dashboard → Project Settings → Environment Variables
2. Lösche `VITE_API_KEY`

**✅ Checkliste:**
- [ ] VITE_API_KEY aus .env.local entfernt
- [ ] VITE_API_KEY aus vite.config.ts entfernt
- [ ] VITE_API_KEY aus Vercel entfernt
- [ ] Code verwendet jetzt Edge Function

### Schritt 7: Testing

**7.1 Local Testing:**

```bash
# Starte Supabase lokal (optional)
supabase start

# Teste die Function lokal
supabase functions serve gemini-proxy

# In einem anderen Terminal, teste die Function:
curl -X POST http://localhost:54321/functions/v1/gemini-proxy \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "contents": [{
      "role": "user",
      "parts": [{ "text": "Hello" }]
    }]
  }'
```

**7.2 Production Testing:**

1. Deploye die App
2. Teste einen Chat
3. Prüfe Browser Console (sollte keine API Key mehr zeigen)
4. Prüfe Network Tab (Calls gehen an Edge Function)

**✅ Checkliste:**
- [ ] Local Testing erfolgreich
- [ ] Production Testing erfolgreich
- [ ] Keine API Keys im Client-Bundle
- [ ] API Calls funktionieren über Edge Function

### Schritt 8: Rate Limiting implementieren (Optional aber empfohlen)

**8.1 Erstelle Usage Tracking Tabelle:**

```sql
-- Erstelle usage_tracking Tabelle
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, DATE(created_at))
);

-- RLS aktivieren
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Policy: User können nur ihre eigenen Usage sehen
CREATE POLICY "Users can view own usage"
ON public.api_usage
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);
```

**8.2 Passe Edge Function an:**

```typescript
// Füge Rate Limiting hinzu
async function checkRateLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabaseClient
    .from('api_usage')
    .select('tokens_used')
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00Z`)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  const tokensUsed = data?.tokens_used || 0
  const dailyLimit = 100000 // 100k tokens pro Tag (anpassen nach Plan)

  if (tokensUsed >= dailyLimit) {
    return false
  }

  return true
}

async function trackUsage(userId: string, model: string, tokens: number) {
  const today = new Date().toISOString().split('T')[0]
  
  await supabaseClient
    .from('api_usage')
    .upsert({
      user_id: userId,
      model,
      tokens_used: tokens,
      created_at: `${today}T00:00:00Z`,
    }, {
      onConflict: 'user_id,created_at',
    })
}
```

**✅ Checkliste:**
- [ ] Usage Tracking Tabelle erstellt
- [ ] RLS aktiviert
- [ ] Rate Limiting in Edge Function implementiert
- [ ] Usage Tracking in Edge Function implementiert

## 🐛 Troubleshooting

### Problem: "Function not found"

**Lösung:**
```bash
# Prüfe ob Function deployed ist
supabase functions list

# Deploye neu
supabase functions deploy gemini-proxy
```

### Problem: "Unauthorized"

**Lösung:**
- Prüfe, ob User eingeloggt ist
- Prüfe, ob Authorization Header gesendet wird
- Prüfe Supabase Auth Konfiguration

### Problem: "GEMINI_API_KEY not set"

**Lösung:**
```bash
# Setze Environment Variable
supabase secrets set GEMINI_API_KEY=your_key

# Prüfe ob gesetzt
supabase secrets list
```

## ✅ Finale Checkliste

- [ ] Edge Function erstellt und deployed
- [ ] Environment Variables gesetzt
- [ ] Client-Code angepasst
- [ ] VITE_API_KEY aus Client entfernt
- [ ] Testing abgeschlossen
- [ ] Rate Limiting implementiert (optional)
- [ ] Usage Tracking implementiert (optional)
- [ ] Dokumentation aktualisiert

## 📝 Notizen

```
[Datum] - [Was wurde gemacht]
- 
- 
- 
```

## 🎯 Nächster Schritt

Wenn alles abgeschlossen ist, gehe weiter zu:
**`03_ERROR_HANDLING.md`**

---

**Status Update:**
- [ ] Nicht gestartet
- [🔄] In Arbeit
- [✅] Abgeschlossen
- [⚠️] Blockiert (Grund: _______________)

