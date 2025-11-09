import { supabase, isSupabaseConfigured } from './supabase'
import {
  UserProfile,
  AuraMemory,
  Goal,
  MoodEntry,
  JournalEntry,
  ChatSession,
  TranscriptEntry,
  CognitiveDistortion,
  SubscriptionPlan,
} from '../types'

const hasSupabase = Boolean(isSupabaseConfigured && supabase)

const DEMO_STORAGE_KEY = 'aura-demo-database-v1'

const createDefaultMemory = (): AuraMemory => ({
  keyRelationships: [],
  majorLifeEvents: [],
  recurringThemes: [],
  userGoals: [],
})

const createDefaultProfile = (): UserProfile => ({
  name: 'User',
  voice: 'Zephyr',
  language: 'de-DE',
  avatarUrl: null,
  memory: createDefaultMemory(),
  goals: [],
  moodJournal: [],
  journal: [],
  onboardingCompleted: false,
  subscription: {
    plan: SubscriptionPlan.FREE,
  },
})

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

interface DemoChatSession extends ChatSession {
  userId: string
}

interface DemoDatabase {
  profiles: Record<string, UserProfile>
  sessions: Record<string, DemoChatSession>
  userSessions: Record<string, string[]>
}

const loadDemoDatabase = (): DemoDatabase => {
  if (typeof window === 'undefined') {
    return { profiles: {}, sessions: {}, userSessions: {} }
  }

  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY)
    if (!raw) {
      return { profiles: {}, sessions: {}, userSessions: {} }
    }

    const parsed = JSON.parse(raw) as Partial<DemoDatabase>
    return {
      profiles: parsed.profiles ?? {},
      sessions: parsed.sessions ?? {},
      userSessions: parsed.userSessions ?? {},
    }
  } catch (error) {
    console.warn('[Aura] Konnte Demo-Daten nicht laden:', error)
    return { profiles: {}, sessions: {}, userSessions: {} }
  }
}

const saveDemoDatabase = (db: DemoDatabase) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    console.warn('[Aura] Konnte Demo-Daten nicht speichern:', error)
  }
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const ensureDemoProfile = (db: DemoDatabase, userId: string): UserProfile => {
  const existing = db.profiles[userId]
  if (existing) {
    return existing
  }
  const profile = createDefaultProfile()
  db.profiles[userId] = profile
  return profile
}

const getDemoSessionRecord = (db: DemoDatabase, sessionId: string): DemoChatSession | undefined => {
  return db.sessions[sessionId]
}

const upsertDemoSessionRecord = (
  db: DemoDatabase,
  session: DemoChatSession,
): DemoChatSession => {
  db.sessions[session.id] = session
  const order = db.userSessions[session.userId] ?? []
  db.userSessions[session.userId] = [session.id, ...order.filter(id => id !== session.id)]
  return session
}

