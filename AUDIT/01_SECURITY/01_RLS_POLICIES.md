# 🔒 01 - Row Level Security (RLS) Policies

**Status:** [ ] Nicht gestartet  
**Priorität:** 🔴 KRITISCH  
**Geschätzter Aufwand:** 1-2 Stunden  
**Blockiert:** Nichts

## 🎯 Ziel

Aktiviere Row Level Security (RLS) für alle Tabellen, die aktuell ohne RLS sind. Das verhindert, dass User auf fremde Daten zugreifen können.

## 🔍 Aktueller Status

### ❌ Tabellen OHNE RLS (KRITISCH):
- `plans` - Öffentlich zugänglich
- `subscriptions` - User können fremde Subscriptions sehen
- `user_sessions` - User können fremde Sessions sehen

### ⚠️ Tabellen MIT RLS (aber optimierungsbedürftig):
- `profiles` - RLS Policies nutzen `auth.uid()` direkt (langsam)

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Supabase Dashboard öffnen

1. Gehe zu https://supabase.com/dashboard
2. Wähle dein Projekt "Aura" aus
3. Öffne den SQL Editor (linke Sidebar)

### Schritt 2: RLS Status prüfen

Führe diesen Query aus, um den aktuellen RLS Status zu sehen:

```sql
-- Prüfe RLS Status für alle Tabellen
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('plans', 'subscriptions', 'user_sessions', 'profiles', 'chat_sessions', 'chat_messages', 'aura_memory', 'goals', 'mood_entries', 'journal_entries', 'transcript_entries', 'cognitive_distortions')
ORDER BY tablename;
```

**Erwartetes Ergebnis:**
- `plans`: `false` ❌
- `subscriptions`: `false` ❌
- `user_sessions`: `false` ❌
- Andere: `true` ✅

### Schritt 3: RLS für PLANS Tabelle aktivieren

**Warum:** Plans müssen öffentlich lesbar sein (für Preisvergleich), aber nicht schreibbar.

```sql
-- RLS aktivieren
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policy: Alle können Pläne lesen (öffentliche Preisinformationen)
CREATE POLICY "Plans are viewable by everyone"
ON public.plans
FOR SELECT
TO authenticated, anon
USING (true);

-- Policy: Nur Service Role kann Pläne erstellen/updaten
-- (Wird über Service Role ausgeführt, keine Client-Policy nötig)
```

**✅ Checkliste:**
- [ ] RLS aktiviert
- [ ] SELECT Policy erstellt
- [ ] Getestet: Kannst du Plans lesen? (Sollte funktionieren)

### Schritt 4: RLS für SUBSCRIPTIONS Tabelle aktivieren

**Warum:** User dürfen NUR ihre eigenen Subscriptions sehen/manipulieren.

```sql
-- RLS aktivieren
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: User können nur ihre eigenen Subscriptions sehen
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Policy: User können nur ihre eigenen Subscriptions erstellen
CREATE POLICY "Users can insert own subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- Policy: User können nur ihre eigenen Subscriptions updaten
CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Policy: User können nur ihre eigenen Subscriptions löschen
CREATE POLICY "Users can delete own subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);
```

**✅ Checkliste:**
- [ ] RLS aktiviert
- [ ] SELECT Policy erstellt
- [ ] INSERT Policy erstellt
- [ ] UPDATE Policy erstellt
- [ ] DELETE Policy erstellt

### Schritt 5: RLS für USER_SESSIONS Tabelle aktivieren

**Warum:** User dürfen NUR ihre eigenen Sessions sehen.

```sql
-- RLS aktivieren
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: User können nur ihre eigenen Sessions sehen
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Policy: User können nur ihre eigenen Sessions erstellen
CREATE POLICY "Users can insert own sessions"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- Policy: User können nur ihre eigenen Sessions updaten
CREATE POLICY "Users can update own sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Policy: User können nur ihre eigenen Sessions löschen
CREATE POLICY "Users can delete own sessions"
ON public.user_sessions
FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);
```

**✅ Checkliste:**
- [ ] RLS aktiviert
- [ ] SELECT Policy erstellt
- [ ] INSERT Policy erstellt
- [ ] UPDATE Policy erstellt
- [ ] DELETE Policy erstellt

### Schritt 6: RLS Policies für PROFILES optimieren

**Warum:** Aktuelle Policies nutzen `auth.uid()` direkt, was bei vielen Zeilen langsam ist.

**Zuerst prüfen, welche Policies existieren:**

```sql
-- Prüfe bestehende Policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'profiles'
ORDER BY policyname;
```

**Dann alte Policies löschen (wenn sie `auth.uid()` direkt nutzen):**

```sql
-- Alte Policies löschen (wenn vorhanden)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
```

**Neue optimierte Policies erstellen:**

```sql
-- Optimierte Policy: User können nur ihr eigenes Profil sehen
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

-- Optimierte Policy: User können nur ihr eigenes Profil updaten
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- Optimierte Policy: User können nur ihr eigenes Profil erstellen
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = id);
```

