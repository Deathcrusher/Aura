import { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Onboarding } from './components/Onboarding';
import { ChatView } from './components/ChatView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SessionSummaryCard } from './components/SessionSummaryCard';
import {
  UserProfile,
  ChatSession,
  SessionState,
  Speaker,
  TranscriptEntry,
  CognitiveDistortion,
  SubscriptionPlan,
  JournalEntry,
  Mood,
  AuraMemory,
  JournalInsights,
} from './types';
import {
  getUserProfile,
  updateUserProfile,
  createChatSession,
  getChatSessions,
  getTranscriptEntries,
  addTranscriptEntryAuto,
  deleteChatSession,
  getAuraMemory,
  updateAuraMemory,
  updateChatSession,
  addGoal,
  addMoodEntry,
  addJournalEntry,
  deleteJournalEntry,
  addCognitiveDistortion,
} from './lib/database';
import { translations } from './lib/translations';
import {
  MenuIcon,
  PlusIcon,
  GoalsIcon,
  HeartIcon,
  JournalIcon,
  UserIcon,
  LogoutIcon,
  StopIcon,
  XIcon,
  MicrophoneIcon,
  SunIcon,
  MoonIcon,
  AlertTriangleIcon,
  PlayIcon,
  DownloadIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  MoodVeryGoodIcon,
  MoodGoodIcon,
  MoodNeutralIcon,
  MoodBadIcon,
  MoodVeryBadIcon,
  SpinnerIcon,
} from './components/Icons';
import { ProfileModal } from './components/ProfileModal';
import { GoalsModal } from './components/GoalsModal';
import { MoodJournalModal } from './components/MoodJournalModal';
import { JournalModal } from './components/JournalModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PremiumLockOverlay } from './components/PremiumLockOverlay';
import { AppFrame } from './components/AppFrame';
import { HomeView } from './components/HomeView';
import { JournalView } from './components/JournalView';
import { ProfileView } from './components/ProfileView';
import { BreathingExercise } from './components/BreathingExercise';
import { BottomNavigation } from './components/BottomNavigation';
import {
  SpeechRecognitionService,
  TextToSpeechService,
  AudioVisualization,
  VoiceRecorder,
} from './utils/voice';
import { encode, decode, decodeAudioData } from './utils/audio';
// For realtime audio input
import { createBlob } from './utils/audio';
// New Google GenAI SDK
import { GoogleGenAI, Modality, FunctionDeclaration, Type } from '@google/genai';
// Legacy library for fallback
import { GoogleGenerativeAI } from '@google/generative-ai';

// Type for the new SDK client
type GenAIClient = GoogleGenAI;

type TranslationBundle = typeof translations[keyof typeof translations];

const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  voice: 'Zephyr',
  language: 'de-DE',
  avatarUrl: null,
  memory: {
    keyRelationships: [],
    majorLifeEvents: [],
    recurringThemes: [],
    userGoals: [],
  },
  goals: [],
  moodJournal: [],
  journal: [],
  onboardingCompleted: false,
  subscription: {
    plan: SubscriptionPlan.FREE,
  },
};

