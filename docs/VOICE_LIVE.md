# Voice Live: Architektur & Vorgaben

Diese App nutzt Live‑Sprachverarbeitung (STT/TTS) über Google Gemini Live und fällt robust auf lokale Erkennung zurück. Dieses Dokument pinnt die exakten Versionen/Modelle und erklärt die Stellen im Code, die relevant sind – damit der Flow stabil bleibt und Upgrades bewusst erfolgen.

## Kernentscheidungen

- SDK‑Version: `@google/genai@^1.27.0` (siehe package.json). Diese Version ist mit unserem Audio‑Pfad erprobt und liefert zuverlässig Live‑Transkriptionen.
- Live‑Modell: `gemini-2.5-flash-native-audio-preview-09-2025` (siehe `src/App.tsx`). Dieses Modell hat sich im alten Projekt bewährt.
- Audio‑Übertragung: Wir senden 16 kHz PCM‑Chunks an die Live‑Session. Primär über `{ media: { data, mimeType } }`, mit Fallback auf `{ inlineData }`, um unterschiedliche SDK‑Erwartungen abzudecken.
- Fallbacks: Wenn die Live‑Verbindung keine Aktivität zeigt, fallen wir automatisch auf Web Speech API (Chrome/Edge) bzw. auf MediaRecorder + nachgelagerte Transkription zurück.

## Dateien & Ankerstellen

- Live‑Start & Modellwahl: `src/App.tsx` – in `handleStartVoiceSession`
  - Modell‑ID: `'gemini-2.5-flash-native-audio-preview-09-2025'`
  - Audio‑Einspeisung: `sendRealtimeInput({ media: createBlob(inputData) })` mit Inline‑Fallback
  - Aktivitäts‑Watchdog (5 s) → lokaler Fallback
- Audio‑Hilfen: `src/utils/audio.ts`
  - `createBlob(Float32Array)` erzeugt das Payload‑Objekt `{ data, mimeType }` (PCM 16 kHz) für die Live‑API.
- Env‑Mapping (API‑Key): `vite.config.ts`
  - Mappt `VITE_API_KEY` sowie historische `GEMINI_API_KEY`/`API_KEY` auf `import.meta.env.VITE_API_KEY`.
- Version‑Pin: `package.json`
  - `"@google/genai": "^1.27.0"`

## Erwartete Audio‑Parameter

- Eingabe: 16 kHz, Mono, PCM Int16 (über `createScriptProcessor(4096, 1, 1)` und `createBlob`)
- Ausgabe: 24 kHz, Mono, PCM → Wiedergabe via `decodeAudioData(..., 24000, 1)`

## Fallback‑Logik (Kurz)

1) Live‑Session öffnet → Watchdog startet (5 s)
2) Sobald Live‑Meldungen eintreffen (Transkript oder Audio), wird der Watchdog zurückgesetzt
3) Bleibt Live stumm, starten wir:
   - Web Speech API (wo verfügbar) → bei Ergebnis: direkt Anfrage absenden
   - sonst MediaRecorder → Aufnahme bis „Stopp“, dann Transkription über Gemini 1.5

## Upgrades & Änderungen

- Upgrade `@google/genai` ≥ 1.28.0:
  - Prüfen, ob `sendRealtimeInput` weiterhin `{ media: ... }` akzeptiert oder auf `{ inlineData: ... }` umzustellen ist.
  - Nach Änderung: Manuell testen, ob `inputTranscription`/`outputTranscription` sowie `modelTurn.parts[0].inlineData.data` geliefert werden.
- Modellwechsel (z. B. `gemini-live-2.5-flash-preview`):
  - Nur nach Test übernehmen. Wenn keine Live‑Transkriptionen oder Audiodaten kommen, sofort zurück auf das oben gepinnte Modell wechseln.

## Umgebungsvariablen

- Empfohlen: `.env.local` mit `VITE_API_KEY=...`
- Kompatibel: `GEMINI_API_KEY` oder `API_KEY` – werden via `vite.config.ts` gemappt.
- Sichere Herkunft: HTTPS oder `http://localhost`, Mikrofonrechte müssen erlaubt sein.

## Troubleshooting Schnellcheck

- Keine Reaktion im Live‑Modus: API‑Key prüfen, Modell/SDK nicht geändert? Console‑Logs ansehen (Live‑Fehler/Fallback‑Pfad).
- Browser ohne Web Speech API (z. B. Firefox): Aufnahme → „Stopp“ klicken → dann erfolgt Transkription.

