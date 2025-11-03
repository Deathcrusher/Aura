// Fix: Define the SessionState enum to resolve the circular dependency.
export enum SessionState {
    IDLE = 'idle',
    CONNECTING = 'connecting',
    LISTENING = 'listening', // Waiting for user to speak
    USER_SPEAKING = 'user_speaking', // User is actively speaking
    PROCESSING = 'processing', // User has stopped, waiting for Aura's response
    SPEAKING = 'speaking', // Aura is speaking
    ERROR = 'error',
}

export enum Speaker {
  USER = 'user',
  AURA = 'aura',
}

export enum SubscriptionPlan {
    FREE = 'free',
    PREMIUM = 'premium',
}

export interface Subscription {
    plan: SubscriptionPlan;
    expiryDate?: number; // timestamp, for premium
}

export interface TranscriptEntry {
  id: string; // Unique ID for each entry
  speaker: Speaker;
  text: string;
}

export interface CognitiveDistortion {
    type: string;
    statement: string;
    transcriptEntryId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  transcript: TranscriptEntry[];
  notes?: string; // AI-generated summary of the session for its own memory
  summary?: string; // AI-generated summary for the user
  summaryAudioBase64?: string; // Pre-generated base64 audio for the summary
  startTime: number; // Store as timestamp for easier serialization
  cognitiveDistortions?: CognitiveDistortion[]; // Store identified thought patterns
  moodTrend?: number[]; // e.g. [3, 4, 2, 3] representing mood on a scale of 1-5 over the session
  wordCloud?: { text: string; value: number }[]; // For visualizing recurring words
}

// Represents the AI's structured long-term memory about the user.
export interface AuraMemory {
    keyRelationships: string[]; // e.g., "Mutter (angespanntes Verhältnis)", "Freundin Sarah (unterstützend)"
    majorLifeEvents: string[]; // e.g., "Umzug in eine neue Stadt vor 6 Monaten", "Jobwechsel letztes Jahr"
    recurringThemes: string[]; // e.g., "Angst vor dem Scheitern bei der Arbeit", "Gefühl der Einsamkeit"
    userGoals: string[]; // e.g., "Selbstvertrauen aufbauen", "Bessere Bewältigungsstrategien für Stress finden"
}

export interface Goal {
  id: string;
  description: string;
  status: 'active' | 'completed';
  createdAt: number; // timestamp
}

export type Mood = 'Sehr gut' | 'Gut' | 'Neutral' | 'Schlecht' | 'Sehr schlecht';

export interface MoodEntry {
    id: string;
    mood: Mood;
    note?: string;
    createdAt: number; // timestamp
}

export interface JournalInsights {
    keyThemes: string[];
    positiveNotes: string[];
}

export interface JournalEntry {
    id:string;
    content: string;
    createdAt: number; // timestamp
    insights?: JournalInsights;
}


export interface UserProfile {
    name: string;
    voice: string; // The ID of the voice
    language: string; // e.g., 'de-DE', 'en-US'
    avatarUrl: string | null;
    memory: AuraMemory;
    goals: Goal[];
    moodJournal: MoodEntry[];
    journal: JournalEntry[];
    onboardingCompleted: boolean;
    subscription: Subscription;
}

export interface VoiceOption {
    id: string; // The ID used by the API, e.g., 'Zephyr'
    name: string; // The user-friendly name, e.g., 'Zoe'
    gender: 'female' | 'male';
}

// List of available voices for Aura
export const AVAILABLE_VOICES: VoiceOption[] = [
    { id: 'Zephyr', name: 'Zoe', gender: 'female' },
    { id: 'Puck', name: 'Mia', gender: 'female' },
    { id: 'Kore', name: 'Eva', gender: 'female' },
    { id: 'Erinome', name: 'Lily', gender: 'female' },
    { id: 'Schedar', name: 'Clara', gender: 'female' },
    { id: 'Vindemiatrix', name: 'Sophia', gender: 'female' },
    { id: 'Charon', name: 'Leo', gender: 'male' },
    { id: 'Fenrir', name: 'Noah', gender: 'male' },
    { id: 'Umbriel', name: 'David', gender: 'male' },
    { id: 'Alnilam', name: 'Adam', gender: 'male' },
    { id: 'Gacrux', name: 'Elias', gender: 'male' },
    { id: 'Rasalgethi', name: 'Ben', gender: 'male' },
];

export const AVAILABLE_LANGUAGES = [
    { id: 'de-DE', name: 'Deutsch' },
    { id: 'en-US', name: 'English (US)' },
];