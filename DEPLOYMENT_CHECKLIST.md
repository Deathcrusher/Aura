# 🚀 Deployment Checklist für Vercel

## ✅ Was funktioniert jetzt:

### 1. **Home View als Start**
- App startet auf der Home-Seite (nicht mehr direkt auf Chat)
- Zeigt "Start Conversation" Button

### 2. **Zwei Chat-Modi implementiert**
- **Text-Chat**: Nutzt `gemini-2.5-pro` für bessere Qualität
- **Voice-Chat**: Nutzt `gemini-2.5-flash-native-audio-preview-09-2025` für Live-Audio

### 3. **Session Management**
- Sessions werden erstellt BEVOR die View wechselt
- Funktioniert auch ohne eingeloggten User (lokale Sessions)
- Sessions werden nur in DB gespeichert wenn User eingeloggt ist

### 4. **Umfangreiche Debug-Logs**
- Console-Logs zeigen genau was passiert
- API Key Check wird geloggt
- Session-Erstellung wird geloggt
- View-Wechsel werden geloggt

## 🔧 Vercel Setup:

### Umgebungsvariablen in Vercel setzen:

1. Gehe zu deinem Vercel Projekt → Settings → Environment Variables
2. Füge hinzu:
   ```
   VITE_API_KEY = [Dein Gemini API Key]
   ```
3. Optional (für Auth/DB):
   ```
   VITE_SUPABASE_URL = [Deine Supabase URL]
   VITE_SUPABASE_ANON_KEY = [Dein Supabase Anon Key]
   ```

## 📝 So funktioniert der Flow:

### Text-Chat starten:
1. User klickt "Start Conversation" auf Home
2. `handleNewChat(ChatMode.TEXT)` wird aufgerufen
3. Session mit Mode TEXT wird erstellt
4. View wechselt zu Chat
5. Text-Input-Feld erscheint
6. User tippt Nachricht → gemini-2.5-pro antwortet

### Voice-Chat starten:
1. User geht zur Chat View (ohne Session)
2. Klickt "Sprach-Sitzung starten"
3. Session mit Mode VOICE wird erstellt
4. Mikrofon wird aktiviert
5. Live-Audio-Stream mit gemini-2.5-flash-native-audio-preview-09-2025

## 🐛 Debug in Production:

Öffne Browser Console (F12) auf deiner Vercel-URL und schaue nach:

```
🔑 API Key check: API Key found
✅ Gemini AI initialized successfully
🚀🚀🚀 handleNewChat called with mode: text
👤 No user, creating local Text session
📝 Created local session: {...}
✅✅✅ Local Text session created and view switched to chat
📱 ChatView rendered - activeSession: {...}
📱 isIdle: true
```

Falls kein API Key:
```
❌ NO API KEY - AI features will not work!
⚠️ No valid API key found. Set VITE_API_KEY in .env file
```

## 🔄 Nach Deployment:

1. Pushe Code zu GitHub
2. Vercel deployt automatisch
3. Öffne die Live-URL
4. Öffne Browser Console (F12)
5. Klicke "Start Conversation"
6. Prüfe Console-Logs

## ⚠️ Falls es nicht funktioniert:

**Check 1: API Key**
- Ist `VITE_API_KEY` in Vercel gesetzt?
- Console zeigt "API Key found"?

**Check 2: Button funktioniert?**
- Console zeigt `🚀🚀🚀 handleNewChat called`?
- Falls NEIN → JavaScript Error in Console?

**Check 3: Session erstellt?**
- Console zeigt `📝 Created local session`?
- Console zeigt `✅✅✅ Local ... session created`?

**Check 4: View gewechselt?**
- Console zeigt `📱 ChatView rendered`?
- `activeSession` ist nicht null?

**Check 5: Input-Feld sichtbar?**
- Console zeigt `isIdle: true`?
- Session mode ist `TEXT` oder `undefined`?

