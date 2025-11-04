# 🤖 AURA - AI Therapy Bot

**AURA** ist eine fortschrittliche KI-gestützte Therapie-Plattform, die mit **Supabase** für echte Benutzer und persistente Datenspeicherung entwickelt wurde.

## ✨ Features

- 🔐 **Benutzerauthentifizierung** - Registrierung, Login, sichere Sessions
- 🗣️ **AI-Gespräche** - Integriert mit Google Gemini für empathische Therapiegespräche
- 💾 **Datenpersistenz** - Alle Gespräche, Ziele und Stimmungen werden sicher in der Cloud gespeichert
- 🏥 **Therapie-Features:**
  - Chat-Sitzungen mit Verlauf
  - Stimmungsverfolgung (Mood Journal)
  - Ziele setzen und verfolgen
  - Tagebuch-Einträge
  - Kognitive Verzerrungserkennung
- 🌍 **Mehrsprachig** - Deutsch und Englisch
- 🎨 **Moderne UI** - Responsives Design mit Tailwind CSS
- 🔒 **Datenschutz** - Row Level Security (RLS) für Benutzerdaten

## 🚀 Live Demo

**Deployed Version:** [https://76me7dtqnb9q.space.minimax.io](https://76me7dtqnb9q.space.minimax.io)

## 🛠️ Setup & Installation

### 1. Repository klonen
```bash
git clone https://github.com/Deathcrusher/AURA.git
cd AURA
```

### 2. Dependencies installieren
```bash
npm install
# oder
pnpm install
```

### 3. Umgebungsvariablen einrichten

Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (Optional - für vollständige AI-Funktionalität)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### Supabase Setup:
1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Kopiere die URL und den anon key aus den Projekteinstellungen
4. Führe die SQL-Scripte aus dem `supabase/` Ordner aus, um die Datenbank zu erstellen

#### Google Gemini API (Optional):
1. Gehe zu [Google AI Studio](https://aistudio.google.com)
2. Erstelle einen API-Schlüssel
3. Füge ihn als `VITE_GEMINI_API_KEY` hinzu

### 4. Datenbank Setup

Führe die folgenden SQL-Scripte in deiner Supabase-Konsole aus:

```sql
-- Führe alle .sql Dateien aus dem supabase/tables/ Ordner aus
-- Dann die Migrationen aus supabase/migrations/
```

Die wichtigsten Tabellen:
- `profiles` - Benutzerprofile
- `chat_sessions` - Therapiesitzungen
- `transcript_entries` - Gesprächsverlauf
- `aura_memory` - AI-Gedächtnis für jeden Benutzer
- `goals` - Benutzerziele
- `mood_entries` - Stimmungseinträge
- `journal_entries` - Tagebucheinträge
- `cognitive_distortions` - Erkannte Denkmuster

### 5. Entwicklungsserver starten
```bash
npm run dev
# oder
pnpm dev
```

Die App läuft auf `http://localhost:5173`

### 6. Produktions-Build
```bash
npm run build
# oder
pnpm build
```

## 📁 Projektstruktur

```
src/
├── components/          # React-Komponenten
│   ├── AuthScreen.tsx   # Login/Registrierung
│   ├── ErrorBoundary.tsx
│   ├── Icons.tsx        # SVG-Icons
│   └── ...
├── contexts/           # React Contexts
│   └── AuthContext.tsx # Authentifizierung
├── lib/                # Utilities
│   ├── supabase.ts     # Supabase-Client
│   ├── database.ts     # Datenbank-Operationen
│   └── translations.ts # Übersetzungen
├── types.ts            # TypeScript-Definitionen
├── App.tsx             # Hauptkomponente
└── main.tsx            # Einstiegspunkt

supabase/
├── tables/             # SQL-Tabellendefinitionen
├── migrations/         # Datenbank-Migrationen
└── functions/          # Edge Functions (optional)
```

## 🔧 Technologie-Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **AI:** Google Gemini Pro
- **State Management:** React Context + Hooks
- **Deployment:** MiniMax Platform

## 🌟 Key Features im Detail

### Benutzerauthentifizierung
- Sichere Registrierung und Login
- Automatische Profilererstellung
- Session-Management

### AI-Therapiegespräche
- Contextually aware conversations mit Gemini AI
- Speicherung des Gesprächsverlaufs
- Automatische Sequenzierung der Nachrichten

### Datenpersistenz
- Alle Benutzerdaten werden sicher in Supabase gespeichert
- Row Level Security (RLS) für Datenschutz
- Real-time Synchronisation

### Responsive Design
- Mobile-first Ansatz
- Dark/Light Mode Unterstützung
- Moderne, therapeutische UI

## 🔐 Sicherheit

- **Row Level Security (RLS)** für alle Tabellen aktiviert
- Benutzer können nur auf ihre eigenen Daten zugreifen
- Sichere API-Schlüssel-Handhabung
- HTTPS-Verschlüsselung für alle Verbindungen

## 🚧 Nächste Schritte

- [ ] Spracheingabe-Integration (Speech-to-Text)
- [ ] Stimmausgabe für AI-Antworten (Text-to-Speech)
- [ ] Erweiterte Mood-Tracking-Visualisierungen
- [ ] Goals & Journal Modal-Implementierungen
- [ ] Voice-Features für Therapiesitzungen
- [ ] Admin-Dashboard für Therapeuten

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz veröffentlicht. Siehe `LICENSE` für Details.

## 🆘 Support

Für Fragen oder Probleme:
1. Öffne ein Issue auf GitHub
2. Überprüfe die Supabase-Konfiguration
3. Stelle sicher, dass alle Umgebungsvariablen korrekt gesetzt sind

---

**AURA** - Deine AI-gestützte Begleiterin für mentales Wohlbefinden 🧠💙