// Profile Operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = db.profiles[userId]
    return profile ? clone(profile) : null
  }

  try {
    console.log('🔍 [getUserProfile] Starting profile load for user:', userId);
    
    // Check if user is authenticated FIRST - required for RLS policies
    // Add timeout for session check
    console.log('🔍 [getUserProfile] Checking session...');
    const sessionCheckPromise = supabase.auth.getSession();
    const sessionTimeoutPromise = new Promise<{ data: { session: null }, error: { message: string } }>((resolve) => {
      setTimeout(() => {
        console.warn('⚠️ [getUserProfile] Session check timeout after 5 seconds');
        resolve({ data: { session: null }, error: { message: 'Session check timeout' } });
      }, 5000);
    });
    
    let sessionResult: { data: { session: any }, error: any };
    try {
      sessionResult = await Promise.race([sessionCheckPromise, sessionTimeoutPromise]);
    } catch (error) {
      console.error('❌ [getUserProfile] Session check failed:', error);
      return null;
    }
    
    const { data: { session }, error: sessionError } = sessionResult;
    
    // If no session, return null immediately - user needs to sign in
    if (!session) {
      console.error('❌ CRITICAL: No active session! User is not authenticated.');
      console.error('   - Session error:', sessionError);
      console.error('   - Cannot load profile without authentication');
      console.error('   - User ID requested:', userId);
      console.error('   - This usually means the user needs to sign in again');
      return null;
    }

    console.log('✅ [getUserProfile] Session found:', {
      userId: session.user.id,
      expiresAt: session.expires_at
    });

    // Verify session is not expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      console.warn('⚠️ [getUserProfile] Session expired, attempting to refresh...');
      try {
        const refreshPromise = supabase.auth.refreshSession();
        const refreshTimeout = new Promise<{ data: { session: null }, error: null }>((resolve) => {
          setTimeout(() => resolve({ data: { session: null }, error: null }), 5000);
        });
        const { data: { session: refreshedSession }, error: refreshError } = await Promise.race([refreshPromise, refreshTimeout]);
        
        if (refreshedSession && !refreshError) {
          session = refreshedSession;
          console.log('✅ [getUserProfile] Session refreshed successfully');
        } else {
          console.error('❌ [getUserProfile] Failed to refresh expired session:', refreshError);
          console.error('   - User needs to sign in again');
          return null;
        }
      } catch (error) {
        console.error('❌ [getUserProfile] Error refreshing session:', error);
        return null;
      }
    }

    if (session.user.id !== userId) {
      console.error('❌ CRITICAL: User ID mismatch!');
      console.error('   - Session user ID:', session.user.id);
      console.error('   - Requested user ID:', userId);
      return null;
    }

    console.log('✅ [getUserProfile] Session verified, loading profile from database...');

    // Select only profile columns explicitly to avoid automatic joins
    // Supabase makes automatic joins with .select('*') which causes issues when related tables have multiple rows
    // Add timeout for database query
    console.log('🔍 [getUserProfile] Executing database query...');
    const profileQueryPromise = supabase
      .from('profiles')
      .select('id, email, full_name, created_at, updated_at, name, voice, language, avatar_url, onboarding_completed, subscription_plan, subscription_expiry_date')
      .eq('id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    const queryTimeoutPromise = new Promise<{ data: null, error: { message: string } }>((resolve) => {
      setTimeout(() => {
        console.warn('⚠️ [getUserProfile] Database query timeout after 10 seconds');
        resolve({ data: null, error: { message: 'Query timeout' } });
      }, 10000);
    });
    
    let queryResult: { data: any, error: any };
    try {
      queryResult = await Promise.race([profileQueryPromise, queryTimeoutPromise]);
    } catch (error) {
      console.error('❌ [getUserProfile] Database query failed:', error);
      return null;
    }
    
    const { data: profiles, error } = queryResult;

    if (error) {
      console.error('❌ [getUserProfile] Error loading profile from Supabase:', {
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        userId: userId,
        hasSession: !!session
      });
      throw error;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('⚠️ [getUserProfile] No profile found for user:', userId);
      return null;
    }
    
    // Take the first (most recent) profile if multiple exist
    const profile = profiles[0]
    console.log('✅ [getUserProfile] Profile loaded from database:', {
      name: profile.name,
      onboardingCompleted: profile.onboarding_completed
    });

    // Lade zusätzliche Daten mit Timeout für jede einzelne Funktion
    // Reduziere Timeout auf 5 Sekunden und mache es optional
    const loadWithTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 5000, label: string): Promise<T | null> => {
      try {
        console.log(`🔍 [getUserProfile] Loading ${label}...`);
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn(`⚠️ [getUserProfile] Timeout loading ${label}`);
            resolve(null);
          }, timeoutMs);
        });
        const result = await Promise.race([promise, timeoutPromise]);
        if (result) {
          console.log(`✅ [getUserProfile] ${label} loaded successfully`);
        }
        return result;
      } catch (error) {
        console.warn(`⚠️ [getUserProfile] Error loading ${label}:`, error);
        return null;
      }
    };

    console.log('🔍 [getUserProfile] Loading additional data (memory, goals, mood, journal)...');
    const [memory, goals, moodJournal, journal] = await Promise.all([
      loadWithTimeout(getAuraMemory(userId), 5000, 'memory'),
      loadWithTimeout(getGoals(userId), 5000, 'goals'),
      loadWithTimeout(getMoodEntries(userId), 5000, 'moodJournal'),
      loadWithTimeout(getJournalEntries(userId), 5000, 'journal'),
    ])
    
    console.log('✅ [getUserProfile] All data loaded, constructing profile object...');

    const userProfile = {
      name: profile.name || 'User',
      voice: profile.voice || 'Zephyr',
      language: profile.language || 'de-DE',
      avatarUrl: profile.avatar_url,
      onboardingCompleted: profile.onboarding_completed === true, // Explicitly check for true
      subscription: {
        plan: profile.subscription_plan || 'free',
        expiryDate: profile.subscription_expiry_date,
      },
      memory: memory || createDefaultMemory(),
      goals: goals || [],
      moodJournal: moodJournal || [],
      journal: journal || [],
    };
    
    console.log('✅ [getUserProfile] Profile constructed successfully:', {
      name: userProfile.name,
      onboardingCompleted: userProfile.onboardingCompleted,
      hasMemory: !!memory,
      goalsCount: goals?.length || 0,
      moodCount: moodJournal?.length || 0,
      journalCount: journal?.length || 0
    });
    
    return userProfile;
  } catch (error: any) {
    console.error('❌ [getUserProfile] Fehler beim Laden des Profils:', error)
    console.error('   - Error code:', error?.code)
    console.error('   - Error message:', error?.message)
    console.error('   - Error details:', error?.details)
    console.error('   - Error hint:', error?.hint)
    console.error('   - Stack:', error?.stack)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const existing = ensureDemoProfile(db, userId)
    const updatedProfile: UserProfile = {
      ...existing,
      ...updates,
      memory: updates.memory ? clone(updates.memory) : existing.memory ?? createDefaultMemory(),
      goals: updates.goals ?? existing.goals ?? [],
      moodJournal: updates.moodJournal ?? existing.moodJournal ?? [],
      journal: updates.journal ?? existing.journal ?? [],
      subscription: updates.subscription ?? existing.subscription ?? { plan: SubscriptionPlan.FREE },
    }

    db.profiles[userId] = updatedProfile
    saveDemoDatabase(db)
    return
  }

  // Check if user is authenticated FIRST
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (!session) {
    console.error('❌ CRITICAL: No active session! User is not authenticated.');
    console.error('   - Session error:', sessionError);
    console.error('   - Cannot update profile without authentication');
    throw new Error('User must be authenticated to update profile');
  }

  if (session.user.id !== userId) {
    console.error('❌ CRITICAL: User ID mismatch!');
    console.error('   - Session user ID:', session.user.id);
    console.error('   - Requested user ID:', userId);
    throw new Error('User ID mismatch - cannot update another user\'s profile');
  }

  const profileData: any = {
    id: userId,
  };

  // Only include fields that are explicitly provided (not undefined) and not empty strings
  if (updates.name !== undefined && updates.name !== null && updates.name.trim() !== '') {
    profileData.name = updates.name.trim();
  } else if (updates.name === '') {
    // Don't update name if it's an empty string - keep existing value
    console.warn('⚠️ Empty name provided, skipping name update');
  }
  
  if (updates.voice !== undefined) profileData.voice = updates.voice;
  if (updates.language !== undefined) profileData.language = updates.language;
  if (updates.avatarUrl !== undefined) profileData.avatar_url = updates.avatarUrl;
  if (updates.onboardingCompleted !== undefined) profileData.onboarding_completed = Boolean(updates.onboardingCompleted);
  if (updates.subscription?.plan !== undefined) profileData.subscription_plan = updates.subscription.plan;
  if (updates.subscription?.expiryDate !== undefined) profileData.subscription_expiry_date = updates.subscription.expiryDate;

  console.log('💾 Saving profile to Supabase:', {
    userId,
    sessionUserId: session.user.id,
    profileData,
    hasSupabase,
    isSupabaseConfigured,
    supabaseClientExists: !!supabase
  });

  // Check if profile exists first
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (checkError) {
    console.error('❌ Error checking existing profile:', checkError);
    throw checkError;
  }

  let result;
  if (existingProfile) {
    // Profile exists - use UPDATE
    console.log('📝 Profile exists, using UPDATE');
    // Remove id from update data since we're filtering by it
    const { id, ...updateData } = profileData;
    result = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();
  } else {
    // Profile doesn't exist - use INSERT
    console.log('➕ Profile does not exist, using INSERT');
    // Ensure required fields are present for insert
    if (!profileData.name) profileData.name = 'User';
    if (!profileData.voice) profileData.voice = 'Zephyr';
    if (!profileData.language) profileData.language = 'de-DE';
    if (profileData.onboarding_completed === undefined) profileData.onboarding_completed = false;
    
    result = await supabase
      .from('profiles')
      .insert(profileData)
      .select();
  }

  const { data, error } = result;

  if (error) {
    console.error('❌ Error saving profile:', error);
    console.error('   - Error code:', error.code);
    console.error('   - Error message:', error.message);
    console.error('   - Error details:', error.details);
    console.error('   - Error hint:', error.hint);
    console.error('   - Profile data attempted:', JSON.stringify(profileData, null, 2));
    throw error;
  }
  
  console.log('✅ Profile saved successfully:', data);
}

