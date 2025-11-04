# Aura - AI-Therapie System mit Supabase

Aura ist eine KI-gestützte Therapie-Anwendung, die empathische Gespräche mit einem AI-Therapeuten ermöglicht. Die Anwendung nutzt Supabase für Backend-Services und Google Gemini für die KI-Konversation.

## ✨ Funktionen

- 🔐 **Authentifizierung**: Sicheres Login/Registrierung via Supabase Auth
- 💬 **AI-Gespräche**: Text-basierte Therapiesitzungen mit Google Gemini
- 🎤 **Sprach-Chat**: Sprechen Sie direkt mit der AI (Sprach-zu-Text und Text-zu-Sprache)
- 📊 **Sitzungsverlauf**: Speicherung und Anzeige vergangener Gespräche
- 👤 **Benutzerprofile**: Personalisierte Profile mit Präferenzen
- 🎯 **Ziele-Tracking**: Setzen und Verfolgen persönlicher Ziele
- 📝 **Tagebuch**: Persönliche Journaleinträge
- 💭 **Stimmungstracking**: Erfassung der täglichen Stimmung
- 🧠 **Kognitive Verzerrungen**: Erkennung von Denkmustern
- 🌍 **Mehrsprachig**: Deutsch und Englisch unterstützt

## 🛠 Technologie-Stack

- **Frontend**: React 18.3 + TypeScript + Vite 6.0
- **Styling**: Tailwind CSS 3.4
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini API
- **Sprache**: Web Speech API (Browser-nativ)
- **Paketmanager**: npm

## 📋 Voraussetzungen

- Node.js 18+ und npm
- Supabase-Projekt (bereits konfiguriert)
- Google Gemini API-Schlüssel (optional für vollständige AI-Funktionalität)

## 🚀 Installation

1. **Abhängigkeiten installieren:**
```bash
npm install
```

2. **Gemini API-Schlüssel hinzufügen:**

Öffnen Sie die `.env`-Datei und fügen Sie Ihren Google Gemini API-Schlüssel hinzu:
```env
VITE_API_KEY=your_api_key_here
```

> **Hinweis**: Die Supabase-Credentials sind bereits konfiguriert. Ohne API-Schlüssel funktioniert die Anwendung mit Fallback-Antworten.

3. **Entwicklungsserver starten:**
```bash
npm run dev
```

Die Anwendung läuft auf `http://localhost:5173`

## 📦 Projekt-Struktur

```
aura-supabase/
├── src/
│   ├── components/         # React-Komponenten
│   │   ├── AuthScreen.tsx  # Login/Registrierung
│   │   ├── Onboarding.tsx  # Ersteinrichtung
│   │   ├── ChatView.tsx    # Chat-Interface
│   │   ├── Icons.tsx       # SVG-Icons
│   │   └── ErrorBoundary.tsx
│   ├── contexts/           # React Context
│   │   └── AuthContext.tsx # Authentifizierungs-State
│   ├── lib/                # Utilities
│   │   ├── supabase.ts     # Supabase Client
│   │   ├── database.ts     # Datenbank-Operationen
│   │   └── translations.ts # Übersetzungen (DE/EN)
│   ├── utils/
│   │   ├── audio.ts        # Audio-Utilities
│   │   └── voice.ts        # Sprach-Services (Speech Recognition/TTS)
│   ├── types.ts            # TypeScript-Typen
│   ├── App.tsx             # Hauptkomponente
│   └── main.tsx            # Einstiegspunkt
├── .env                    # Environment-Variablen
└── package.json
```

## 🗄️ Datenbank-Schema

Das Projekt verwendet folgende Supabase-Tabellen:

- **profiles**: Benutzerprofile mit Einstellungen
- **chat_sessions**: Therapie-Sitzungen
- **transcript_entries**: Einzelne Nachrichten
- **aura_memory**: Langzeit-Erinnerungen der AI
- **goals**: Benutzerziele
- **mood_entries**: Stimmungseinträge
- **journal_entries**: Tagebucheinträge
- **cognitive_distortions**: Erkannte Denkmuster

Alle Tabellen haben Row Level Security (RLS) Policies für sichere Multi-User-Nutzung.

## 🔑 API-Schlüssel erhalten

### Google Gemini API-Schlüssel

1. Besuchen Sie [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Erstellen Sie einen neuen API-Schlüssel
3. Fügen Sie ihn in die `.env`-Datei ein

## 🎨 Verwendung

1. **Registrierung**: Erstellen Sie ein Konto mit E-Mail und Passwort
2. **Onboarding**: Geben Sie Ihren Namen an und wählen Sie Sprache/Stimme
3. **Gespräch starten**: Klicken Sie auf "Neues Gespräch" und beginnen Sie zu chatten
4. **Sprach-Chat**: Klicken Sie auf das Mikrofon-Symbol für Spracheingabe
5. **Verlauf anzeigen**: Alle Sitzungen werden in der Sidebar angezeigt
6. **Profil anpassen**: Nutzen Sie die Sidebar-Menüs für weitere Funktionen

## 🎤 Sprach-Funktionen

- **Spracheingabe**: Browser-basierte Spracherkennung (Chrome, Edge, Safari)
- **Audio-Ausgabe**: Text-zu-Sprache für AI-Antworten
- **Sprachen**: Deutsch (de-DE) und Englisch (en-US)
- **Audio-Visualisierung**: Echtzeit-Feedback während der Aufnahme

## 🔒 Sicherheit

- Authentifizierung über Supabase Auth
- Row Level Security auf allen Tabellen
- Sichere API-Key-Verwaltung via Environment-Variablen
- HTTPS für alle Produktions-Deployments

## 🚢 Deployment

### Vercel Deployment

```bash
# Build für Produktion
npm run build

# Vorschau des Production-Builds
npm run preview
```

Das Repository ist für Vercel-Deployment optimiert:
- `vercel.json` konfiguriert für Vite-Builds
- Environment Variables werden über Vercel Dashboard gesetzt
- Automatisches Deployment bei Git-Push

### Environment Variables für Vercel

Setzen Sie folgende Environment Variables in Ihrem Vercel Dashboard:
```
VITE_SUPABASE_URL=https://swentdldrcmemkisuqcg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_KEY=your_gemini_api_key_here
```

## 🧪 Entwicklung

- **TypeScript**: Strenge Type-Checking für Stabilität
- **ESLint**: Code-Qualitätsstandards
- **Hot Module Replacement**: Schnelle Entwicklung mit Vite

## 📝 Lizenz

Dieses Projekt ist für persönliche Verwendung und Entwicklungszwecke.

## 🤝 Mitwirken

Das ist ein internes Projekt. Bei Fragen wenden Sie sich an den Projektadministrator.

## 💡 Hinweise

- Die Anwendung benötigt eine aktive Internetverbindung für Supabase und Gemini API
- Ohne API-Schlüssel funktioniert die App mit einfachen Fallback-Antworten
- Voice-Input benötigt moderne Browser mit Web Speech API-Unterstützung

## 🐛 Bekannte Einschränkungen

- Kognitive Verzerrungserkennung benötigt erweiterte AI-Integration
- Stimmungstracking und Ziele-Modals noch in Entwicklung
- Voice-Input funktioniert am besten in Chrome/Edge

---

**Version**: 1.1.0  
**Entwickelt mit**: React + Supabase + Google Gemini + Web Speech API  
**Letzte Aktualisierung**: 2025-11-04