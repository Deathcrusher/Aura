# Android APK Setup - Mikrofon-Berechtigung

## Option 1: Capacitor (Empfohlen)

### Schritt 1: Capacitor installieren

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

Wenn gefragt wird:
- **App name**: Aura
- **App ID**: com.aura.therapy
- **Web dir**: dist

### Schritt 2: Android-Projekt erstellen

```bash
npm run build
npx cap add android
npx cap sync
```

### Schritt 3: Android Manifest bearbeiten

Öffne `android/app/src/main/AndroidManifest.xml` und stelle sicher, dass folgende Berechtigungen vorhanden sind:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-feature android:name="android.hardware.microphone" android:required="false" />
    
    <application>
        <!-- ... deine Activity-Konfiguration ... -->
    </application>
</manifest>
```

### Schritt 4: APK bauen

```bash
npx cap open android
```

Dann in Android Studio:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Oder: Build → Generate Signed Bundle / APK

---

## Option 2: PWA Builder / TWA (Trusted Web Activity)

Wenn du PWA Builder oder ein ähnliches Tool verwendest:

### AndroidManifest.xml bearbeiten

Füge in deiner AndroidManifest.xml (normalerweise in `android/app/src/main/AndroidManifest.xml`) hinzu:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

### Web App Manifest aktualisieren

Stelle sicher, dass in deinem `index.html` oder einem separaten `manifest.json` folgendes steht:

```json
{
  "name": "Aura",
  "short_name": "Aura",
  "start_url": "/",
  "display": "standalone",
  "permissions": [
    "microphone"
  ]
}
```

---

## Option 3: Manuelle Android Manifest Bearbeitung

Wenn du die APK bereits erstellt hast und nur die Berechtigungen hinzufügen musst:

1. **APK entpacken** (mit einem Tool wie `apktool`)
2. **AndroidManifest.xml bearbeiten** und hinzufügen:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   ```
3. **APK neu signieren** und bauen

---

## Wichtige Hinweise

1. **Runtime-Berechtigungen**: Ab Android 6.0 (API 23) müssen Mikrofon-Berechtigungen zur Laufzeit angefordert werden. Die App sollte automatisch eine Berechtigungsanfrage zeigen.

2. **HTTPS erforderlich**: `getUserMedia()` funktioniert nur über HTTPS oder `localhost`. Stelle sicher, dass deine App HTTPS verwendet.

3. **Testen**: Nach dem Hinzufügen der Berechtigungen:
   - App neu installieren
   - Beim ersten Start sollte Android nach Mikrofon-Berechtigung fragen
   - In den App-Einstellungen sollte "Mikrofon" unter Berechtigungen erscheinen

---

## Troubleshooting

### Problem: "Mikrofon-Zugriff wurde verweigert"

**Lösung**: 
- Gehe zu Android Einstellungen → Apps → Aura → Berechtigungen → Mikrofon → Erlauben
- Oder deinstalliere und installiere die App neu

### Problem: App fragt nicht nach Berechtigung

**Lösung**: 
- Stelle sicher, dass `<uses-permission android:name="android.permission.RECORD_AUDIO" />` im AndroidManifest.xml steht
- Prüfe, ob die App die richtige Android-Version targetet (mindestens API 23)

### Problem: APK kann nicht gebaut werden

**Lösung**:
- Stelle sicher, dass Android SDK installiert ist
- Prüfe, ob alle Capacitor-Plugins korrekt installiert sind
- Führe `npx cap sync` aus, um die Konfiguration zu aktualisieren

