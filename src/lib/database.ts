import { supabase } from './supabase'
import { UserProfile, AuraMemory, Goal, MoodEntry, JournalEntry, ChatSession, TranscriptEntry, CognitiveDistortion } from '../types'

// Profile Operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
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
      memory: memory || {
        keyRelationships: [],
        majorLifeEvents: [],
        recurringThemes: [],
        userGoals: [],
      },
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
  const { error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      voice: updates.voice,
      language: updates.language,
      avatar_url: updates.avatarUrl,
      onboarding_completed: updates.onboardingCompleted,
      subscription_plan: updates.subscription?.plan,
      subscription_expiry_date: updates.subscription?.expiryDate,
    })
    .eq('id', userId)

  if (error) throw error
}

// Aura Memory Operations
export async function getAuraMemory(userId: string): Promise<AuraMemory | null> {
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
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)

  if (error) throw error
}

// Mood Entries Operations
export async function getMoodEntries(userId: string): Promise<MoodEntry[]> {
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
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      content: entry.content,
      created_at: entry.createdAt,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function updateJournalEntry(entryId: string, content: string, insights?: { keyThemes: string[], positiveNotes: string[] }): Promise<void> {
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
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId)

  if (error) throw error
}

// Chat Sessions Operations
export async function getChatSessions(userId: string): Promise<ChatSession[]> {
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