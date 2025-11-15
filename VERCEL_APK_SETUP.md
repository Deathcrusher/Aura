# Vercel → APK Setup (Mediainn / PWA zu APK Tools)

## Was ich gemacht habe:

✅ **`public/manifest.json`** erstellt - Web App Manifest mit Mikrofon-Berechtigung
✅ **`index.html`** aktualisiert - Verweist auf das Manifest
✅ **`vercel.json`** aktualisiert - Serviert das Manifest korrekt
✅ **`metadata.json`** aktualisiert - Enthält alle benötigten Berechtigungen

## Nächste Schritte:

### 1. Auf Vercel deployen

```bash
git add .
git commit -m "Add microphone permissions for APK conversion"
git push
```

Oder einfach in Vercel: **Redeploy** auslösen

### 2. In Mediainn (oder deinem APK-Tool):

1. **Gehe zu deinem APK-Konvertierungs-Tool** (Mediainn, PWA Builder, etc.)
2. **Gib die Vercel-URL ein** (z.B. `https://deine-app.vercel.app`)
3. **Das Tool sollte automatisch:**
   - Das `manifest.json` finden
   - Die Mikrofon-Berechtigung erkennen
   - Diese in die AndroidManifest.xml der APK einfügen

### 3. APK herunterladen und testen:

1. **APK herunterladen** von deinem Tool
2. **Auf Android-Gerät installieren**
3. **Beim ersten Start** sollte Android nach Mikrofon-Berechtigung fragen
4. **"Erlauben" wählen**
5. **Mikrofon-Button testen** ✅

## Was im Manifest steht:

```json
{
  "permissions": ["microphone"],
  "features": ["microphone"]
}
```

Diese Einträge werden von APK-Konvertierungs-Tools automatisch in die AndroidManifest.xml übernommen.

## Falls es nicht funktioniert:

### Option 1: Prüfe, ob das Manifest erreichbar ist

Öffne im Browser: `https://deine-app.vercel.app/manifest.json`

Du solltest das JSON sehen. Falls nicht:
- Prüfe, ob `public/manifest.json` existiert
- Prüfe, ob Vercel neu deployed wurde

### Option 2: Manuell in Mediainn

Falls dein Tool die Berechtigungen nicht automatisch erkennt:
1. **Suche nach "Permissions" oder "Android Manifest"** in deinem Tool
2. **Füge manuell hinzu:**
   - Permission: `RECORD_AUDIO`
   - Feature: `android.hardware.microphone`

### Option 3: Prüfe die Console

Nach dem Installieren der APK:
1. Öffne Chrome auf Android
2. `chrome://inspect`
3. Finde deine App
4. Öffne Console
5. Schaue nach Fehlermeldungen

## Wichtig:

- ✅ **HTTPS erforderlich**: `getUserMedia()` funktioniert nur über HTTPS
- ✅ **Vercel verwendet automatisch HTTPS** - das ist gut!
- ✅ **Nach Änderungen**: Immer neu deployen auf Vercel, dann neue APK erstellen

## Testen:

1. **Deploy auf Vercel** ✅
2. **APK in Mediainn erstellen** (mit der neuen Vercel-URL)
3. **APK installieren** auf Android
4. **Mikrofon-Berechtigung erlauben** (wird automatisch abgefragt)
5. **Mikrofon-Button klicken** → Sollte jetzt funktionieren! 🎤

---

**Keine lokale Kompilierung nötig!** Alles läuft über Vercel. 🚀