// Aura Memory Operations
export async function getAuraMemory(userId: string): Promise<AuraMemory | null> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = db.profiles[userId]
    if (!profile) return null
    return clone(profile.memory ?? createDefaultMemory())
  }

  const { data: memories, error } = await supabase
    .from('aura_memory')
    .select('key_relationships, major_life_events, recurring_themes, user_goals')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  if (!memories || memories.length === 0) return null
  
  // Take the first (most recent) memory if multiple exist
  const data = memories[0]

  return {
    keyRelationships: data.key_relationships || [],
    majorLifeEvents: data.major_life_events || [],
    recurringThemes: data.recurring_themes || [],
    userGoals: data.user_goals || [],
  }
}

export async function updateAuraMemory(userId: string, memory: AuraMemory): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = ensureDemoProfile(db, userId)
    profile.memory = clone(memory)
    db.profiles[userId] = profile
    saveDemoDatabase(db)
    return
  }

  const { error } = await supabase
    .from('aura_memory')
    .upsert({
      user_id: userId,
      key_relationships: memory.keyRelationships,
      major_life_events: memory.majorLifeEvents,
      recurring_themes: memory.recurringThemes,
      user_goals: memory.userGoals,
      updated_at: Date.now(),
    })

  if (error) throw error
}

// Goals Operations
export async function getGoals(userId: string): Promise<Goal[]> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = db.profiles[userId]
    return profile ? clone(profile.goals ?? []) : []
  }

  const { data, error } = await supabase
    .from('goals')
    .select('id, description, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100) // Limit to prevent loading too many goals

  if (error) throw error

  return (data || []).map(g => ({
    id: g.id,
    description: g.description,
    status: g.status,
    createdAt: g.created_at,
  }))
}

