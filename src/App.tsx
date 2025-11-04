import { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Onboarding } from './components/Onboarding';
import { ChatView } from './components/ChatView';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  UserProfile,
  ChatSession,
  SessionState,
  Speaker,
  TranscriptEntry,
  CognitiveDistortion,
  SubscriptionPlan,
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
} from './components/Icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

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

  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);

  const T = translations[userProfile.language as keyof typeof translations] || translations['de-DE'];

  // Initialize Gemini AI
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
      genAIRef.current = new GoogleGenerativeAI(apiKey);
    }
  }, []);

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
          // Create default profile for new user
          await updateUserProfile(user.id, DEFAULT_PROFILE);
          setUserProfile(DEFAULT_PROFILE);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
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
      await updateUserProfile(user.id, updatedProfile);
      setUserProfile(updatedProfile);
      
      // Create first session
      await handleNewChat();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handlePreviewVoice = async (voiceId: string, language: string) => {
    console.log('Preview voice:', voiceId, language);
    // Voice preview will be implemented with Gemini TTS later
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

  const handleStopSession = () => {
    setSessionState(SessionState.IDLE);
  };

  const handleSendMessage = async (text: string) => {
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
        const model = genAIRef.current.getGenerativeModel({ model: 'gemini-pro' });
        
        // Get user's memory for context
        const memory = await getAuraMemory(user.id);
        
        const context = `Du bist Aura, eine einfühlsame KI-Therapeutin. 
        Nutzer: ${userProfile.name}
        Erinnerungen: ${JSON.stringify(memory)}
        
        Antworte empathisch und therapeutisch auf die Nachricht des Nutzers.`;

        const chat = model.startChat({
          history: activeSession.transcript.slice(-10).map(entry => ({
            role: entry.speaker === Speaker.USER ? 'user' : 'model',
            parts: [{ text: entry.text }],
          })),
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
      } else {
        // Fallback response when Gemini is not configured
        const auraEntry: TranscriptEntry = {
          id: crypto.randomUUID(),
          speaker: Speaker.AURA,
          text: 'Ich verstehe. Erzähle mir mehr darüber. (Hinweis: Gemini API-Schlüssel fehlt für vollständige AI-Antworten)',
        };

        await addTranscriptEntryAuto(activeSession.id, auraEntry);
        
        setActiveSession(prev => prev ? {
          ...prev,
          transcript: [...prev.transcript, auraEntry],
        } : null);
      }

      setSessionState(SessionState.IDLE);
    } catch (error) {
      console.error('Error sending message:', error);
      setSessionState(SessionState.ERROR);
    }
  };

  // Loading state
  if (authLoading || isLoadingProfile) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Lädt...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <ErrorBoundary>
        <AuthScreen
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          loading={authLoading}
          error={authError}
          T={T}
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
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
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
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <GoalsIcon className="w-5 h-5" />
                  <span>{T.ui.sidebar.goals}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <HeartIcon className="w-5 h-5" />
                  <span>{T.ui.sidebar.mood}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <JournalIcon className="w-5 h-5" />
                  <span>{T.ui.sidebar.journal}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
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

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <MenuIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {activeSession?.title || 'Aura'}
            </h1>
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Neues Gespräch starten
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          {activeSession && (
            <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="max-w-3xl mx-auto">
                {sessionState === SessionState.IDLE ? (
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && currentInput.trim()) {
                          handleSendMessage(currentInput);
                          setCurrentInput('');
                        }
                      }}
                      placeholder="Schreibe eine Nachricht..."
                      className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (currentInput.trim()) {
                          handleSendMessage(currentInput);
                          setCurrentInput('');
                        }
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                      disabled={!currentInput.trim()}
                    >
                      Senden
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
      </div>
    </ErrorBoundary>
  );
}

export default App;