**✅ Checkliste:**
- [ ] Alte Policies gelöscht
- [ ] Neue optimierte Policies erstellt
- [ ] `(select auth.uid())` statt `auth.uid()` verwendet

### Schritt 7: Indexes für bessere Performance erstellen

```sql
-- Index für subscriptions.user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON public.subscriptions(user_id);

-- Index für user_sessions.user_id
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
ON public.user_sessions(user_id);

-- Index für user_sessions.session_date (für Zeit-basierte Queries)
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_date 
ON public.user_sessions(session_date);
```

**✅ Checkliste:**
- [ ] Index für subscriptions erstellt
- [ ] Index für user_sessions erstellt
- [ ] Index für session_date erstellt

### Schritt 8: Verifizierung

**Prüfe RLS Status:**

```sql
-- Prüfe RLS Status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('plans', 'subscriptions', 'user_sessions', 'profiles')
ORDER BY tablename;
```

**Erwartetes Ergebnis:**
- Alle Tabellen sollten `true` haben ✅

**Prüfe Policies:**

```sql
-- Prüfe alle Policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('plans', 'subscriptions', 'user_sessions', 'profiles')
ORDER BY tablename, policyname;
```

**Erwartetes Ergebnis:**
- `plans`: 1 Policy (SELECT)
- `subscriptions`: 4 Policies (SELECT, INSERT, UPDATE, DELETE)
- `user_sessions`: 4 Policies (SELECT, INSERT, UPDATE, DELETE)
- `profiles`: 3 Policies (SELECT, INSERT, UPDATE)

### Schritt 9: Testing

**Test 1: Plans lesen (sollte funktionieren)**

```typescript
// In deiner App oder Supabase SQL Editor
const { data, error } = await supabase
  .from('plans')
  .select('*');

console.log('Plans:', data);
console.log('Error:', error);
```

**Erwartetes Ergebnis:**
- ✅ Daten werden zurückgegeben
- ✅ Kein Error

**Test 2: Subscriptions lesen (sollte nur eigene zurückgeben)**

```typescript
// Als eingeloggter User
const { data, error } = await supabase
  .from('subscriptions')
  .select('*');

console.log('My subscriptions:', data);
console.log('Error:', error);
```

**Erwartetes Ergebnis:**
- ✅ Nur eigene Subscriptions werden zurückgegeben
- ✅ Keine fremden Subscriptions sichtbar
- ✅ Kein Error

**Test 3: Fremde Subscription lesen (sollte FEHLER geben)**

```typescript
// Versuche eine Subscription eines anderen Users zu lesen
// (Ersetze USER_ID mit einer anderen User-ID)
const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', 'OTHER_USER_ID');

console.log('Data:', data); // Sollte leer sein []
console.log('Error:', error);
```

**Erwartetes Ergebnis:**
- ✅ Keine Daten zurückgegeben (leeres Array)
- ✅ Kein Error (RLS filtert automatisch)

### Schritt 10: Supabase Advisors prüfen

1. Gehe zu Supabase Dashboard → Database → Advisors
2. Prüfe Security Advisors
3. Alle RLS-Warnungen sollten verschwunden sein

**✅ Checkliste:**
- [ ] Keine RLS-Disabled Warnungen mehr
- [ ] Keine Performance-Warnungen für auth.uid()

## 🐛 Troubleshooting

### Problem: "Policy already exists"

**Lösung:**
```sql
-- Prüfe welche Policies existieren
SELECT policyname FROM pg_policies WHERE tablename = 'your_table';

-- Lösche die Policy
DROP POLICY IF EXISTS "policy_name" ON public.your_table;

-- Erstelle sie neu
CREATE POLICY "policy_name" ...
```

### Problem: "Permission denied"

**Lösung:**
- Stelle sicher, dass du als Service Role oder Admin eingeloggt bist
- Prüfe, ob die Tabelle existiert: `SELECT * FROM information_schema.tables WHERE table_name = 'your_table';`

### Problem: Policies funktionieren nicht

**Lösung:**
1. Prüfe, ob RLS aktiviert ist: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'your_table';`
2. Prüfe, ob User authentifiziert ist: `SELECT auth.uid();`
3. Prüfe Policy-Syntax: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`

## ✅ Finale Checkliste

- [ ] RLS für `plans` aktiviert
- [ ] RLS für `subscriptions` aktiviert
- [ ] RLS für `user_sessions` aktiviert
- [ ] RLS Policies für `profiles` optimiert
- [ ] Indexes erstellt
- [ ] Verifizierung durchgeführt
- [ ] Testing abgeschlossen
- [ ] Supabase Advisors prüfen (keine Warnungen)
- [ ] Dokumentation aktualisiert

## 📝 Notizen

Füge hier deine Notizen hinzu:

```
[Datum] - [Was wurde gemacht]
- 
- 
- 
```

## 🎯 Nächster Schritt

Wenn alles abgeschlossen ist, gehe weiter zu:
**`02_API_KEY_SECURITY.md`**

---

**Status Update:**
- [ ] Nicht gestartet
- [🔄] In Arbeit
- [✅] Abgeschlossen
- [⚠️] Blockiert (Grund: _______________)