export async function addGoal(userId: string, goal: Omit<Goal, 'id'>): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = ensureDemoProfile(db, userId)
    const newGoal: Goal = { id: generateId(), ...goal }
    profile.goals = [...(profile.goals ?? []), newGoal]
    db.profiles[userId] = profile
    saveDemoDatabase(db)
    return
  }

  const { error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      description: goal.description,
      status: goal.status,
      created_at: goal.createdAt,
    })

  if (error) throw error
}

export async function updateGoal(goalId: string, status: 'active' | 'completed'): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    let updated = false

    for (const profile of Object.values(db.profiles)) {
      const goals = profile.goals ?? []
      const index = goals.findIndex(goal => goal.id === goalId)
      if (index !== -1) {
        goals[index] = { ...goals[index], status }
        profile.goals = goals
        updated = true
        break
      }
    }

    if (updated) {
      saveDemoDatabase(db)
    }
    return
  }

  const { error } = await supabase
    .from('goals')
    .update({
      status,
      completed_at: status === 'completed' ? Date.now() : null
    })
    .eq('id', goalId)

  if (error) throw error
}

export async function deleteGoal(goalId: string): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    let removed = false

    for (const profile of Object.values(db.profiles)) {
      const goals = profile.goals ?? []
      const nextGoals = goals.filter(goal => goal.id !== goalId)
      if (nextGoals.length !== goals.length) {
        profile.goals = nextGoals
        removed = true
        break
      }
    }

    if (removed) {
      saveDemoDatabase(db)
    }
    return
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)

  if (error) throw error
}

