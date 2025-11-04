# Aura - AI-Therapie System mit Supabase

Aura ist eine KI-gestützte Therapie-Anwendung, die empathische Gespräche mit einem AI-Therapeuten ermöglicht. Die Anwendung nutzt Supabase für Backend-Services und Google Gemini für die KI-Konversation.

## ✨ Funktionen

- 🔐 **Authentifizierung**: Sicheres Login/Registrierung via Supabase Auth
- 💬 **AI-Gespräche**: Text-basierte Therapiesitzungen mit Google Gemini
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
- **Paketmanager**: pnpm

## 📋 Voraussetzungen

- Node.js 18+ und pnpm
- Supabase-Projekt (bereits konfiguriert)
- Google Gemini API-Schlüssel (optional für vollständige AI-Funktionalität)

## 🚀 Installation

1. **Abhängigkeiten installieren:**
```bash
pnpm install
```

2. **Gemini API-Schlüssel hinzufügen:**

Öffnen Sie die `.env`-Datei und fügen Sie Ihren Google Gemini API-Schlüssel hinzu:
```env
VITE_API_KEY=your_api_key_here
```

> **Hinweis**: Die Supabase-Credentials sind bereits konfiguriert. Ohne API-Schlüssel funktioniert die Anwendung mit Fallback-Antworten.

3. **Entwicklungsserver starten:**
```bash
pnpm dev
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
│   │   └── audio.ts        # Audio-Utilities
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
4. **Verlauf anzeigen**: Alle Sitzungen werden in der Sidebar angezeigt
5. **Profil anpassen**: Nutzen Sie die Sidebar-Menüs für weitere Funktionen

## 🔒 Sicherheit

- Authentifizierung über Supabase Auth
- Row Level Security auf allen Tabellen
- Sichere API-Key-Verwaltung via Environment-Variablen
- HTTPS für alle Produktions-Deployments

## 🚢 Deployment

```bash
# Build für Produktion
pnpm build

# Vorschau des Production-Builds
pnpm preview
```

Deploy den `dist`-Ordner auf Ihre bevorzugte Hosting-Plattform (Vercel, Netlify, etc.)

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
- Voice-Input-Funktionalität ist für zukünftige Entwicklung vorbereitet

## 🐛 Bekannte Einschränkungen

- Voice-Input noch nicht implementiert (nur Text-Chat verfügbar)
- Kognitive Verzerrungserkennung benötigt erweiterte AI-Integration
- Stimmungstracking und Ziele-Modals noch in Entwicklung

---

**Version**: 1.0.0  
**Entwickelt mit**: React + Supabase + Google Gemini  
**Letzte Aktualisierung**: 2025-11-04