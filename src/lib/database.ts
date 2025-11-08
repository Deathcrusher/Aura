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
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    if (!profile) return null

    // Lade zusätzliche Daten
    const [memory, goals, moodJournal, journal] = await Promise.all([
      getAuraMemory(userId),
      getGoals(userId),
      getMoodEntries(userId),
      getJournalEntries(userId),
    ])

    return {
      name: profile.name || 'User',
      voice: profile.voice || 'Zephyr',
      language: profile.language || 'de-DE',
      avatarUrl: profile.avatar_url,
      onboardingCompleted: profile.onboarding_completed || false,
      subscription: {
        plan: profile.subscription_plan || 'free',
        expiryDate: profile.subscription_expiry_date,
      },
      memory: memory || createDefaultMemory(),
      goals: goals || [],
      moodJournal: moodJournal || [],
      journal: journal || [],
    }
  } catch (error) {
    console.error('Fehler beim Laden des Profils:', error)
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

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      name: updates.name,
      voice: updates.voice,
      language: updates.language,
      avatar_url: updates.avatarUrl,
      onboarding_completed: updates.onboardingCompleted,
      subscription_plan: updates.subscription?.plan,
      subscription_expiry_date: updates.subscription?.expiryDate,
    }, { onConflict: 'id' })

  if (error) throw error
}

// Aura Memory Operations
export async function getAuraMemory(userId: string): Promise<AuraMemory | null> {
  if (!hasSupabase || !supabase) {
    const db = loadDemoDatabase()
    const profile = db.profiles[userId]
    if (!profile) return null
    return clone(profile.memory ?? createDefaultMemory())
  }

  const { data, error } = await supabase
    .from('aura_memory')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

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
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

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
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

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
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

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
