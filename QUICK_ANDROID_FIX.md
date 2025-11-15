# Schnell-Fix: Mikrofon-Berechtigung für Android APK

## Wenn du bereits eine APK hast:

### Option A: Mit Capacitor (Empfohlen - 5 Minuten)

```bash
# 1. Capacitor installieren
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Capacitor initialisieren (wenn noch nicht geschehen)
npx cap init

# 3. Build erstellen
npm run build

# 4. Android-Projekt erstellen/aktualisieren
npx cap add android
npx cap sync

# 5. Android Studio öffnen
npx cap open android
```

**In Android Studio:**
1. Öffne `android/app/src/main/AndroidManifest.xml`
2. Stelle sicher, dass diese Zeile vorhanden ist:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   ```
3. Build → Build Bundle(s) / APK(s) → Build APK(s)

---

### Option B: Manuell (Wenn du die APK-Source hast)

1. **Finde dein AndroidManifest.xml**
   - Normalerweise in: `android/app/src/main/AndroidManifest.xml`
   - Oder in deinem Build-Tool-Ordner

2. **Füge diese Zeile hinzu** (innerhalb von `<manifest>`):
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-feature android:name="android.hardware.microphone" android:required="false" />
   ```

3. **APK neu bauen**

---

### Option C: Wenn du ein Online-Tool verwendest (PWA Builder, etc.)

1. **Gehe zu deinem Build-Tool** (z.B. PWA Builder, Bubble.io, etc.)
2. **Suche nach "Permissions" oder "Android Manifest"**
3. **Füge hinzu:**
   - Permission: `RECORD_AUDIO`
   - Feature: `android.hardware.microphone` (optional)

4. **Neu bauen**

---

## Nach dem Fix testen:

1. **App deinstallieren** (falls bereits installiert)
2. **Neue APK installieren**
3. **App öffnen** → Beim ersten Start sollte Android nach Mikrofon-Berechtigung fragen
4. **"Erlauben" wählen**
5. **Mikrofon-Button testen**

---

## Falls es immer noch nicht funktioniert:

1. **Prüfe Android-Einstellungen:**
   - Einstellungen → Apps → Aura → Berechtigungen → Mikrofon → Erlauben

2. **Prüfe die Console-Logs:**
   - Öffne Chrome auf dem Android-Gerät
   - chrome://inspect → Finde deine App → Console öffnen
   - Schaue nach Fehlermeldungen

3. **Stelle sicher, dass HTTPS verwendet wird:**
   - `getUserMedia()` funktioniert nur über HTTPS oder localhost
   - In Capacitor: `capacitor.config.ts` sollte `androidScheme: 'https'` haben

---

## Wichtig:

- **Runtime-Berechtigungen**: Ab Android 6.0 müssen Mikrofon-Berechtigungen zur Laufzeit angefordert werden
- **HTTPS erforderlich**: Die Web-API `getUserMedia()` funktioniert nur über sichere Verbindungen
- **App neu installieren**: Nach Änderungen am Manifest muss die App neu installiert werden