// Mood Entries Operations
export async function getMoodEntries(userId: string): Promise<MoodEntry[]> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = db.profiles[userId]
    return profile ? clone(profile.moodJournal ?? []) : []
  }

  const { data, error } = await supabase
    .from('mood_entries')
    .select('id, mood, note, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100) // Limit to prevent loading too many mood entries

  if (error) throw error

  return (data || []).map(m => ({
    id: m.id,
    mood: m.mood,
    note: m.note,
    createdAt: m.created_at,
  }))
}

export async function addMoodEntry(userId: string, entry: Omit<MoodEntry, 'id'>): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = ensureDemoProfile(db, userId)
    const newEntry: MoodEntry = { id: generateId(), ...entry }
    profile.moodJournal = [newEntry, ...(profile.moodJournal ?? [])]
    db.profiles[userId] = profile
    saveDemoDatabase(db)
    return
  }

  const { error } = await supabase
    .from('mood_entries')
    .insert({
      user_id: userId,
      mood: entry.mood,
      note: entry.note,
      created_at: entry.createdAt,
    })

  if (error) throw error
}

// Journal Entries Operations
export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = db.profiles[userId]
    return profile ? clone(profile.journal ?? []) : []
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, content, created_at, key_themes, positive_notes')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50) // Limit to prevent loading too many journal entries (they can be large)

  if (error) throw error

  return (data || []).map(j => ({
    id: j.id,
    content: j.content,
    createdAt: j.created_at,
    insights: j.key_themes && j.positive_notes ? {
      keyThemes: j.key_themes,
      positiveNotes: j.positive_notes,
    } : undefined,
  }))
}

export async function addJournalEntry(userId: string, entry: Omit<JournalEntry, 'id'>): Promise<string> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = ensureDemoProfile(db, userId)
    const newEntry: JournalEntry = { id: generateId(), ...entry }
    profile.journal = [newEntry, ...(profile.journal ?? [])]
    db.profiles[userId] = profile
    saveDemoDatabase(db)
    return newEntry.id
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      content: entry.content,
      created_at: entry.createdAt,
      key_themes: entry.insights?.keyThemes,
      positive_notes: entry.insights?.positiveNotes,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function updateJournalEntry(entryId: string, content: string, insights?: { keyThemes: string[], positiveNotes: string[] }): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    let updated = false

    for (const profile of Object.values(db.profiles)) {
      const entries = profile.journal ?? []
      const index = entries.findIndex(entry => entry.id === entryId)
      if (index !== -1) {
        entries[index] = {
          ...entries[index],
          content,
          insights,
        }
        profile.journal = entries
        updated = true
        break
      }
    }

    if (updated) {
      saveDemoDatabase(db)
    }
    return
  }

  const { error } = await supabase
    .from('journal_entries')
    .update({
      content,
      key_themes: insights?.keyThemes,
      positive_notes: insights?.positiveNotes,
    })
    .eq('id', entryId)

  if (error) throw error
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    let removed = false

    for (const profile of Object.values(db.profiles)) {
      const entries = profile.journal ?? []
      const nextEntries = entries.filter(entry => entry.id !== entryId)
      if (nextEntries.length !== entries.length) {
        profile.journal = nextEntries
        removed = true
        break
      }
    }

    if (removed) {
      saveDemoDatabase(db)
    }
    return
  }

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId)

  if (error) throw error
}