function App() {
  // Helper to validate API key (avoid placeholders)
  const getValidApiKey = () => {
    // Support both VITE_API_KEY and VITE_GEMINI_API_KEY (or defined via vite.config.ts)
    const envObj = (import.meta as any).env || {};
    const key = (envObj.VITE_API_KEY || envObj.VITE_GEMINI_API_KEY) as string | undefined;
    if (!key) return null;
    const invalid = ['YOUR_API_KEY', 'YOUR_API_KEY_HERE', 'PLACEHOLDER_API_KEY'];
    return invalid.includes(String(key)) ? null : key;
  };
  
  const { user, session, loading: authLoading, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [activeDistortion, setActiveDistortion] = useState<CognitiveDistortion | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'dark') {
        return true;
      }
      if (storedTheme === 'light') {
        return false;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.warn('Unable to access stored theme preference:', error);
      return false;
    }
  });

  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const genAIRef = useRef<GenAIClient | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const ttsServiceRef = useRef<TextToSpeechService | null>(null);
  const audioVisualizationRef = useRef<AudioVisualization | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const recognitionGotResultRef = useRef<boolean>(false);
  const [isRecordingFallback, setIsRecordingFallback] = useState(false);
  // Realtime (Gemini live) session refs
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioPlaybackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextAudioStartTimeRef = useRef<number>(0);
  const currentInputRef = useRef<string>('');
  const currentOutputRef = useRef<string>('');
  const sessionStateRef = useRef<SessionState>(SessionState.IDLE);
  const liveActivityTimerRef = useRef<number | null>(null);
  const liveHadActivityRef = useRef<boolean>(false);
  const lastTranscriptEntryIdRef = useRef<string>('');
  const toolCallIdRef = useRef<string | null>(null);
  const summaryAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const summaryAudioContextRef = useRef<AudioContext | null>(null);
  const summaryAudioCacheRef = useRef<Record<string, string>>({});
  // Modals & UI states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isExerciseVisible, setIsExerciseVisible] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
  const [voicePreviewState, setVoicePreviewState] = useState<{ id: string; status: 'loading' | 'playing' } | null>(null);
  const [isProcessingSession, setIsProcessingSession] = useState(false);
  const [showPostSessionSummary, setShowPostSessionSummary] = useState(false);
  const [summaryPlaybackState, setSummaryPlaybackState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'journal' | 'profile' | 'insights'>('chat');
  // Auth entry state (welcome vs auth)
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'signup' | 'login'>('signup');

  const T = translations[userProfile.language as keyof typeof translations] || translations['de-DE'];

  // Keep a ref of sessionState for use in async handlers
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  useEffect(() => {
    const shouldShowSummary = (showPostSessionSummary || (sessionState === SessionState.IDLE && activeSession?.summary)) && !isProcessingSession;
    if (!shouldShowSummary) {
      stopSummaryPlayback();
    }
  }, [showPostSessionSummary, sessionState, activeSession?.summary, isProcessingSession]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      } catch (error) {
        console.warn('Unable to persist theme preference:', error);
      }
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'theme') {
        return;
      }

      if (event.newValue === 'dark') {
        setIsDarkMode(true);
        return;
      }

      if (event.newValue === 'light') {
        setIsDarkMode(false);
        return;
      }

      try {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      } catch (error) {
        console.warn('Unable to read system theme preference:', error);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Initialize Gemini AI and Voice Services
  useEffect(() => {
    const apiKey = getValidApiKey();
    if (apiKey) {
      genAIRef.current = new GoogleGenAI({ apiKey });
    }

    // Initialize voice services
    speechRecognitionRef.current = new SpeechRecognitionService();
    ttsServiceRef.current = new TextToSpeechService();
    audioVisualizationRef.current = new AudioVisualization();

    return () => {
      // Cleanup on unmount
      speechRecognitionRef.current?.abort();
      ttsServiceRef.current?.stop();
      audioVisualizationRef.current?.cleanup();
    };
  }, []);

  // Update speech recognition language when user profile changes
  useEffect(() => {
    if (speechRecognitionRef.current && userProfile.language) {
      speechRecognitionRef.current.setLanguage(userProfile.language);
    }
  }, [userProfile.language]);

  // Track previous user ID to detect user changes
  const previousUserIdRef = useRef<string | null>(null);
  
  // Optimized profile loading with caching - only depends on user and authLoading
  const loadingProfileRef = useRef(false);
  useEffect(() => {
    if (authLoading) {
      return;
    }

    const loadUserProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        previousUserIdRef.current = null;
        return;
      }

      // Detect if user changed - if so, force refresh
      const userChanged = previousUserIdRef.current !== user.id;
      if (userChanged) {
        console.log('🔄 User changed - forcing profile refresh:', {
          previous: previousUserIdRef.current,
          current: user.id
        });
        previousUserIdRef.current = user.id;
      }

      // Prevent concurrent loads
      if (loadingProfileRef.current) {
        console.log('⏸️ Profile load already in progress, skipping...');
        return;
      }

      try {
        loadingProfileRef.current = true;
        setIsLoadingProfile(true);
        console.log('📥 Loading profile for user:', user.id, userChanged ? '(force refresh)' : '');

        // Use optimized profile loading with caching - pass session directly
        // Force refresh if user changed to ensure we get the latest data
        const profile = await getUserProfile(user.id, session, userChanged);
        
        if (profile) {
          console.log('✅ Profile loaded successfully:', {
            name: profile.name,
            onboardingCompleted: profile.onboardingCompleted,
            forceRefresh: userChanged
          });
          
          const mergedProfile = {
            ...DEFAULT_PROFILE,
            ...profile,
            onboardingCompleted: profile.onboardingCompleted === true,
          };
          setUserProfile(mergedProfile);
        } else {
          console.log('⚠️ No profile found, using default');
          setUserProfile(DEFAULT_PROFILE);
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        // Fallback to default in UI to avoid onboarding loop
        setUserProfile(DEFAULT_PROFILE);
      } finally {
        setIsLoadingProfile(false);
        loadingProfileRef.current = false;
      }
    };

    loadUserProfile();
  }, [user, authLoading, session]); // session included but guarded against concurrent loads

  // Load chat sessions when profile is loaded
  useEffect(() => {
    const loadSessions = async () => {
      if (!user || !userProfile.onboardingCompleted) return;

      try {
        const loadedSessions = await getChatSessions(user.id);
        setSessions(loadedSessions);
        
        // Load active session if none selected
        if (!activeSession && loadedSessions.length > 0) {
          const session = loadedSessions[0];
          const transcripts = await getTranscriptEntries(session.id);
          setActiveSession({ ...session, transcript: transcripts });
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    };

    loadSessions();
  }, [user, userProfile.onboardingCompleted]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const { error } = await signIn(email, password);
      if (error) {
        setAuthError(error.message || 'Fehler bei der Anmeldung');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Fehler bei der Anmeldung');
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const { error } = await signUp(email, password, 'User');
      if (error) {
        setAuthError(error.message || 'Fehler bei der Registrierung');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Fehler bei der Registrierung');
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
      // Der Redirect wird automatisch von Supabase gehandhabt
    } catch (error: any) {
      setAuthError(error.message || 'Fehler beim Google-Login');
    }
  };

  const handleOnboardingComplete = async (completedProfile: UserProfile) => {
    if (!user) return;

    const updatedProfile = {
      ...completedProfile,
      onboardingCompleted: true,
    };

    console.log('Onboarding complete - Profile to save:', {
      name: updatedProfile.name,
      onboardingCompleted: updatedProfile.onboardingCompleted,
      userId: user.id
    });

    try {
      // Update UI immediately to let the user proceed
      setUserProfile(updatedProfile);
      
      // CRITICAL: Persist to Supabase FIRST before doing anything else
      console.log('💾 Starting to save profile...');
      await updateUserProfile(user.id, updatedProfile);
      console.log('✅ Profile saved to Supabase successfully');
      
      // Create first session
      await handleNewChat();
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      // Show error to user
      alert('Fehler: Das Onboarding konnte nicht gespeichert werden. Bitte versuche es erneut oder kontaktiere den Support.');
    }
  };

  const handlePreviewVoice = async (voiceId: string, language: string) => {
    try {
      if (!ttsServiceRef.current?.isSupported()) {
        console.warn('TTS not supported in this browser');
        return;
      }
      // Toggle stop if currently previewing
      if (voicePreviewState?.id === voiceId) {
        ttsServiceRef.current.stop();
        setVoicePreviewState(null);
        return;
      }

      const sample = language.startsWith('de')
        ? 'Hallo! So klingt diese Stimme. Gefällt dir diese Stimmlage?'
        : 'Hello! This is a voice preview. Do you like this tone?';
      setVoicePreviewState({ id: voiceId, status: 'loading' });
      setVoicePreviewState({ id: voiceId, status: 'playing' });
      await ttsServiceRef.current.speak(sample, language, voiceId);
    } catch (error) {
      console.error('Voice preview failed:', error);
    } finally {
      setVoicePreviewState(null);
    }
  };

  const handlePreviewVoiceFromProfile = async (voiceId: string) => {
    await handlePreviewVoice(voiceId, userProfile.language || 'de-DE');
  };

  const buildConversationText = (transcript: TranscriptEntry[]): string => {
    return transcript
      .slice(1)
      .map(entry => `${entry.speaker === Speaker.USER ? 'User' : 'Aura'}: ${entry.text}`)
      .join('\n');
  };

  // Build comprehensive system instruction with memory, goals, and mood
  const getSystemInstruction = (language: string, profile: UserProfile): string => {
    const T = translations[language as keyof typeof translations] || translations['de-DE'];
    let instruction = T.BASE_SYSTEM_INSTRUCTION;

    instruction += `\n\n${T.userNamePrompt(profile.name)}`;

    if (profile.memory && Object.values(profile.memory).some(arr => Array.isArray(arr) && arr.length > 0)) {
      instruction += `\n\n---\n${T.memoryHeader(profile.name.toUpperCase())}\n${T.memoryInstructions}\n${JSON.stringify(profile.memory, null, 2)}\n---`;
    }

    const activeGoals = profile.goals?.filter(g => g.status === 'active') || [];
    if (activeGoals.length > 0) {
      const goalsText = activeGoals.map(g => `- ${g.description}`).join('\n');
      instruction += `\n\n---\n${T.goalsHeader}\n${T.goalsInstructions}\n${goalsText}\n---`;
    }

    if (profile.moodJournal && profile.moodJournal.length > 0) {
      const recentMoods = profile.moodJournal.slice(-7);
      if (recentMoods.length > 0) {
        const moodSummary = recentMoods.map(entry => {
          const date = new Date(entry.createdAt);
          const moodText = T.ui.moods[entry.mood as Mood] || entry.mood;
          return `- ${date.toLocaleDateString(language, { weekday: 'short' })}: ${moodText}${entry.note ? ` (${entry.note})` : ''}`;
        }).join('\n');
        instruction += `\n\n---\n${T.moodHeader}\n${T.moodInstructions}\n${moodSummary}\n---`;
      }
    }
    return instruction;
  };

  const summarizeAndCreateNotes = async (
    transcript: TranscriptEntry[],
    name: string,
    translationBundle: TranslationBundle,
  ): Promise<string> => {
    if (!genAIRef.current) return '';
    const conversation = buildConversationText(transcript);
    if (!conversation) return '';

    try {
      const response = await genAIRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: translationBundle.summarizeNotesPrompt(name, conversation) }],
        }],
      });
      return response.text.trim();
    } catch (error) {
      console.warn('Note generation failed:', error);
      return '';
    }
  };

  const generateUserSummaryText = async (
    transcript: TranscriptEntry[],
    name: string,
    translationBundle: TranslationBundle,
  ): Promise<string> => {
    if (!genAIRef.current) return '';
    const conversation = buildConversationText(transcript);
    if (!conversation) return '';

    try {
      const response = await genAIRef.current.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{
          role: 'user',
          parts: [{ text: translationBundle.generateUserSummaryPrompt(name, conversation) }],
        }],
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });
      return response.text.trim();
    } catch (error) {
      console.warn('User summary failed:', error);
      return '';
    }
  };

  const askAuraMemoryUpdate = async (
    transcript: TranscriptEntry[],
    currentMemory: AuraMemory,
    translationBundle: TranslationBundle,
  ): Promise<AuraMemory> => {
    if (!genAIRef.current) return currentMemory;
    const conversation = buildConversationText(transcript);
    if (!conversation) return currentMemory;

    try {
      const response = await genAIRef.current.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{
          role: 'user',
          parts: [{ text: translationBundle.updateAuraMemoryPrompt(currentMemory, conversation) }],
        }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keyRelationships: { type: Type.ARRAY, items: { type: Type.STRING } },
              majorLifeEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
              recurringThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
              userGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });
      const jsonStr = response.text.trim();
      if (!jsonStr) return currentMemory;
      return JSON.parse(jsonStr) as AuraMemory;
    } catch (error) {
      console.warn('Memory update failed:', error);
      return currentMemory;
    }
  };

  const generateMoodTrendData = async (
    transcript: TranscriptEntry[],
    translationBundle: TranslationBundle,
  ): Promise<number[] | undefined> => {
    if (!genAIRef.current) return undefined;
    const conversation = buildConversationText(transcript);
    if (!conversation) return undefined;

    try {
      const response = await genAIRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: translationBundle.moodTrendPrompt(conversation) }],
        }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        },
      });
      const jsonStr = response.text.trim();
      if (!jsonStr) return undefined;
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) && parsed.length === 4 && parsed.every((n: any) => typeof n === 'number')
        ? parsed
        : undefined;
    } catch (error) {
      console.warn('Mood trend generation failed:', error);
      return undefined;
    }
  };

  const generateWordCloudData = async (
    transcript: TranscriptEntry[],
    translationBundle: TranslationBundle,
  ): Promise<{ text: string; value: number }[] | undefined> => {
    if (!genAIRef.current) return undefined;
    const conversation = buildConversationText(transcript);
    if (!conversation) return undefined;

    try {
      const response = await genAIRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: translationBundle.wordCloudPrompt(conversation) }],
        }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                value: { type: Type.NUMBER },
              },
            },
          },
        },
      });
      const jsonStr = response.text.trim();
      if (!jsonStr) return undefined;
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? (parsed as { text: string; value: number }[]) : undefined;
    } catch (error) {
      console.warn('Word cloud generation failed:', error);
      return undefined;
    }
  };

  const generateSummaryAudio = async (text: string, language: string, voice: string): Promise<string | undefined> => {
    if (!genAIRef.current) return undefined;
    try {
      const response = await genAIRef.current.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{
          role: 'user',
          parts: [{ text }],
        }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Zephyr' } },
          },
        },
      });
      const candidate = response.candidates?.[0];
      return candidate?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      console.warn('Summary audio generation failed:', error);
      return undefined;
    }
  };

  const stopSummaryPlayback = () => {
    if (summaryAudioSourceRef.current) {
      summaryAudioSourceRef.current.stop();
      summaryAudioSourceRef.current.onended = null;
    }
    if (summaryAudioContextRef.current) {
      summaryAudioContextRef.current.close();
    }
    summaryAudioSourceRef.current = null;
    summaryAudioContextRef.current = null;
    setSummaryPlaybackState('idle');
  };

  const playSummaryAudio = async () => {
    if (summaryPlaybackState !== 'idle') {
      stopSummaryPlayback();
      return;
    }
    
    if (!activeSession?.summary) return;

    setSummaryPlaybackState('loading');
    
    try {
      let base64Audio: string | undefined;

      // 1. Check in-memory cache
      if (summaryAudioCacheRef.current[activeSession.id]) {
        base64Audio = summaryAudioCacheRef.current[activeSession.id];
      } 
      // 2. Check transient state for just-completed session
      else if (activeSession.summaryAudioBase64) {
        base64Audio = activeSession.summaryAudioBase64;
      }
      // 3. Generate if not found
      else {
        base64Audio = await generateSummaryAudio(activeSession.summary, userProfile.language || 'de-DE', userProfile.voice || 'Zephyr');
      }

      if (base64Audio) {
        // Cache the generated audio
        summaryAudioCacheRef.current[activeSession.id] = base64Audio;
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        summaryAudioContextRef.current = audioCtx;
        
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        summaryAudioSourceRef.current = source;
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        setSummaryPlaybackState('playing');
        
        source.onended = () => {
          stopSummaryPlayback();
        };
      } else {
        setSummaryPlaybackState('idle');
      }
    } catch (e) {
      console.error("Failed to play summary audio:", e);
      setSummaryPlaybackState('idle');
    }
  };

  const handleExportSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const date = new Date(session.startTime);
    const dateStringForFile = date.toISOString().split('T')[0]; // YYYY-MM-DD

    let content = `Aura Session: ${session.title}\n`;
    content += `Date: ${date.toLocaleString(userProfile.language || 'de-DE', { dateStyle: 'full', timeStyle: 'short' })}\n\n`;
    content += `====================\n\n`;

    content += `TRANSCRIPT\n\n`;
    (session.transcript || []).forEach(entry => {
      const speaker = entry.speaker === Speaker.USER ? userProfile.name : 'Aura';
      content += `[${speaker}]: ${entry.text}\n\n`;
    });

    if (session.summary) {
      content += `====================\n\n`;
      content += `SUMMARY\n\n`;
      content += session.summary;
    }

    const sanitizedTitle = session.title.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
    const filename = `Aura-Session-${sanitizedTitle}-${dateStringForFile}.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStartEditing = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveTitle = async () => {
    if (editingSessionId && editingTitle.trim()) {
      setSessions(prev =>
        prev.map(s =>
          s.id === editingSessionId ? { ...s, title: editingTitle.trim() } : s
        )
      );
      if (activeSession?.id === editingSessionId) {
        setActiveSession(prev => prev ? { ...prev, title: editingTitle.trim() } : null);
      }
      if (user) {
        await updateChatSession(editingSessionId, { title: editingTitle.trim() });
      }
      setEditingSessionId(null);
      setEditingTitle('');
    }
  };

  const handleCancelEditing = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const moodConfig: { [key in Mood]: { icon: React.FC<{ className?: string }>; color: string; value: number } } = {
    'Sehr gut': { icon: MoodVeryGoodIcon, color: 'text-green-500 dark:text-green-400', value: 5 },
    'Gut': { icon: MoodGoodIcon, color: 'text-lime-500 dark:text-lime-400', value: 4 },
    'Neutral': { icon: MoodNeutralIcon, color: 'text-yellow-500 dark:text-yellow-400', value: 3 },
    'Schlecht': { icon: MoodBadIcon, color: 'text-orange-500 dark:text-orange-400', value: 2 },
    'Sehr schlecht': { icon: MoodVeryBadIcon, color: 'text-red-500 dark:text-red-400', value: 1 },
  };

  const MoodTrendChart: React.FC<{ data: number[] }> = ({ data }) => {
    const width = 300;
    const height = 100;
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - 1) / 4) * (height - 20) + 10; // Map 1-5 to y-coord with padding
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M0,${height} L${points} L${width},${height} Z`} fill="url(#trendGradient)" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((value - 1) / 4) * (height - 20) + 10;
          return <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6" stroke="#fff" strokeWidth="1" />;
        })}
      </svg>
    );
  };

  const WordCloudDisplay: React.FC<{ data: { text: string; value: number }[] }> = ({ data }) => {
    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    const getStyle = (value: number) => {
      const ratio = (value - minVal) / (maxVal - minVal);
      const fontSize = 12 + ratio * 24; // from 12px to 36px
      const opacity = 0.6 + ratio * 0.4; // from 0.6 to 1
      return { fontSize: `${fontSize}px`, opacity };
    };

    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-4">
        {data.sort((a, b) => b.value - a.value).map(item => (
          <span key={item.text} style={getStyle(item.value)} className="font-semibold text-slate-700 dark:text-slate-300 transition-all">
            {item.text}
          </span>
        ))}
      </div>
    );
  };

  const renderInsightsView = () => {
    const recentMoods = (userProfile.moodJournal || []).slice(-30).sort((a, b) => a.createdAt - b.createdAt);
    const recurringThemes = userProfile.memory?.recurringThemes || [];
    const allDistortions = sessions.flatMap(s => s.cognitiveDistortions || []);
    const uniqueDistortionTypes = [...new Set(allDistortions.map(d => d.type))];
    const latestSession = sessions.filter(s => s.summary).sort((a, b) => b.startTime - a.startTime)[0];
    const isPremium = userProfile.subscription.plan === SubscriptionPlan.PREMIUM;

    return (
      <div className="flex-1 overflow-y-auto p-4 animate-fade-in min-h-0">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Chart */}
          <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.moodChartTitle(recentMoods.length)}</h3>
            {recentMoods.length > 1 ? (
              <div className="flex items-end justify-around h-48 border-b border-slate-200 dark:border-slate-700 pb-2">
                {recentMoods.map(entry => {
                  const { icon: Icon, color, value } = moodConfig[entry.mood];
                  const barHeight = (value / 5) * 100;
                  return (
                    <div key={entry.id} className="flex flex-col items-center justify-end h-full group w-10" title={`${T.ui.moods[entry.mood]} on ${new Date(entry.createdAt).toLocaleDateString(userProfile.language || 'de-DE')}`}>
                      <div className="w-2.5 bg-slate-200 dark:bg-slate-700 rounded-t-full" style={{ height: `${100 - barHeight}%` }}></div>
                      <div className="w-2.5 bg-blue-500 rounded-t-full group-hover:bg-blue-400" style={{ height: `${barHeight}%` }}></div>
                      <Icon className={`w-5 h-5 mt-2 ${color}`} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.moodChartEmpty}</p>
            )}
          </div>
          {/* Session Mood Trend */}
          <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm col-span-1 lg:col-span-2 relative">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.sessionMoodTrendTitle}</h3>
            {latestSession?.moodTrend ? (
              <MoodTrendChart data={latestSession.moodTrend} />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.sessionMoodTrendEmpty}</p>
            )}
            {!isPremium && <PremiumLockOverlay onUpgrade={() => setIsSubscriptionOpen(true)} T={T} />}
          </div>
          {/* Topic Cloud */}
          <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm col-span-1 lg:col-span-2 relative">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.wordCloudTitle}</h3>
            {latestSession?.wordCloud ? (
              <WordCloudDisplay data={latestSession.wordCloud} />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.wordCloudEmpty}</p>
            )}
            {!isPremium && <PremiumLockOverlay onUpgrade={() => setIsSubscriptionOpen(true)} T={T} />}
          </div>

          {/* Recurring Themes */}
          <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm relative">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.recurringThemesTitle}</h3>
            {recurringThemes.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {recurringThemes.map((theme, i) => <li key={i} className="text-sm text-slate-700 dark:text-slate-300">{theme}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.recurringThemesEmpty}</p>
            )}
            {!isPremium && <PremiumLockOverlay onUpgrade={() => setIsSubscriptionOpen(true)} T={T} />}
          </div>
          {/* Cognitive Distortions */}
          <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm relative">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.distortionsTitle}</h3>
            {uniqueDistortionTypes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {uniqueDistortionTypes.map(type => (
                  <span key={type} className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50 rounded-full">{type}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.distortionsEmpty}</p>
            )}
            {!isPremium && <PremiumLockOverlay onUpgrade={() => setIsSubscriptionOpen(true)} T={T} />}
          </div>
        </div>
      </div>
    );
  };

  const generateJournalInsights = async (
    entry: string,
    translationBundle: TranslationBundle,
  ): Promise<JournalInsights | undefined> => {
    if (!genAIRef.current) return undefined;
    try {
      const response = await genAIRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: translationBundle.journalInsightPrompt(entry) }],
        }],
      });
      const jsonStr = response.text.trim();
      if (!jsonStr) return undefined;
      const parsed = JSON.parse(jsonStr);
      if (parsed?.keyThemes && parsed?.positiveNotes) {
        return { keyThemes: parsed.keyThemes, positiveNotes: parsed.positiveNotes };
      }
      return undefined;
    } catch (error) {
      console.warn('Journal insights failed:', error);
      return undefined;
    }
  };

  const startBreathingExercise: FunctionDeclaration = {
    name: 'startBreathingExercise',
    description: 'Start a guided breathwork exercise for moments of high stress or panic.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  };

  const identifyCognitiveDistortion: FunctionDeclaration = {
    name: 'identifyCognitiveDistortion',
    description: 'Flag a statement containing a cognitive distortion so the user can explore it.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        distortion: { type: Type.STRING, description: 'Name of the distortion (e.g. catastrophizing, all-or-nothing).' },
        statement: { type: Type.STRING, description: 'The exact user statement containing the distortion.' },
      },
      required: ['distortion', 'statement'],
    },
  };

  const triggerCrisisIntervention: FunctionDeclaration = {
    name: 'triggerCrisisIntervention',
    description: 'Initiate the crisis intervention flow in case of imminent self-harm or suicide intent.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  };

  const generateAndStoreSummary = async (session: ChatSession, lang: string) => {
    try {
      if (!genAIRef.current || !session?.transcript || session.transcript.length <= 1) return;

      setIsProcessingSession(true);
      setShowPostSessionSummary(false);

      const translationBundle = translations[lang as keyof typeof translations] || translations['de-DE'];
      const [notes, summary, memoryUpdate, moodTrend, wordCloud] = await Promise.all([
        summarizeAndCreateNotes(session.transcript, userProfile.name, translationBundle),
        generateUserSummaryText(session.transcript, userProfile.name, translationBundle),
        askAuraMemoryUpdate(session.transcript, userProfile.memory, translationBundle),
        generateMoodTrendData(session.transcript, translationBundle),
        generateWordCloudData(session.transcript, translationBundle),
      ]);

      const summaryText = summary || session.summary || '';
      const notesText = notes || session.notes || '';
      const summaryAudioBase64 = summaryText ? await generateSummaryAudio(summaryText, lang, userProfile.voice) : session.summaryAudioBase64;
      const updatedMemory = memoryUpdate || userProfile.memory;

      if (summaryAudioBase64 && session.id) {
        summaryAudioCacheRef.current[session.id] = summaryAudioBase64;
      }

      setActiveSession(prev =>
        prev && prev.id === session.id
          ? { ...prev, summary: summaryText, notes: notesText, moodTrend, wordCloud, summaryAudioBase64 }
          : prev,
      );
      setSessions(prev =>
        prev.map(existingSession =>
          existingSession.id === session.id
            ? { ...existingSession, summary: summaryText, notes: notesText, moodTrend, wordCloud, summaryAudioBase64 }
            : existingSession,
        ),
      );
      setUserProfile(prev => ({ ...prev, memory: updatedMemory }));

      await updateChatSession(session.id, { summary: summaryText, notes: notesText, summaryAudioBase64, moodTrend, wordCloud });
      if (user) {
        await updateAuraMemory(user.id, updatedMemory);
      }

      setShowPostSessionSummary(true);
    } catch (error) {
      console.warn('Session analysis failed:', error);
    } finally {
      setIsProcessingSession(false);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;

    setShowPostSessionSummary(false);
    stopSummaryPlayback();

    try {
      const sessionId = await createChatSession(user.id, {
        title: `Gespräch ${new Date().toLocaleDateString('de-DE')}`,
        transcript: [],
        startTime: Date.now(),
      });

      const newSession: ChatSession = {
        id: sessionId,
        title: `Gespräch ${new Date().toLocaleDateString('de-DE')}`,
        transcript: [],
        startTime: Date.now(),
      };

      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      setSidebarOpen(false);
      setCurrentView('chat');
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      const transcripts = await getTranscriptEntries(sessionId);
      setActiveSession({ ...session, transcript: transcripts });
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;

    try {
      await deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleProfileChange = async (newProfile: UserProfile) => {
    if (!user) return;
    try {
      await updateUserProfile(user.id, newProfile);
      setUserProfile(newProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSaveGoal = async (description: string) => {
    if (!user) return;
    try {
      await addGoal(user.id, { description, status: 'active', createdAt: Date.now() });
      setUserProfile(prev => ({
        ...prev,
        goals: [...(prev.goals || []), { id: crypto.randomUUID(), description, status: 'active', createdAt: Date.now() }],
      }));
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleSuggestSmartGoal = async (description: string): Promise<string> => {
    if (!genAIRef.current) {
      return description; // Fallback to original if no AI
    }
    try {
      const translationBundle = translations[userProfile.language as keyof typeof translations] || translations['de-DE'];
      const response = await genAIRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: translationBundle.smartGoalPrompt(description) }],
        }],
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error suggesting smart goal:', error);
      return description; // Fallback to original on error
    }
  };

  const handleSaveMood = async (mood: Mood, note?: string) => {
    if (!user) return;
    try {
      const createdAt = Date.now();
      await addMoodEntry(user.id, { mood, note, createdAt });
      setUserProfile(prev => ({
        ...prev,
        moodJournal: [{ id: crypto.randomUUID(), mood, note, createdAt }, ...(prev.moodJournal || [])],
      }));
    } catch (error) {
      console.error('Error saving mood entry:', error);
    }
  };

  const handleSaveJournal = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      const createdAt = Date.now();
      const insights = await generateJournalInsights(entry.content, T);
      const id = await addJournalEntry(user.id, { ...entry, createdAt });
      setUserProfile(prev => ({
        ...prev,
        journal: [{ id, content: entry.content, createdAt, insights }, ...(prev.journal || [])],
      }));
      setEditingJournalEntry(null);
      setIsJournalOpen(false);
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const handleDeleteJournal = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteJournalEntry(entryId);
      setUserProfile(prev => ({
        ...prev,
        journal: (prev.journal || []).filter(e => e.id !== entryId),
      }));
      setEditingJournalEntry(null);
      setIsJournalOpen(false);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  const handleUpgradeToPremium = async () => {
    if (!user) return;
    try {
      const next = {
        ...userProfile,
        subscription: { plan: SubscriptionPlan.PREMIUM, expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000 },
      } as UserProfile;
      await updateUserProfile(user.id, next);
      setUserProfile(next);
      setIsSubscriptionOpen(false);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const handleStopSession = async (skipAnalysis: boolean = false) => {
    const sessionSnapshot = activeSession;
    try {
      setIsExerciseVisible(false);
      // Stop any ongoing speech recognition or TTS
      speechRecognitionRef.current?.stop();
      ttsServiceRef.current?.stop();

      // Clear live activity guard timer
      if (liveActivityTimerRef.current) {
        clearTimeout(liveActivityTimerRef.current);
        liveActivityTimerRef.current = null;
      }

      // Stop realtime session if active
      if (sessionPromiseRef.current) {
        try {
          const s = await sessionPromiseRef.current;
          if (s && typeof s.close === 'function') {
            s.close();
          }
        } catch {}
        sessionPromiseRef.current = null;
      }

      // Stop any scheduled/playing output audio
      try {
        audioPlaybackSourcesRef.current.forEach((src) => {
          try { src.stop(); } catch { /* ignore */ }
        });
      } catch { /* ignore */ }
      audioPlaybackSourcesRef.current.clear();
      nextAudioStartTimeRef.current = 0;

      // Dispose audio contexts and nodes
      if (scriptProcessorRef.current) {
        try { scriptProcessorRef.current.disconnect(); } catch {}
        scriptProcessorRef.current = null;
      }
      if (mediaStreamSourceRef.current) {
        try { mediaStreamSourceRef.current.disconnect(); } catch {}
        mediaStreamSourceRef.current = null;
      }
      if (inputAudioContextRef.current) {
        try { await inputAudioContextRef.current.close(); } catch {}
        inputAudioContextRef.current = null;
      }
      if (outputAudioContextRef.current) {
        try { await outputAudioContextRef.current.close(); } catch {}
        outputAudioContextRef.current = null;
      }

      // If fallback recording is active, stop and transcribe
      if (isRecordingFallback && voiceRecorderRef.current) {
        setSessionState(SessionState.PROCESSING);
        let transcript = '';
        try {
          const blob = await voiceRecorderRef.current.stop();
          const buffer = await blob.arrayBuffer();
          const b64 = encode(new Uint8Array(buffer));

          if (genAIRef.current) {
            const response = await genAIRef.current.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [{
                role: 'user',
                parts: [
                  { text: 'Transkribiere die folgende deutsche Sprachnachricht. Gib nur den reinen Text zurück.' },
                  { inlineData: { data: b64, mimeType: blob.type || 'audio/webm' } },
                ]
              }]
            });
            transcript = response.text.trim();
          }
        } catch (err) {
          console.error('Transcription error:', err);
        } finally {
          setIsRecordingFallback(false);
        }

        // Cleanup mic visualization and stream
        audioVisualizationRef.current?.cleanup();
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((t) => t.stop());
          micStreamRef.current = null;
        }
        inputAnalyserRef.current = null;

        if (transcript) {
          await handleSendMessage(transcript, true);
          // After responding, generate/update summary
          if (sessionSnapshot && !skipAnalysis) {
            generateAndStoreSummary(sessionSnapshot, userProfile.language);
          }
          return;
        }
        setSessionState(SessionState.IDLE);
        if (sessionSnapshot && !skipAnalysis) {
          generateAndStoreSummary(sessionSnapshot, userProfile.language);
        }
        return;
      }

      // Default cleanup
      setSessionState(SessionState.IDLE);
      audioVisualizationRef.current?.cleanup();
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      inputAnalyserRef.current = null;
      if (sessionSnapshot && !skipAnalysis) {
        generateAndStoreSummary(sessionSnapshot, userProfile.language);
      }
    } catch (error) {
      console.error('Error stopping session:', error);
      setSessionState(SessionState.ERROR);
    }
  };

  const handleStartVoiceSession = async () => {
    try {
      // Prepare mic visualization
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } as MediaTrackConstraints,
        });
        micStreamRef.current = stream;
        if (audioVisualizationRef.current) {
          inputAnalyserRef.current = await audioVisualizationRef.current.createFromStream(stream);
        }
      } catch (err) {
        console.warn('Mic visualization unavailable:', err);
      }

      // Prefer realtime Gemini live streaming when a valid API key is available
      const apiKey = getValidApiKey();
      if (apiKey) {
        setSessionState(SessionState.CONNECTING);
        currentInputRef.current = '';
        currentOutputRef.current = '';

        // Create audio contexts (16k for input, 24k for output)
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        inputAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
        inputAnalyserRef.current.fftSize = 256;
        outputAnalyserRef.current = outputAudioContextRef.current.createAnalyser();
        outputAnalyserRef.current.fftSize = 256;

        const ai = new GoogleGenAI({ apiKey });
        const dynamicSystemInstruction = getSystemInstruction(userProfile.language || 'de-DE', userProfile);

        sessionPromiseRef.current = ai.live.connect({
          // Use the official live model id from the SDK docs
          // Use the same model id that worked in the previous project for maximum compatibility
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            systemInstruction: dynamicSystemInstruction,
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: userProfile.voice || 'Zephyr',
                },
              },
            },
            tools: [{
              functionDeclarations: [startBreathingExercise, identifyCognitiveDistortion, triggerCrisisIntervention],
            }],
          },
          callbacks: {
            onopen: () => {
              setSessionState(SessionState.LISTENING);
              // Guard: if live session receives no input/response, fallback to local STT
              liveHadActivityRef.current = false;
              if (liveActivityTimerRef.current) {
                clearTimeout(liveActivityTimerRef.current);
              }
              liveActivityTimerRef.current = window.setTimeout(async () => {
                if (!liveHadActivityRef.current) {
                  try {
                    // Try Web Speech API first
                    if (speechRecognitionRef.current?.isSupported()) {
                      recognitionGotResultRef.current = false;
                      speechRecognitionRef.current.start(
                        (transcript) => {
                          recognitionGotResultRef.current = true;
                          setCurrentInput(transcript);
                          handleSendMessage(transcript, true);
                        },
                        async () => {
                          // If no transcript, fallback to MediaRecorder
                          try {
                            if (!voiceRecorderRef.current) voiceRecorderRef.current = new VoiceRecorder();
                            await voiceRecorderRef.current.start();
                            setIsRecordingFallback(true);
                            setSessionState(SessionState.LISTENING);
                          } catch (e) {
                            console.warn('Fallback recorder failed to start:', e);
                            setSessionState(SessionState.ERROR);
                          }
                        }
                      );
                    } else {
                      // Hard fallback: MediaRecorder
                      if (!voiceRecorderRef.current) voiceRecorderRef.current = new VoiceRecorder();
                      await voiceRecorderRef.current.start();
                      setIsRecordingFallback(true);
                      setSessionState(SessionState.LISTENING);
                    }
                  } catch (e) {
                    console.error('Live no-activity fallback failed:', e);
                    setSessionState(SessionState.ERROR);
                  }
                }
              }, 5000);

              mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(micStreamRef.current!);
              scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Send PCM audio chunk to Gemini Live. Try v1.27 shape first, then 1.28 fallback.
                const payload: any = createBlob(inputData);
                sessionPromiseRef.current?.then((s: any) => {
                  try {
                    s.sendRealtimeInput({ media: payload });
                  } catch (err1) {
                    try {
                      s.sendRealtimeInput({ inlineData: payload });
                    } catch (err2) {
                      // Swallow to avoid flooding logs per audio frame
                    }
                  }
                });

                // Simple VAD-like RMS monitor
                const VAD_THRESHOLD = 0.01;
                const SILENCE_DELAY = 800;
                const rms = Math.sqrt(inputData.reduce((acc, val) => acc + val * val, 0) / inputData.length);

                if (rms > VAD_THRESHOLD) {
                  if (sessionStateRef.current !== SessionState.USER_SPEAKING) {
                    setSessionState(SessionState.USER_SPEAKING);
                  }
                } else {
                  if (sessionStateRef.current === SessionState.USER_SPEAKING) {
                    // revert to listening after a moment of silence
                    setTimeout(() => {
                      if (sessionStateRef.current === SessionState.USER_SPEAKING) {
                        setSessionState(SessionState.LISTENING);
                      }
                    }, SILENCE_DELAY);
                  }
                }
              };
              mediaStreamSourceRef.current.connect(inputAnalyserRef.current!);
              inputAnalyserRef.current!.connect(scriptProcessorRef.current);
              scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
            },
            onmessage: async (message: any) => {
              const inputT = message?.serverContent?.inputTranscription?.text;
              const outputT = message?.serverContent?.outputTranscription?.text;
              const turnDone = Boolean(message?.serverContent?.turnComplete);

              if (inputT) {
                liveHadActivityRef.current = true;
                if (liveActivityTimerRef.current) { clearTimeout(liveActivityTimerRef.current); liveActivityTimerRef.current = null; }
                currentInputRef.current += inputT;
                setCurrentInput(currentInputRef.current);
              }
              if (outputT) {
                liveHadActivityRef.current = true;
                if (liveActivityTimerRef.current) { clearTimeout(liveActivityTimerRef.current); liveActivityTimerRef.current = null; }
                if (sessionStateRef.current !== SessionState.SPEAKING) setSessionState(SessionState.SPEAKING);
                currentOutputRef.current += outputT;
                setCurrentOutput(currentOutputRef.current);
              }

              // Streamed audio from model
              const base64Audio = message?.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && outputAudioContextRef.current && outputAnalyserRef.current) {
                try {
                  liveHadActivityRef.current = true;
                  if (liveActivityTimerRef.current) { clearTimeout(liveActivityTimerRef.current); liveActivityTimerRef.current = null; }
                  const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                  const source = outputAudioContextRef.current.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputAnalyserRef.current);
                  outputAnalyserRef.current.connect(outputAudioContextRef.current.destination);
                  source.addEventListener('ended', () => audioPlaybackSourcesRef.current.delete(source));
                  nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, outputAudioContextRef.current.currentTime);
                  source.start(nextAudioStartTimeRef.current);
                  nextAudioStartTimeRef.current += audioBuffer.duration;
                  audioPlaybackSourcesRef.current.add(source);
                } catch (e) {
                  console.warn('Playback decode failed:', e);
                }
              }

              if (turnDone) {
                // Persist both sides of the turn
                const userText = currentInputRef.current.trim();
                const auraText = currentOutputRef.current.trim();
                currentInputRef.current = '';
                currentOutputRef.current = '';
                setCurrentInput('');
                setCurrentOutput('');
                setSessionState(SessionState.LISTENING);

                  if (activeSession && (userText || auraText)) {
                    if (userText) {
                      const userEntry: TranscriptEntry = { id: crypto.randomUUID(), speaker: Speaker.USER, text: userText };
                      lastTranscriptEntryIdRef.current = userEntry.id;
                      await addTranscriptEntryAuto(activeSession.id, userEntry);
                    setActiveSession(prev => prev ? { ...prev, transcript: [...(prev.transcript || []), userEntry] } : prev);
                  }
                  if (auraText) {
                    const auraEntry: TranscriptEntry = { id: crypto.randomUUID(), speaker: Speaker.AURA, text: auraText };
                    await addTranscriptEntryAuto(activeSession.id, auraEntry);
                    setActiveSession(prev => prev ? { ...prev, transcript: [...(prev.transcript || []), auraEntry] } : prev);
                  }
                }
              }
              if (message.toolCall?.functionCalls?.length) {
                for (const fc of message.toolCall.functionCalls) {
                  if (fc.name === 'startBreathingExercise') {
                    audioPlaybackSourcesRef.current.forEach(source => source.stop());
                    audioPlaybackSourcesRef.current.clear();
                    nextAudioStartTimeRef.current = 0;
                    toolCallIdRef.current = fc.id;
                    setIsExerciseVisible(true);
                  } else if (fc.name === 'identifyCognitiveDistortion') {
                    const { distortion, statement } = fc.args || {};
                    const newDistortion: CognitiveDistortion = {
                      type: (distortion as string) || 'unknown',
                      statement: (statement as string) || '',
                      transcriptEntryId: lastTranscriptEntryIdRef.current,
                    };
                    if (activeSession) {
                      setSessions(prev =>
                        prev.map(session =>
                          session.id === activeSession.id
                            ? {
                                ...session,
                                cognitiveDistortions: [...(session.cognitiveDistortions || []), newDistortion],
                              }
                            : session,
                        ),
                      );
                      setActiveSession(prev =>
                        prev && prev.id === activeSession.id
                          ? {
                              ...prev,
                              cognitiveDistortions: [...(prev.cognitiveDistortions || []), newDistortion],
                            }
                          : prev,
                      );
                      setActiveDistortion(newDistortion);
                      try {
                        await addCognitiveDistortion(activeSession.id, newDistortion);
                      } catch (insertionError) {
                        console.warn('Failed to save distortion:', insertionError);
                      }
                    }
                  } else if (fc.name === 'triggerCrisisIntervention') {
                    setIsCrisisModalOpen(true);
                    await handleStopSession(true);
                  }
                }
              }
            },
            onerror: async (e: any) => {
              console.error('Live session error, falling back to local STT:', e);
              // Try SpeechRecognition -> MediaRecorder fallback path
              try {
                if (speechRecognitionRef.current?.isSupported()) {
                  setSessionState(SessionState.LISTENING);
                  recognitionGotResultRef.current = false;
                  speechRecognitionRef.current.start(
                    (transcript) => {
                      recognitionGotResultRef.current = true;
                      setCurrentInput(transcript);
                      handleSendMessage(transcript, true);
                    },
                    async () => {
                      if (!recognitionGotResultRef.current) {
                        try {
                          if (!voiceRecorderRef.current) voiceRecorderRef.current = new VoiceRecorder();
                          await voiceRecorderRef.current.start();
                          setIsRecordingFallback(true);
                          setSessionState(SessionState.LISTENING);
                          return;
                        } catch (err) {
                          console.warn('Fallback recorder failed to start:', err);
                        }
                        setSessionState(SessionState.IDLE);
                        audioVisualizationRef.current?.cleanup();
                        if (micStreamRef.current) {
                          micStreamRef.current.getTracks().forEach((t) => t.stop());
                          micStreamRef.current = null;
                        }
                        inputAnalyserRef.current = null;
                      }
                    }
                  );
                } else {
                  if (!voiceRecorderRef.current) voiceRecorderRef.current = new VoiceRecorder();
                  await voiceRecorderRef.current.start();
                  setIsRecordingFallback(true);
                  setSessionState(SessionState.LISTENING);
                }
              } catch (err) {
                console.error('Local STT fallback failed:', err);
                setSessionState(SessionState.ERROR);
              }
            },
            onclose: () => {
              // If we switched to local fallback (recording or recognition), do not force close
              if (isRecordingFallback || sessionStateRef.current === SessionState.LISTENING) {
                return;
              }
              // Graceful close -> cleanup
              handleStopSession();
            },
          },
        });

        return;
      }

      // If no API key, fallback to local speech recognition and recorder
      if (speechRecognitionRef.current?.isSupported()) {
        setSessionState(SessionState.LISTENING);
        recognitionGotResultRef.current = false;
        speechRecognitionRef.current.start(
          (transcript) => {
            recognitionGotResultRef.current = true;
            setCurrentInput(transcript);
            handleSendMessage(transcript, true);
          },
          async () => {
            // If we did not get any transcript, try fallback recording
            if (!recognitionGotResultRef.current) {
              try {
                if (!voiceRecorderRef.current) {
                  voiceRecorderRef.current = new VoiceRecorder();
                }
                await voiceRecorderRef.current.start();
                setIsRecordingFallback(true);
                setSessionState(SessionState.LISTENING);
                return;
              } catch (e) {
                console.warn('Fallback recorder failed to start:', e);
              }
              // No recorder either -> reset to idle and cleanup
              setSessionState(SessionState.IDLE);
              audioVisualizationRef.current?.cleanup();
              if (micStreamRef.current) {
                micStreamRef.current.getTracks().forEach((t) => t.stop());
                micStreamRef.current = null;
              }
              inputAnalyserRef.current = null;
              return;
            }
            // We already delivered a transcript. Keep session flow (PROCESSING/SPEAKING)
            // and do not force IDLE or clean up here.
          }
        );
        return;
      }

      // Fallback: MediaRecorder
      if (!voiceRecorderRef.current) {
        voiceRecorderRef.current = new VoiceRecorder();
      }
      await voiceRecorderRef.current.start();
      setIsRecordingFallback(true);
      setSessionState(SessionState.LISTENING);
    } catch (error) {
      console.error('Error starting voice session:', error);
      setSessionState(SessionState.ERROR);
    }
  };

  const handleSendMessage = async (text: string, speakResponse: boolean = false) => {
    if (!activeSession || !user || !text.trim()) return;

    try {
      // Add user message
      const userEntry: TranscriptEntry = {
        id: crypto.randomUUID(),
        speaker: Speaker.USER,
        text: text.trim(),
      };

      lastTranscriptEntryIdRef.current = userEntry.id;
      await addTranscriptEntryAuto(activeSession.id, userEntry);
      
      setActiveSession(prev => prev ? {
        ...prev,
        transcript: [...(prev.transcript || []), userEntry],
      } : null);

      // Generate AI response
      setSessionState(SessionState.PROCESSING);
      setCurrentOutput('');

      if (genAIRef.current) {
        // Build comprehensive system instruction with memory, goals, and mood
        const systemInstruction = getSystemInstruction(userProfile.language || 'de-DE', userProfile);
        
        // Build conversation history
        const conversationHistory = (activeSession.transcript || [])
          .slice(-10) // Last 10 messages for context
          .map(entry => ({
            role: entry.speaker === Speaker.USER ? 'user' as const : 'model' as const,
            parts: [{ text: entry.text }]
          }));

        // Use the new SDK format for text generation with full context
        const response = await genAIRef.current.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: systemInstruction }]
            },
            ...conversationHistory,
            {
              role: 'user',
              parts: [{ text: text }]
            }
          ],
          config: {
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingBudget: 0 } // Turn off thinking for faster responses
          }
        });
        
        const responseText = response.text.trim();

        // Add AI response
        const auraEntry: TranscriptEntry = {
          id: crypto.randomUUID(),
          speaker: Speaker.AURA,
          text: responseText,
        };

        await addTranscriptEntryAuto(activeSession.id, auraEntry);
        
        setActiveSession(prev => prev ? {
          ...prev,
          transcript: [...(prev.transcript || []), auraEntry],
        } : null);

        // Speak the response if requested and TTS is supported
        if (speakResponse && ttsServiceRef.current?.isSupported()) {
          setSessionState(SessionState.SPEAKING);
          try {
            await ttsServiceRef.current.speak(responseText, userProfile.language);
          } catch (error) {
            console.error('TTS error:', error);
          }
          setSessionState(SessionState.IDLE);
        } else {
          setSessionState(SessionState.IDLE);
        }

        // Update session summary asynchronously (best-effort)
        if (activeSession) {
          generateAndStoreSummary(activeSession, userProfile.language);
        }
      } else {
        // Fallback response when Gemini is not configured
        const auraEntry: TranscriptEntry = {
          id: crypto.randomUUID(),
          speaker: Speaker.AURA,
          text: 'Ich verstehe. Erzähle mir mehr darüber. (Hinweis: API-Schlüssel fehlt für vollständige AI-Antworten)',
        };

        await addTranscriptEntryAuto(activeSession.id, auraEntry);
        
        setActiveSession(prev => prev ? {
          ...prev,
          transcript: [...(prev.transcript || []), auraEntry],
        } : null);

        setSessionState(SessionState.IDLE);
        // No API -> skip AI summary
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSessionState(SessionState.ERROR);
    }
  };

  // Loading state
  if (authLoading || isLoadingProfile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#E6E6FA_0%,#ADD8E6_50%,#FFB6C1_100%)] dark:bg-[#161022]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6c2bee] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Lädt...</p>
        </div>
      </div>
    );
  }

  // Show welcome/auth if not logged in
  if (!user) {
    if (!showAuth) {
      return (
        <ErrorBoundary>
          <WelcomeScreen
            onGetStarted={() => {
              setInitialAuthMode('signup');
              setShowAuth(true);
            }}
            onSignIn={() => {
              setInitialAuthMode('login');
              setShowAuth(true);
            }}
          />
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <AuthScreen
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onSignInWithGoogle={handleSignInWithGoogle}
          loading={authLoading}
          error={authError}
          T={T}
          initialMode={initialAuthMode}
        />
      </ErrorBoundary>
    );
  }

  // Show onboarding if not completed
  // IMPORTANT: Only show onboarding if user is logged in AND profile is loaded AND onboarding is not completed
  if (user && !isLoadingProfile && !userProfile.onboardingCompleted) {
    console.log('🔄 Showing onboarding because:', {
      hasUser: !!user,
      isLoadingProfile,
      onboardingCompleted: userProfile.onboardingCompleted,
      profileName: userProfile.name
    });
    return (
      <ErrorBoundary>
        <Onboarding
          defaultProfile={userProfile}
          onComplete={handleOnboardingComplete}
          onPreviewVoice={handlePreviewVoice}
          translations={translations}
        />
      </ErrorBoundary>
    );
  }

  // Main app
  return (
    <ErrorBoundary>
      <AppFrame>
        {/* Sidebar */}
        <div
          className={`absolute inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {T.ui.sidebar.sessions}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-[#6c2bee] text-white px-4 py-2 rounded-lg hover:bg-[#5a22d6] transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              {T.ui.sidebar.newChat}
            </button>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                <p className="text-sm">{T.ui.sidebar.noSessions}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      activeSession?.id === session.id
                        ? 'bg-[#6c2bee]/10 border-[#6c2bee]/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {editingSessionId === session.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                          onBlur={handleSaveTitle}
                          className="flex-1 bg-transparent border-b border-[#6c2bee] outline-none text-sm"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => handleSelectSession(session.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditing(session);
                              }}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                              <PencilIcon className="w-3 h-3 text-slate-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                              <TrashIcon className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(session.startTime).toLocaleDateString(userProfile.language || 'de-DE')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User info and controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#6c2bee] rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                  {userProfile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {userProfile.subscription.plan === SubscriptionPlan.PREMIUM 
                    ? 'Premium' 
                    : 'Free'
                  }
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <UserIcon className="w-3 h-3" />
                {T.ui.sidebar.profile}
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                <LogoutIcon className="w-3 h-3" />
                {T.ui.sidebar.logout}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Modern Header */}
          <header className="glass border-b border-white/20 dark:border-white/5 p-5 shrink-0 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
                >
                  <MenuIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Aura
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Navigation buttons */}
                <div className="hidden md:flex items-center gap-1 glass rounded-xl p-1 border border-white/20 dark:border-white/5">
                  {[
                    { id: 'chat', label: 'Chat' },
                    { id: 'home', label: 'Home' },
                    { id: 'journal', label: 'Journal' },
                    { id: 'profile', label: 'Profile' },
                    { id: 'insights', label: 'Insights' }
                  ].map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setCurrentView(view.id as any)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                        currentView === view.id
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 shadow-sm font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>

                {/* Theme toggle */}
                <button
                  onClick={handleThemeToggle}
                  className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
                >
                  {isDarkMode ? (
                    <SunIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto min-h-0 pb-20">
            {currentView === 'chat' && (
              <ChatView
                userProfile={userProfile}
                activeSession={activeSession}
                sessionState={sessionState}
                currentInput={currentInput}
                currentOutput={currentOutput}
                activeDistortion={activeDistortion}
                setActiveDistortion={setActiveDistortion}
                inputAnalyserNode={inputAnalyserRef.current}
                outputAnalyserNode={outputAnalyserRef.current}
                T={T}
              />
            )}
            {currentView === 'home' && (
              <HomeView
                userProfile={userProfile}
                onNewChat={handleNewChat}
                onOpenGoals={() => setIsGoalsOpen(true)}
                onOpenMood={() => setIsMoodOpen(true)}
                onOpenJournal={() => setIsJournalOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                T={T}
              />
            )}
            {currentView === 'journal' && (
              <JournalView
                userProfile={userProfile}
                onOpenJournal={() => setIsJournalOpen(true)}
                T={T}
              />
            )}
        {/* Modals */}
        {isProfileOpen && (
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            profile={userProfile}
            onProfileChange={handleProfileChange}
            onPreviewVoice={handlePreviewVoiceFromProfile}
            voicePreviewState={voicePreviewState}
            onLogout={signOut}
            onOpenSubscriptionModal={() => setIsSubscriptionOpen(true)}
            T={T}
          />
        )}

        {isGoalsOpen && (
          <GoalsModal
            isOpen={isGoalsOpen}
            onClose={() => setIsGoalsOpen(false)}
            onSave={handleSaveGoal}
            onSuggestSmartGoal={handleSuggestSmartGoal}
            currentView={currentView}
            onNavigate={setCurrentView}
            T={T}
          />
        )}

        {isMoodOpen && (
          <MoodJournalModal
            isOpen={isMoodOpen}
            onClose={() => setIsMoodOpen(false)}
            onSave={handleSaveMood}
            currentView={currentView}
            onNavigate={setCurrentView}
            T={T}
          />
        )}

        {isJournalOpen && (
          <JournalModal
            isOpen={isJournalOpen}
            onClose={() => {
              setIsJournalOpen(false);
              setEditingJournalEntry(null);
            }}
            onSave={handleSaveJournal}
            onDelete={handleDeleteJournal}
            entry={editingJournalEntry}
            currentView={currentView}
            onNavigate={setCurrentView}
            T={T}
          />
        )}

        {isSubscriptionOpen && (
          <SubscriptionModal
            isOpen={isSubscriptionOpen}
            onClose={() => setIsSubscriptionOpen(false)}
            onUpgrade={handleUpgradeToPremium}
            subscription={userProfile.subscription}
            currentView={currentView}
            onNavigate={setCurrentView}
            T={T}
          />
        )}
            {currentView === 'profile' && (
              <ProfileView
                userProfile={userProfile}
                T={T}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenSubscription={() => setIsSubscriptionOpen(true)}
                onLogout={signOut}
              />
            )}
            {currentView === 'insights' && renderInsightsView()}
          </main>
        </div>

        {isExerciseVisible && (
          <BreathingExercise
            onFinish={() => setIsExerciseVisible(false)}
            translations={T.ui.breathingExercise}
          />
        )}

        {isCrisisModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangleIcon className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Krisenhilfe
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Wenn Sie sich in einer Krise befinden oder Gedanken an Selbstverletzung haben, 
                wenden Sie sich bitte sofort an professionelle Hilfe.
              </p>
              <div className="space-y-3">
                <a
                  href="tel:08001110111"
                  className="block w-full bg-red-500 text-white text-center py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Telefonseelsorge: 0800 111 0 111
                </a>
                <a
                  href="https://www.u25-koeln.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-slate-500 text-white text-center py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Online-Beratung besuchen
                </a>
                <button
                  onClick={() => setIsCrisisModalOpen(false)}
                  className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Bottom Navigation */}
        <BottomNavigation 
          currentView={currentView} 
          onNavigate={setCurrentView}
        />
      </AppFrame>
    </ErrorBoundary>
  );
}

export default App;
