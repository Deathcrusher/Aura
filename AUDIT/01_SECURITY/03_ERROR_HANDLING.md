# 🔒 03 - Error Handling & Tracking

**Status:** [ ] Nicht gestartet  
**Priorität:** 🔴 KRITISCH  
**Geschätzter Aufwand:** 2-3 Stunden  
**Blockiert:** Nichts

## 🎯 Ziel

Implementiere professionelles Error Handling mit Sentry für Error Tracking. User sollen keine Stack Traces mehr sehen.

## 🔍 Aktuelles Problem

### ❌ Was aktuell falsch ist:
- ErrorBoundary zeigt Stack Traces an User
- Keine Error Tracking
- Fehler werden nicht geloggt
- Keine Alerts bei kritischen Fehlern
- Keine Performance Monitoring

### ✅ Was wir erreichen wollen:
- User-freundliche Fehlermeldungen
- Automatisches Error Tracking (Sentry)
- Error Alerts
- Performance Monitoring
- Source Maps für Production

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Sentry Account erstellen

**1.1 Sentry Account erstellen:**

1. Gehe zu https://sentry.io/signup/
2. Erstelle einen Account (kostenlos für kleine Projekte)
3. Erstelle ein neues Projekt:
   - Platform: `JavaScript - React`
   - Project Name: `Aura`
   - Team: Wähle oder erstelle ein Team

**1.2 DSN (Data Source Name) kopieren:**

Nach der Projekt-Erstellung wird dir ein DSN angezeigt. Kopiere diesen (sieht aus wie: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

**✅ Checkliste:**
- [ ] Sentry Account erstellt
- [ ] Projekt erstellt
- [ ] DSN kopiert

### Schritt 2: Sentry SDK installieren

```bash
# Installiere Sentry SDK
npm install @sentry/react
```

**✅ Checkliste:**
- [ ] Sentry SDK installiert
- [ ] package.json aktualisiert

### Schritt 3: Sentry initialisieren

**3.1 Erstelle Sentry Config:**

Erstelle die Datei: `src/lib/sentry.ts`

```typescript
import * as Sentry from "@sentry/react";

export function initSentry() {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not set - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // 100% in development, reduce in production (e.g., 0.1)
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Environment
    environment: import.meta.env.MODE,
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Filter out sensitive information
      if (event.request) {
        // Remove API keys from URLs
        if (event.request.url) {
          event.request.url = event.request.url.replace(/api[_-]?key=[^&]*/gi, 'api_key=***');
        }
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['api-key'];
        }
      }
      return event;
    },
  });
}
```

**3.2 Initialisiere Sentry in main.tsx:**

```typescript
// src/main.tsx
import { initSentry } from './lib/sentry';

// Initialize Sentry BEFORE React
initSentry();

// Rest of your code...
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// ...
```

**✅ Checkliste:**
- [ ] `sentry.ts` erstellt
- [ ] Sentry in `main.tsx` initialisiert
- [ ] DSN aus Environment Variable gelesen

### Schritt 4: Environment Variables setzen

**4.1 Lokal (.env.local):**

```bash
# Füge hinzu zu .env.local
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**4.2 Vercel:**

1. Gehe zu Vercel Dashboard → Project Settings → Environment Variables
2. Füge hinzu:
   - `VITE_SENTRY_DSN` = dein Sentry DSN

**✅ Checkliste:**
- [ ] VITE_SENTRY_DSN in .env.local gesetzt
- [ ] VITE_SENTRY_DSN in Vercel gesetzt

### Schritt 5: ErrorBoundary verbessern

**5.1 Erstelle verbesserte ErrorBoundary:**

Ersetze `src/components/ErrorBoundary.tsx`:

```typescript
import React from 'react';
import * as Sentry from '@sentry/react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      extra: {
        errorInfo,
      },
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.handleReset} />;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Etwas ist schiefgelaufen
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Entschuldigung, es ist ein Fehler aufgetreten. Unser Team wurde benachrichtigt und arbeitet an einer Lösung.
            </p>
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Erneut versuchen
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Zur Startseite
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded text-xs">
                <summary className="cursor-pointer font-bold mb-2">Error Details (Dev Only)</summary>
                <pre className="whitespace-pre-wrap overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**✅ Checkliste:**
- [ ] ErrorBoundary verbessert
- [ ] Sentry Integration
- [ ] User-freundliche Fehlermeldungen
- [ ] Retry-Funktionalität
- [ ] Error Details nur in Development

### Schritt 6: Error Tracking in API Calls

**6.1 Wrapp API Calls mit Error Handling:**

Erstelle `src/lib/error-handler.ts`:

