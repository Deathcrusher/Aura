# 🔒 05 - Security Headers & CSP

**Status:** [ ] Nicht gestartet  
**Priorität:** 🟡 MITTEL  
**Geschätzter Aufwand:** 1-2 Stunden  
**Blockiert:** Nichts

## 🎯 Ziel

Implementiere Security Headers und Content Security Policy (CSP) für zusätzliche Sicherheit.

## 🔍 Aktuelles Problem

### ❌ Was aktuell fehlt:
- Keine Security Headers
- Keine Content Security Policy
- Keine XSS Protection
- Keine Clickjacking Protection

### ✅ Was wir erreichen wollen:
- Security Headers konfiguriert
- Content Security Policy aktiviert
- XSS Protection
- Clickjacking Protection

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Vercel Headers konfigurieren

**1.1 Erstelle/aktualisiere vercel.json:**

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(self), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.sentry.io https://generativelanguage.googleapis.com wss://*.supabase.co; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
        }
      ]
    }
  ]
}
```

**✅ Checkliste:**
- [ ] vercel.json aktualisiert
- [ ] Alle Security Headers hinzugefügt
- [ ] CSP konfiguriert

### Schritt 2: CSP für Development anpassen

**2.1 Erstelle CSP Config:**

Erstelle `src/lib/csp.ts`:

```typescript
// Content Security Policy für Development vs Production
export function getCSPHeader(): string {
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    // Lockerere CSP für Development (Hot Reload, etc.)
    return "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.sentry.io https://generativelanguage.googleapis.com wss://*.supabase.co ws://localhost:*; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';";
  }
  
  // Strikte CSP für Production
  return "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.supabase.co https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.sentry.io https://generativelanguage.googleapis.com wss://*.supabase.co; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;";
}
```

**✅ Checkliste:**
- [ ] CSP Config erstellt
- [ ] Development vs Production unterschieden

### Schritt 3: Meta Tags für Security

**3.1 Füge Meta Tags zu index.html hinzu:**

In `index.html`:

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="X-Frame-Options" content="DENY" />
    <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
    <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(self), geolocation=()" />
    
    <!-- CSP (als Fallback, primär über Vercel Headers) -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.sentry.io https://generativelanguage.googleapis.com wss://*.supabase.co; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;" />
    
    <title>Aura - Therapy App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**✅ Checkliste:**
- [ ] Meta Tags zu index.html hinzugefügt
- [ ] Alle Security Meta Tags vorhanden

### Schritt 4: Security Headers testen

**4.1 Teste Headers lokal:**

```bash
# Starte Dev Server
npm run dev

# In einem anderen Terminal, teste Headers:
curl -I http://localhost:5173
```

**4.2 Teste Headers in Production:**

Nach Deployment:

```bash
# Teste Production Headers
curl -I https://your-app.vercel.app
```

**Erwartete Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy: ...`

**✅ Checkliste:**
- [ ] Headers lokal getestet
- [ ] Headers in Production getestet
- [ ] Alle Headers vorhanden

### Schritt 5: CSP Reporting (Optional)

**5.1 Erstelle CSP Report Endpoint:**

Erstelle Supabase Edge Function `supabase/functions/csp-report/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method === 'POST') {
    const report = await req.json()
    console.error('CSP Violation:', JSON.stringify(report, null, 2))
    
    // Optional: Send to Sentry or other logging service
    // await sendToSentry(report)
    
    return new Response('OK', { status: 200 })
  }
  
  return new Response('Method not allowed', { status: 405 })
})
```

**5.2 Aktiviere CSP Reporting:**

In `vercel.json`, füge `report-uri` zur CSP hinzu:

```json
{
  "key": "Content-Security-Policy",
  "value": "...; report-uri https://your-project.supabase.co/functions/v1/csp-report;"
}
```

**✅ Checkliste:**
- [ ] CSP Report Endpoint erstellt
- [ ] CSP Reporting aktiviert
- [ ] Reports werden geloggt

### Schritt 6: Security Testing

**6.1 Teste XSS Protection:**

```html
<!-- Test XSS Protection -->
<script>alert('XSS')</script>
```

Sollte blockiert werden.

**6.2 Teste Clickjacking Protection:**

Versuche die Seite in einem iframe zu laden - sollte blockiert werden.

**6.3 Teste CSP:**

Versuche externe Scripts zu laden - sollten blockiert werden (außer erlaubte Domains).

**✅ Checkliste:**
- [ ] XSS Protection getestet
- [ ] Clickjacking Protection getestet
- [ ] CSP getestet
- [ ] Alle Tests erfolgreich

## 🐛 Troubleshooting

### Problem: "CSP blockiert legitime Resources"

**Lösung:**
- Prüfe Browser Console für CSP Violations
- Füge benötigte Domains zur CSP hinzu
- Teste nach jeder Änderung

### Problem: "Headers werden nicht gesetzt"

**Lösung:**
- Prüfe vercel.json Syntax
- Prüfe ob Headers in Vercel Dashboard sichtbar sind
- Prüfe ob Deployment erfolgreich war

## ✅ Finale Checkliste

- [ ] Security Headers in vercel.json konfiguriert
- [ ] Meta Tags zu index.html hinzugefügt
- [ ] CSP konfiguriert
- [ ] Headers getestet
- [ ] CSP Reporting implementiert (optional)
- [ ] Security Testing abgeschlossen
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
**`../02_PAYMENT/00_README.md`** (Phase 2: Payment & Subscriptions)

---

**Status Update:**
- [ ] Nicht gestartet
- [🔄] In Arbeit
- [✅] Abgeschlossen
- [⚠️] Blockiert (Grund: _______________)

---

## 🎉 Phase 1 (Security) abgeschlossen!

Alle kritischen Sicherheitslücken sind behoben. Die App ist jetzt deutlich sicherer!

**Nächste Phase:** Payment & Subscriptions