// Chat Sessions Operations
export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const sessionIds = db.userSessions[userId] ?? []

    return sessionIds
      .map(id => db.sessions[id])
      .filter((session): session is DemoChatSession => Boolean(session))
      .map(session => ({
        id: session.id,
        title: session.title,
        transcript: clone(session.transcript ?? []),
        notes: session.notes,
        summary: session.summary,
        summaryAudioBase64: session.summaryAudioBase64,
        startTime: session.startTime,
        cognitiveDistortions: clone(session.cognitiveDistortions ?? []),
        moodTrend: session.moodTrend,
        wordCloud: session.wordCloud,
      }))
  }

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })

  if (error) throw error
  if (!sessions) return []

  // Lade Transkripte und Cognitive Distortions für alle Sessions
  const sessionsWithDetails = await Promise.all(
    sessions.map(async (session) => {
      const [transcript, distortions] = await Promise.all([
        getTranscriptEntries(session.id),
        getCognitiveDistortions(session.id),
      ])

      return {
        id: session.id,
        title: session.title,
        transcript,
        notes: session.notes,
        summary: session.summary,
        summaryAudioBase64: session.summary_audio_base64,
        startTime: session.start_time,
        cognitiveDistortions: distortions,
        moodTrend: session.mood_trend as number[] | undefined,
        wordCloud: session.word_cloud as { text: string; value: number }[] | undefined,
      }
    })
  )

  return sessionsWithDetails
}

export async function createChatSession(userId: string, session: Omit<ChatSession, 'id'>): Promise<string> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const sessionId = generateId()
    const newSession: DemoChatSession = {
      ...session,
      id: sessionId,
      userId,
      transcript: clone(session.transcript ?? []),
      cognitiveDistortions: clone(session.cognitiveDistortions ?? []),
    }

    upsertDemoSessionRecord(db, newSession)
    saveDemoDatabase(db)
    return sessionId
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: session.title,
      start_time: session.startTime,
    })
    .select('id')
    .single()

  if (error) throw error

  // Füge initiales Transkript hinzu
  if (session.transcript.length > 0) {
    await addTranscriptEntries(data.id, session.transcript)
  }

  return data.id
}

export async function updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const record = getDemoSessionRecord(db, sessionId)
    if (record) {
      const updated: DemoChatSession = {
        ...record,
        ...updates,
        transcript: updates.transcript ? clone(updates.transcript) : record.transcript,
        cognitiveDistortions: updates.cognitiveDistortions
          ? clone(updates.cognitiveDistortions)
          : record.cognitiveDistortions,
      }

      upsertDemoSessionRecord(db, updated)
      saveDemoDatabase(db)
    }
    return
  }

  const { error } = await supabase
    .from('chat_sessions')
    .update({
      title: updates.title,
      notes: updates.notes,
      summary: updates.summary,
      summary_audio_base64: updates.summaryAudioBase64,
      mood_trend: updates.moodTrend,
      word_cloud: updates.wordCloud,
    })
    .eq('id', sessionId)

  if (error) throw error
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const record = db.sessions[sessionId]
    if (record) {
      delete db.sessions[sessionId]
      const order = db.userSessions[record.userId] ?? []
      db.userSessions[record.userId] = order.filter(id => id !== sessionId)
      saveDemoDatabase(db)
    }
    return
  }

  // Lösche zuerst abhängige Daten
  await Promise.all([
    supabase.from('transcript_entries').delete().eq('session_id', sessionId),
    supabase.from('cognitive_distortions').delete().eq('session_id', sessionId),
  ])

  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) throw error
}

