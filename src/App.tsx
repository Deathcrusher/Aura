import { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Onboarding } from './components/Onboarding';
import { ChatView } from './components/ChatView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WelcomeScreen } from './components/WelcomeScreen';
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
  updateChatSession,
  addGoal,
  addMoodEntry,
  addJournalEntry,
  deleteJournalEntry,
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
} from './components/Icons';
import { ProfileModal } from './components/ProfileModal';
import { GoalsModal } from './components/GoalsModal';
import { MoodJournalModal } from './components/MoodJournalModal';
import { JournalModal } from './components/JournalModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AppFrame } from './components/AppFrame';
import {
  SpeechRecognitionService,
  TextToSpeechService,
  AudioVisualization,
  VoiceRecorder,
} from './utils/voice';
import { encode, decode, decodeAudioData } from './utils/audio';
// For realtime audio input
import { createBlob } from './utils/audio';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Live streaming API
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { GoogleGenAI, Modality } from '@google/genai';

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
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
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
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);
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
  // Modals & UI states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
  const [voicePreviewState, setVoicePreviewState] = useState<{ id: string; status: 'loading' | 'playing' } | null>(null);
  // Auth entry state (welcome vs auth)
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'signup' | 'login'>('signup');

  const T = translations[userProfile.language as keyof typeof translations] || translations['de-DE'];

  // Keep a ref of sessionState for use in async handlers
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

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
      genAIRef.current = new GoogleGenerativeAI(apiKey);
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

  // Load user profile when authenticated
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        const profile = await getUserProfile(user.id);
        
        if (profile) {
          setUserProfile({
            ...DEFAULT_PROFILE,
            ...profile,
          });
        } else {
          // Create default profile for new user (best-effort)
          setUserProfile(DEFAULT_PROFILE);
          updateUserProfile(user.id, DEFAULT_PROFILE).catch((e) =>
            console.warn('Could not persist default profile yet:', e),
          );
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to default in UI to avoid onboarding loop
        setUserProfile(DEFAULT_PROFILE);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

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

  const handleOnboardingComplete = async (completedProfile: UserProfile) => {
    if (!user) return;

    const updatedProfile = {
      ...completedProfile,
      onboardingCompleted: true,
    };

    try {
      // Update UI immediately to let the user proceed
      setUserProfile(updatedProfile);
      // Persist in background (don't block UX)
      updateUserProfile(user.id, updatedProfile).catch((e) =>
        console.warn('Could not persist onboarding completion yet:', e),
      );
      
      // Create first session
      await handleNewChat();
    } catch (error) {
      console.error('Error completing onboarding:', error);
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

  const generateAndStoreSummary = async (sessionId: string, lang: string) => {
    try {
      if (!genAIRef.current || !activeSession) return;
      const model = genAIRef.current.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const lastTurns = activeSession.transcript.slice(-20)
        .map(e => `${e.speaker === Speaker.USER ? 'User' : 'Aura'}: ${e.text}`)
        .join('\n');

      const prompt = lang.startsWith('de')
        ? 'Erstelle eine kurze, verständliche Zusammenfassung der bisherigen Sitzung in 2-3 Sätzen. Keine Aufzählungen, nur Fließtext.'
        : 'Write a short, clear summary of the session so far in 2–3 sentences. No bullet points, just plain text.';

      const result = await model.generateContent([
        { text: prompt },
        { text: lastTurns || 'Noch keine Inhalte.' },
      ]);

      const summary = result.response.text().trim();
      if (summary) {
        setActiveSession(prev => (prev ? { ...prev, summary } : prev));
        await updateChatSession(sessionId, { summary });
      }
    } catch (error) {
      console.warn('Summary generation failed:', error);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;

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
      const id = await addJournalEntry(user.id, { ...entry, createdAt });
      setUserProfile(prev => ({
        ...prev,
        journal: [{ id, content: entry.content, createdAt }, ...(prev.journal || [])],
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

  const handleStopSession = async () => {
    try {
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
            const model = genAIRef.current.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = 'Transkribiere die folgende deutsche Sprachnachricht. Gib nur den reinen Text zurück.';
            const result = await model.generateContent([
              { text: prompt },
              { inlineData: { data: b64, mimeType: blob.type || 'audio/webm' } },
            ]);
            transcript = result.response.text().trim();
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
          if (activeSession) {
            generateAndStoreSummary(activeSession.id, userProfile.language);
          }
          return;
        }
        setSessionState(SessionState.IDLE);
        if (activeSession) {
          generateAndStoreSummary(activeSession.id, userProfile.language);
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
      if (activeSession) {
        generateAndStoreSummary(activeSession.id, userProfile.language);
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

        sessionPromiseRef.current = ai.live.connect({
          // Use the official live model id from the SDK docs
          // Use the same model id that worked in the previous project for maximum compatibility
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
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
                    await addTranscriptEntryAuto(activeSession.id, userEntry);
                    setActiveSession(prev => prev ? { ...prev, transcript: [...prev.transcript, userEntry] } : prev);
                  }
                  if (auraText) {
                    const auraEntry: TranscriptEntry = { id: crypto.randomUUID(), speaker: Speaker.AURA, text: auraText };
                    await addTranscriptEntryAuto(activeSession.id, auraEntry);
                    setActiveSession(prev => prev ? { ...prev, transcript: [...prev.transcript, auraEntry] } : prev);
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
          config: {
            responseModalities: [Modality.AUDIO],
            // Ensure voice output matches selected voice
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: userProfile.voice || 'Zephyr' } } },
            // Make Gemini behave like a therapist and speak in the user's language
            systemInstruction: `Du bist Aura, eine einfühlsame, strukturierte KI-Therapeutin. \nSprich immer in der Sprache des Nutzers (${userProfile.language || 'de-DE'}), halte Antworten kurz, validierend und lösungsorientiert.\nNutze bei Bedarf Rückfragen und fasse gelegentlich zusammen. Vermeide Floskeln und bleibe konkret.`,
            // Affective dialog flag removed for compatibility
            // Request input/output transcription so we can show text alongside audio
            inputAudioTranscription: {},
            outputAudioTranscription: {},
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

      await addTranscriptEntryAuto(activeSession.id, userEntry);
      
      setActiveSession(prev => prev ? {
        ...prev,
        transcript: [...prev.transcript, userEntry],
      } : null);

      // Generate AI response
      setSessionState(SessionState.PROCESSING);
      setCurrentOutput('');

      if (genAIRef.current) {
        const model = genAIRef.current.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Get user's memory for context
        const memory = await getAuraMemory(user.id);
        
        const context = `Du bist Aura, eine einfühlsame KI-Therapeutin. 
        Nutzer: ${userProfile.name}
        Erinnerungen: ${JSON.stringify(memory)}
        
        Antworte empathisch und therapeutisch auf die Nachricht des Nutzers.`;

        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: context }] },
            ...activeSession.transcript.slice(-10).map(entry => ({
              role: entry.speaker === Speaker.USER ? 'user' : 'model',
              parts: [{ text: entry.text }],
            }))
          ],
        });

        const result = await chat.sendMessage(text);
        const response = result.response.text();

        // Add AI response
        const auraEntry: TranscriptEntry = {
          id: crypto.randomUUID(),
          speaker: Speaker.AURA,
          text: response,
        };

        await addTranscriptEntryAuto(activeSession.id, auraEntry);
        
        setActiveSession(prev => prev ? {
          ...prev,
          transcript: [...prev.transcript, auraEntry],
        } : null);

        // Speak the response if requested and TTS is supported
        if (speakResponse && ttsServiceRef.current?.isSupported()) {
          setSessionState(SessionState.SPEAKING);
          try {
            await ttsServiceRef.current.speak(response, userProfile.language);
          } catch (error) {
            console.error('TTS error:', error);
          }
          setSessionState(SessionState.IDLE);
        } else {
          setSessionState(SessionState.IDLE);
        }

        // Update session summary asynchronously (best-effort)
        generateAndStoreSummary(activeSession.id, userProfile.language);
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
          transcript: [...prev.transcript, auraEntry],
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
          loading={authLoading}
          error={authError}
          T={T}
          initialMode={initialAuthMode}
        />
      </ErrorBoundary>
    );
  }

  // Show onboarding if not completed
  if (!userProfile.onboardingCompleted) {
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
          className={`absolute inset-y-0 left-0 z-30 w-64 bg-[#f6f6f8] dark:bg-[#1d162b] shadow-xl transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6c2bee] text-white rounded-lg hover:bg-[#5a22cc] transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>{T.ui.sidebar.newChat}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                {T.ui.sidebar.history}
              </h3>
              <div className="space-y-2">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelectSession(session.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
                        activeSession?.id === session.id
                          ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-900 dark:text-violet-100'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <p className="text-sm truncate">{session.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(session.startTime).toLocaleDateString('de-DE')}
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-600"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="space-y-2">
                <button onClick={() => setIsGoalsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <GoalsIcon className="w-5 h-5" />
                  <span>{T.ui.sidebar.goals}</span>
                </button>
                <button onClick={() => setIsMoodOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <HeartIcon className="w-5 h-5" />
                  <span>{T.ui.sidebar.mood}</span>
                </button>
                <button onClick={() => { setEditingJournalEntry(null); setIsJournalOpen(true); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <JournalIcon className="w-5 h-5" />
                  <span>{T.ui.sidebar.journal}</span>
                </button>
                <button onClick={() => setIsProfileOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <UserIcon className="w-5 h-5" />
                  <span>{T.ui.sidebar.profile}</span>
                </button>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                >
                  <LogoutIcon className="w-5 h-5" />
                  <span>{T.ui.sidebar.logout}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar backdrop inside frame */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top app bar (Stitch style) */}
          <div className="flex items-center p-4 pb-2 justify-between border-b border-white/10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-800 dark:text-white/80"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/assets/Aura_logo.png" alt="Aura" className="w-7 h-7 rounded" />
              <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Aura</h2>
            </div>
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-700 dark:text-white/80"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Chat view */}
          {activeSession ? (
            <ChatView
              sessionState={sessionState}
              activeSession={activeSession}
              currentInput={currentInput}
              currentOutput={currentOutput}
              activeDistortion={activeDistortion}
              setActiveDistortion={setActiveDistortion}
              inputAnalyserNode={inputAnalyserRef.current}
              outputAnalyserNode={outputAnalyserRef.current}
              userProfile={userProfile}
              T={T}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Kein aktives Gespräch
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3 bg-[#6c2bee] text-white rounded-lg hover:bg-[#5a22cc] transition-colors"
                >
                  Neues Gespräch starten
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          {activeSession && (
            <div className="bg-white/60 dark:bg-transparent border-t border-slate-200 dark:border-white/10 p-4">
              <div className="max-w-3xl mx-auto">
                {sessionState === SessionState.IDLE ? (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleStartVoiceSession}
                      className="w-full sm:w-auto px-6 py-4 bg-[#6c2bee] text-white rounded-lg hover:bg-[#5a22cc] transition-colors flex items-center justify-center gap-2 shadow-md"
                      title="Sprachaufnahme starten"
                    >
                      <MicrophoneIcon className="w-6 h-6" />
                      <span className="font-semibold">Sprechen</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {sessionState === SessionState.LISTENING && T.ui.controls.listening}
                      {sessionState === SessionState.PROCESSING && T.ui.controls.processing}
                      {sessionState === SessionState.SPEAKING && T.ui.controls.speaking}
                      {sessionState === SessionState.CONNECTING && T.ui.controls.connecting}
                    </p>
                    <button
                      onClick={handleStopSession}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <StopIcon className="w-5 h-5" />
                      <span>{T.ui.controls.stopSession}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AppFrame>
      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onProfileChange={handleProfileChange}
        onPreviewVoice={handlePreviewVoiceFromProfile}
        voicePreviewState={voicePreviewState}
        onLogout={() => { setIsProfileOpen(false); signOut(); }}
        onOpenSubscriptionModal={() => { setIsProfileOpen(false); setIsSubscriptionOpen(true); }}
        T={T}
      />
      <GoalsModal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
        onSave={handleSaveGoal}
        onSuggestSmartGoal={async (desc: string) => {
          try {
            if (!genAIRef.current) return desc;
            const prompt = T.ui.goalsModal?.smartGoalPrompt?.(desc) || `Formuliere aus folgendem Ziel ein konkretes SMART-Ziel: ${desc}`;
            const model = genAIRef.current.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const res = await model.generateContent([{ text: prompt }]);
            return res.response.text().trim() || desc;
          } catch { return desc; }
        }}
        T={T}
      />
      <MoodJournalModal
        isOpen={isMoodOpen}
        onClose={() => setIsMoodOpen(false)}
        onSave={handleSaveMood}
        T={T}
      />
      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onSave={handleSaveJournal}
        onDelete={handleDeleteJournal}
        entry={editingJournalEntry}
        T={T}
      />
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        onUpgrade={handleUpgradeToPremium}
        subscription={userProfile.subscription}
        T={T}
      />
    </ErrorBoundary>
  );
}

export default App;
