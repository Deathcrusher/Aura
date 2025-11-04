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

## Deployment (Vercel)
1. Repo importieren
2. Env‑Variablen setzen (`VITE_API_KEY`, optional Supabase)
3. Deploy

## Hinweise zur Spracheingabe
- Chrome/Edge Desktop: Web Speech API wird genutzt, wo verfügbar.
- Mobile und Browser ohne Speech API: Fallback via MediaRecorder + Gemini‑Transkription.
- Erfordert Mikrofonfreigabe und sichere Herkunft (HTTPS/localhost).

## Features
- Voice‑Only Chat (STT + TTS)
- KI‑Antworten (Gemini 1.5)
- Demo‑Modus ohne Backend
- Hell/Dunkel‑Modus, Sitzungsverlauf, Mehrsprachig (DE/EN)

Version: 2.0.1  
Letztes Update: 2025‑11‑04

