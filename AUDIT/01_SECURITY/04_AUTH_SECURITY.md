# 🔒 04 - Authentication Security

**Status:** [ ] Nicht gestartet  
**Priorität:** 🔴 KRITISCH  
**Geschätzter Aufwand:** 1-2 Stunden  
**Blockiert:** Nichts

## 🎯 Ziel

Verbessere die Authentication Security durch aktivierte Leaked Password Protection, Session Management und weitere Sicherheitsfeatures.

## 🔍 Aktuelles Problem

### ❌ Was aktuell fehlt:
- Leaked Password Protection ist DEAKTIVIERT
- Keine Session Timeout Konfiguration
- Keine Device Management
- Keine MFA (Multi-Factor Authentication)

### ✅ Was wir erreichen wollen:
- Leaked Password Protection aktiviert
- Session Management optimiert
- Device Management
- MFA Support (optional)

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Leaked Password Protection aktivieren

**1.1 Supabase Dashboard öffnen:**

1. Gehe zu https://supabase.com/dashboard
2. Wähle dein Projekt "Aura"
3. Gehe zu Authentication → Settings → Password

**1.2 Leaked Password Protection aktivieren:**

1. Scrolle zu "Leaked Password Protection"
2. Aktiviere "Enable leaked password protection"
3. Speichere die Änderungen

**✅ Checkliste:**
- [ ] Leaked Password Protection aktiviert
- [ ] Änderungen gespeichert

### Schritt 2: Password Policy konfigurieren

**2.1 Password Requirements:**

In Supabase Dashboard → Authentication → Settings → Password:

1. **Minimum Length:** 8 Zeichen (empfohlen: 12)
2. **Require Uppercase:** Aktivieren
3. **Require Lowercase:** Aktivieren
4. **Require Numbers:** Aktivieren
5. **Require Special Characters:** Optional (kann UX beeinträchtigen)

**✅ Checkliste:**
- [ ] Password Policy konfiguriert
- [ ] Mindestlänge gesetzt
- [ ] Anforderungen aktiviert

### Schritt 3: Session Management konfigurieren

**3.1 Session Timeout:**

In Supabase Dashboard → Authentication → Settings → Sessions:

1. **JWT Expiry:** 3600 Sekunden (1 Stunde) - anpassen nach Bedarf
2. **Refresh Token Rotation:** Aktivieren
3. **Refresh Token Reuse Detection:** Aktivieren

**3.2 Session Persistence:**

In `src/lib/supabase.ts` (bereits vorhanden, aber prüfen):

```typescript
supabaseClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Bereits vorhanden - gut!
    // Session Timeout Handling
    storage: window.localStorage,
    storageKey: 'aura-auth-token',
  },
})
```

**✅ Checkliste:**
- [ ] Session Timeout konfiguriert
- [ ] Refresh Token Rotation aktiviert
- [ ] Session Persistence konfiguriert

### Schritt 4: Device Management implementieren

**4.1 Erstelle Device Tracking Tabelle:**

```sql
-- Erstelle devices Tabelle
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  user_agent TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_name)
);

-- RLS aktivieren
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Policy: User können nur ihre eigenen Devices sehen
CREATE POLICY "Users can view own devices"
ON public.user_devices
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Policy: User können ihre eigenen Devices verwalten
CREATE POLICY "Users can manage own devices"
ON public.user_devices
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);
```

**4.2 Device Tracking Service:**

Erstelle `src/lib/device-tracking.ts`:

```typescript
import { supabase } from './supabase';

export interface DeviceInfo {
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userAgent: string;
}

export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    deviceType = 'mobile';
  }

  // Get device name from user agent or use default
  const deviceName = navigator.platform || 'Unknown Device';

  return {
    deviceName,
    deviceType,
    userAgent,
  };
}

export async function trackDevice(userId: string) {
  const deviceInfo = getDeviceInfo();

  try {
    await supabase
      .from('user_devices')
      .upsert({
        user_id: userId,
        device_name: deviceInfo.deviceName,
        device_type: deviceInfo.deviceType,
        user_agent: deviceInfo.userAgent,
        last_seen_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,device_name',
      });
  } catch (error) {
    console.error('Error tracking device:', error);
  }
}

export async function getUserDevices(userId: string) {
  const { data, error } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_seen_at', { ascending: false });

  if (error) {
    console.error('Error fetching devices:', error);
    return [];
  }

  return data || [];
}

export async function removeDevice(deviceId: string) {
  const { error } = await supabase
    .from('user_devices')
    .delete()
    .eq('id', deviceId);

  if (error) {
    console.error('Error removing device:', error);
    throw error;
  }
}
```

**4.3 Device Tracking in App integrieren:**

In `src/App.tsx` oder `src/contexts/AuthContext.tsx`:

```typescript
import { trackDevice } from './lib/device-tracking';

// Nach erfolgreichem Login
useEffect(() => {
  if (user) {
    trackDevice(user.id);
  }
}, [user]);
```

**✅ Checkliste:**
- [ ] Devices Tabelle erstellt
- [ ] RLS aktiviert
- [ ] Device Tracking Service erstellt
- [ ] Device Tracking in App integriert

### Schritt 5: Device Management UI

**5.1 Erstelle Device Management Component:**