// Transcript Entries Operations
export async function getTranscriptEntries(sessionId: string): Promise<TranscriptEntry[]> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const session = db.sessions[sessionId]
    return session ? clone(session.transcript ?? []) : []
  }

  const { data, error } = await supabase
    .from('transcript_entries')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: true })

  if (error) throw error

  return (data || []).map(t => ({
    id: t.id,
    speaker: t.speaker,
    text: t.text,
  }))
}

export async function addTranscriptEntries(sessionId: string, entries: TranscriptEntry[]): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const record = getDemoSessionRecord(db, sessionId)
    if (record) {
      record.transcript = [...(record.transcript ?? []), ...clone(entries)]
      upsertDemoSessionRecord(db, record)
      saveDemoDatabase(db)
    }
    return
  }

  const insertData = entries.map((entry, index) => ({
    session_id: sessionId,
    id: entry.id,
    speaker: entry.speaker,
    text: entry.text,
    sequence_number: index,
    created_at: Date.now(),
  }))

  const { error } = await supabase
    .from('transcript_entries')
    .insert(insertData)

  if (error) throw error
}

export async function addTranscriptEntry(sessionId: string, entry: TranscriptEntry, sequenceNumber: number): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const record = getDemoSessionRecord(db, sessionId)
    if (record) {
      const transcript = [...(record.transcript ?? [])]
      const index = Math.min(sequenceNumber, transcript.length)
      transcript.splice(index, 0, clone(entry))
      record.transcript = transcript
      upsertDemoSessionRecord(db, record)
      saveDemoDatabase(db)
    }
    return
  }

  const { error } = await supabase
    .from('transcript_entries')
    .insert({
      session_id: sessionId,
      id: entry.id,
      speaker: entry.speaker,
      text: entry.text,
      sequence_number: sequenceNumber,
      created_at: Date.now(),
    })

  if (error) throw error
}

// Helper function to add a transcript entry with automatic sequence numbering
export async function addTranscriptEntryAuto(sessionId: string, entry: TranscriptEntry): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const record = getDemoSessionRecord(db, sessionId)
    if (record) {
      record.transcript = [...(record.transcript ?? []), clone(entry)]
      upsertDemoSessionRecord(db, record)
      saveDemoDatabase(db)
    }
    return
  }

  // Get current max sequence number
  const { data, error: countError } = await supabase
    .from('transcript_entries')
    .select('sequence_number')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (countError) throw countError

  const nextSequence = data ? data.sequence_number + 1 : 0

  await addTranscriptEntry(sessionId, entry, nextSequence)
}


// Cognitive Distortions Operations
export async function getCognitiveDistortions(sessionId: string): Promise<CognitiveDistortion[]> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const session = db.sessions[sessionId]
    return session ? clone(session.cognitiveDistortions ?? []) : []
  }

  const { data, error } = await supabase
    .from('cognitive_distortions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data || []).map(d => ({
    type: d.type,
    statement: d.statement,
    transcriptEntryId: d.transcript_entry_id,
  }))
}

export async function addCognitiveDistortion(sessionId: string, distortion: CognitiveDistortion): Promise<void> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const record = getDemoSessionRecord(db, sessionId)
    if (record) {
      record.cognitiveDistortions = [...(record.cognitiveDistortions ?? []), clone(distortion)]
      upsertDemoSessionRecord(db, record)
      saveDemoDatabase(db)
    }
    return
  }

  const { error } = await supabase
    .from('cognitive_distortions')
    .insert({
      session_id: sessionId,
      transcript_entry_id: distortion.transcriptEntryId,
      type: distortion.type,
      statement: distortion.statement,
      created_at: Date.now(),
    })

  if (error) throw error
}
