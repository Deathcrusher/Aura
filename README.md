# Aura – Voice‑Only (Web & Mobile)

Die App ist auf Sprachchat fokussiert (kein Schreibchat). Der Mikrofon‑Button startet die Aufnahme; Stop beendet und schickt die transkribierte Eingabe an die KI. Funktioniert im Browser (Desktop/Mobile). Für Mobile benötigst du HTTPS oder `http://localhost`.

## Schnellstart (Lokal)
- Voraussetzungen: Node 18 (siehe `.nvmrc`), npm
- Installieren: `npm install`
- Env setzen: `.env.local` mit mindestens
  - `VITE_API_KEY=YOUR_GEMINI_API_KEY`
  - Optional: `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` (sonst Demo‑Modus)
- Starten: `npm run dev`

Ohne `VITE_API_KEY` läuft die App im Demo‑Modus: Aufnahme funktioniert, Antworten sind Platzhalter.

### Kompatibilität zum alten Projekt
- Früheres Projekt nutzte teils `GEMINI_API_KEY`/`process.env.API_KEY`. In dieser App wird client‑seitig `VITE_API_KEY` erwartet.
- Damit bestehende `.env.local` Dateien weiter funktionieren, mappt `vite.config.ts` automatisch auch `GEMINI_API_KEY`/`API_KEY` nach `VITE_API_KEY` (falls gesetzt). Empfehlung: künftig `VITE_API_KEY` verwenden.

### Wenn Sprache nicht funktioniert
- Prüfe, ob ein gültiger API‑Key hinterlegt ist (`.env.local` → `VITE_API_KEY`).
- Stelle sicher, dass Mikrofonrechte erlaubt sind und du über HTTPS oder `http://localhost` testest.
- Falls die Live‑Verbindung (Gemini Live) nicht verfügbar ist (z. B. fehlende Berechtigung/Modell), fällt die App jetzt automatisch auf lokale Erkennung (Web Speech API) bzw. Aufnahme + Transkription zurück.

## Deployment (Vercel)
1. Repo importieren
2. Env‑Variablen setzen (`VITE_API_KEY`, optional Supabase)
3. Deploy

## Hinweise zur Spracheingabe
- Chrome/Edge Desktop: Web Speech API wird genutzt, wo verfügbar.
- Mobile und Browser ohne Speech API: Fallback via MediaRecorder + Gemini‑Transkription.
- Erfordert Mikrofonfreigabe und sichere Herkunft (HTTPS/localhost).

## Voice‑Live Architektur & Versionen
- SDK: `@google/genai@^1.27.0` (bewährte Version für Live‑Audio)
- Modell: `gemini-2.5-flash-native-audio-preview-09-2025`
- Audio‑Eingang: 16 kHz PCM (Mono), Ausgang: 24 kHz PCM (Mono)
- Env: `VITE_API_KEY` (Kompat‑Mapping für `GEMINI_API_KEY`/`API_KEY` in `vite.config.ts`)
- Details & Upgrade‑Hinweise: siehe `docs/VOICE_LIVE.md`

## Features
- Voice‑Only Chat (STT + TTS)
- KI‑Antworten (Gemini 1.5)
- Demo‑Modus ohne Backend
- Hell/Dunkel‑Modus, Sitzungsverlauf, Mehrsprachig (DE/EN)

Version: 2.0.1  
Letztes Update: 2025‑11‑04
