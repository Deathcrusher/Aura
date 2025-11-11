-- =====================================================
-- Aura SaaS - RLS Policies Fix
-- =====================================================
-- Diese Datei behebt kritische Sicherheitslücken durch
-- fehlende Row Level Security Policies
-- =====================================================
-- WICHTIG: Führe diese Migrations in Supabase SQL Editor aus
-- oder erstelle eine Migration über Supabase CLI
-- =====================================================

-- =====================================================
-- 1. PLANS TABLE - RLS aktivieren und Policies erstellen
-- =====================================================

-- RLS aktivieren
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policy: Alle können Pläne lesen (öffentliche Preisinformationen)
CREATE POLICY "Plans are viewable by everyone"
ON public.plans
FOR SELECT
TO authenticated, anon
USING (true);

-- Policy: Nur Service Role kann Pläne erstellen/updaten
-- (Diese Policy sollte über Service Role ausgeführt werden)
-- CREATE POLICY "Only service role can modify plans"
-- ON public.plans
-- FOR ALL
-- TO service_role
-- USING (true)
-- WITH CHECK (true);

-- =====================================================
-- 2. SUBSCRIPTIONS TABLE - RLS aktivieren und Policies erstellen
-- =====================================================

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

-- =====================================================
-- 3. USER_SESSIONS TABLE - RLS aktivieren und Policies erstellen
-- =====================================================

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

-- =====================================================
-- 4. PROFILES TABLE - RLS Policies optimieren
-- =====================================================
-- Aktualisiere bestehende Policies für bessere Performance
-- WICHTIG: Prüfe zuerst, welche Policies bereits existieren!

-- Alte Policies löschen (wenn vorhanden)
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

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

-- =====================================================
-- 5. INDEXES für bessere Performance
-- =====================================================

-- Index für subscriptions.user_id (falls nicht vorhanden)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON public.subscriptions(user_id);

-- Index für user_sessions.user_id (falls nicht vorhanden)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
ON public.user_sessions(user_id);

-- Index für user_sessions.session_date (für Zeit-basierte Queries)
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_date 
ON public.user_sessions(session_date);

-- =====================================================
-- 6. VERIFY RLS ist aktiviert
-- =====================================================

-- Prüfe RLS Status für alle Tabellen
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('plans', 'subscriptions', 'user_sessions', 'profiles')
ORDER BY tablename;

-- Prüfe alle Policies
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
    AND tablename IN ('plans', 'subscriptions', 'user_sessions', 'profiles')
ORDER BY tablename, policyname;

-- =====================================================
-- HINWEISE:
-- =====================================================
-- 1. Teste alle Policies nach dem Ausführen
-- 2. Stelle sicher, dass bestehende Policies nicht konfliktieren
-- 3. Für Service Role Zugriff (z.B. Stripe Webhooks) müssen
--    separate Policies erstellt werden
-- 4. Prüfe, ob es bestehende Policies gibt, die gelöscht werden müssen
-- =====================================================