```typescript
import * as Sentry from '@sentry/react';

export interface ErrorContext {
  userId?: string;
  action?: string;
  [key: string]: any;
}

export function captureError(error: Error | unknown, context?: ErrorContext) {
  console.error('Error:', error, context);

  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context?.action || 'unknown',
      },
    });
  } else {
    Sentry.captureMessage(String(error), {
      level: 'error',
      extra: context,
    });
  }
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    captureError(error, context);
    return null;
  }
}
```

**6.2 Verwende in API Calls:**

```typescript
// Vorher
try {
  const response = await supabase.from('profiles').select('*');
} catch (error) {
  console.error(error);
}

// Nachher
import { withErrorHandling, captureError } from './lib/error-handler';

const response = await withErrorHandling(
  async () => await supabase.from('profiles').select('*'),
  { action: 'fetchProfile', userId: user?.id }
);

if (!response) {
  // Handle error (already logged to Sentry)
  return;
}
```

**✅ Checkliste:**
- [ ] Error Handler Utility erstellt
- [ ] API Calls mit Error Handling gewrappt
- [ ] Context wird mitgeloggt

### Schritt 7: Source Maps für Production

**7.1 Installiere Sentry CLI:**

```bash
npm install --save-dev @sentry/cli
```

**7.2 Erstelle Build Script:**

Passe `package.json` an:

```json
{
  "scripts": {
    "build": "vite build",
    "build:sentry": "vite build && sentry-cli sourcemaps inject dist && sentry-cli sourcemaps upload dist"
  }
}
```

**7.3 Erstelle Sentry Config:**

Erstelle `.sentryclirc`:

```ini
[auth]
token=your_sentry_auth_token

[defaults]
org=your_org_slug
project=aura
```

**7.4 Passe vite.config.ts an:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    // Sentry Plugin für Source Maps
    sentryVitePlugin({
      org: "your-org-slug",
      project: "aura",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true, // Enable source maps
    // ...
  },
})
```

**✅ Checkliste:**
- [ ] Sentry CLI installiert
- [ ] Build Script angepasst
- [ ] Source Maps aktiviert
- [ ] Sentry Config erstellt

### Schritt 8: User Context setzen

**8.1 Setze User Context in App.tsx:**

```typescript
import * as Sentry from '@sentry/react';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  // ...
}
```

**✅ Checkliste:**
- [ ] User Context wird gesetzt
- [ ] User wird bei Logout entfernt

### Schritt 9: Testing

**9.1 Test Error Tracking:**

```typescript
// Teste Error Tracking
import { captureError } from './lib/error-handler';

// Simuliere einen Fehler
captureError(new Error('Test error'), {
  action: 'test',
  userId: 'test-user',
});
```

**9.2 Prüfe Sentry Dashboard:**

1. Gehe zu Sentry Dashboard
2. Prüfe ob Fehler angekommen sind
3. Prüfe ob User Context gesetzt ist
4. Prüfe ob Source Maps funktionieren

**✅ Checkliste:**
- [ ] Test Error gesendet
- [ ] Fehler in Sentry Dashboard sichtbar
- [ ] User Context vorhanden
- [ ] Source Maps funktionieren

### Schritt 10: Alerts konfigurieren

**10.1 Erstelle Alerts in Sentry:**

1. Gehe zu Sentry Dashboard → Alerts
2. Erstelle neuen Alert:
   - Trigger: "An error is seen"
   - Conditions: "more than 10 times in 1 hour"
   - Actions: Email an deine Email-Adresse

**✅ Checkliste:**
- [ ] Alerts erstellt
- [ ] Email-Benachrichtigungen aktiviert
- [ ] Slack/Discord Integration (optional)

## 🐛 Troubleshooting

### Problem: "Sentry DSN not set"

**Lösung:**
- Prüfe ob VITE_SENTRY_DSN in .env.local gesetzt ist
- Prüfe ob VITE_SENTRY_DSN in Vercel gesetzt ist
- Prüfe ob DSN korrekt ist

### Problem: "Source Maps nicht verfügbar"

**Lösung:**
- Prüfe ob `sourcemap: true` in vite.config.ts gesetzt ist
- Prüfe ob Sentry Plugin korrekt konfiguriert ist
- Prüfe ob Source Maps hochgeladen wurden

## ✅ Finale Checkliste

- [ ] Sentry Account erstellt
- [ ] Sentry SDK installiert
- [ ] Sentry initialisiert
- [ ] Environment Variables gesetzt
- [ ] ErrorBoundary verbessert
- [ ] Error Handling in API Calls
- [ ] Source Maps konfiguriert
- [ ] User Context gesetzt
- [ ] Testing abgeschlossen
- [ ] Alerts konfiguriert
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
**`04_AUTH_SECURITY.md`**

---

**Status Update:**
- [ ] Nicht gestartet
- [🔄] In Arbeit
- [✅] Abgeschlossen
- [⚠️] Blockiert (Grund: _______________)