Erstelle `src/components/DeviceManagement.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { getUserDevices, removeDevice, DeviceInfo } from '../lib/device-tracking';

export function DeviceManagement() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDevices();
    }
  }, [user]);

  async function loadDevices() {
    if (!user) return;
    
    setLoading(true);
    const userDevices = await getUserDevices(user.id);
    setDevices(userDevices);
    setLoading(false);
  }

  async function handleRemoveDevice(deviceId: string) {
    if (!confirm('Möchtest du dieses Gerät wirklich entfernen?')) {
      return;
    }

    try {
      await removeDevice(deviceId);
      await loadDevices();
    } catch (error) {
      console.error('Error removing device:', error);
      alert('Fehler beim Entfernen des Geräts');
    }
  }

  if (loading) {
    return <div>Lädt Geräte...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Aktive Geräte</h3>
      {devices.map((device) => (
        <div key={device.id} className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-medium">{device.device_name}</div>
            <div className="text-sm text-gray-500">{device.device_type}</div>
            <div className="text-xs text-gray-400">
              Zuletzt gesehen: {new Date(device.last_seen_at).toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => handleRemoveDevice(device.id)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Entfernen
          </button>
        </div>
      ))}
    </div>
  );
}
```

**5.2 Integriere in Profile View:**

Füge Device Management zu deiner Profile View hinzu.

**✅ Checkliste:**
- [ ] Device Management Component erstellt
- [ ] In Profile View integriert
- [ ] Testing abgeschlossen

### Schritt 6: Logout auf allen Geräten

**6.1 Erweitere AuthContext:**

In `src/contexts/AuthContext.tsx`:

```typescript
const signOutAllDevices = async () => {
  if (isDemoMode || !supabase) {
    // Demo mode handling
    return;
  }

  try {
    // Sign out from current session
    await supabase.auth.signOut();
    
    // Clear all sessions (requires backend function)
    // Siehe Schritt 6.2 für Backend Function
  } catch (error) {
    console.error('Error signing out from all devices:', error);
    throw error;
  }
};
```

**6.2 Erstelle Backend Function für Logout aller Devices:**

Erstelle Supabase Edge Function `supabase/functions/signout-all-devices/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Sign out all sessions except current
    // This requires Admin API access
    const { error: signOutError } = await supabaseClient.auth.admin.signOut(user.id, 'global')

    if (signOutError) {
      throw signOutError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

**✅ Checkliste:**
- [ ] Sign Out All Devices Funktion erstellt
- [ ] Backend Function deployed
- [ ] In UI integriert
- [ ] Testing abgeschlossen

### Schritt 7: MFA (Multi-Factor Authentication) - Optional

**7.1 MFA in Supabase aktivieren:**

1. Gehe zu Supabase Dashboard → Authentication → Providers
2. Aktiviere "Enable MFA"
3. Konfiguriere MFA Methoden (TOTP, SMS)

**7.2 MFA UI implementieren:**

Für MFA Implementation siehe Supabase Docs: https://supabase.com/docs/guides/auth/auth-mfa

**✅ Checkliste:**
- [ ] MFA aktiviert (optional)
- [ ] MFA UI implementiert (optional)

### Schritt 8: Testing

**8.1 Test Leaked Password Protection:**

1. Versuche ein bekanntes kompromittiertes Passwort zu verwenden
2. Sollte abgelehnt werden

**8.2 Test Session Management:**

1. Login
2. Warte bis Session abläuft
3. Prüfe ob Auto-Refresh funktioniert

**8.3 Test Device Management:**

1. Login von verschiedenen Geräten
2. Prüfe ob alle Geräte sichtbar sind
3. Teste Device Removal

**✅ Checkliste:**
- [ ] Leaked Password Protection getestet
- [ ] Session Management getestet
- [ ] Device Management getestet
- [ ] Alle Tests erfolgreich

## 🐛 Troubleshooting

### Problem: "Leaked Password Protection nicht aktiviert"

**Lösung:**
- Prüfe ob Feature in Supabase Dashboard aktiviert ist
- Prüfe ob Supabase Plan MFA unterstützt (kostenpflichtig)

### Problem: "Device Tracking funktioniert nicht"

**Lösung:**
- Prüfe ob RLS Policies korrekt sind
- Prüfe ob User eingeloggt ist
- Prüfe Browser Console für Errors

## ✅ Finale Checkliste

- [ ] Leaked Password Protection aktiviert
- [ ] Password Policy konfiguriert
- [ ] Session Management konfiguriert
- [ ] Device Tracking implementiert
- [ ] Device Management UI erstellt
- [ ] Logout auf allen Geräten implementiert
- [ ] MFA aktiviert (optional)
- [ ] Testing abgeschlossen
- [ ] Dokumentation aktualisiert

## 📝 Notizen

```
[Datum] - [Was wurde gemacht]
- 
- 
- 
```

## 🎯 Nächster Schritt

Wenn alles abgeschlossen ist, gehe weiter zu:
**`05_SECURITY_HEADERS.md`**

---

**Status Update:**
- [ ] Nicht gestartet
- [🔄] In Arbeit
- [✅] Abgeschlossen
- [⚠️] Blockiert (Grund: _______________)

