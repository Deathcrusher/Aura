import React, { useEffect, useRef } from 'react';
import { SessionState, ChatSession, Speaker, CognitiveDistortion, UserProfile, ChatMode } from '../types';
import { AuraHumanAvatar, LightbulbIcon, UserIcon } from './Icons';

interface ChatViewProps {
    sessionState: SessionState;
    activeSession: ChatSession | null;
    currentInput: string;
    currentOutput: string;
    activeDistortion: CognitiveDistortion | null;
    setActiveDistortion: (distortion: CognitiveDistortion | null) => void;
    inputAnalyserNode: AnalyserNode | null;
    outputAnalyserNode: AnalyserNode | null;
    userProfile: UserProfile;
    T: any;
    onStartVoiceSession?: () => void;
    onStopSession?: () => void;
    onSendMessage?: (text: string) => void;
    onNewChat?: (mode: ChatMode) => void;
    textInput?: string;
    setTextInput?: (text: string) => void;
}

const DistortionInfoCard: React.FC<{ distortion: CognitiveDistortion, onClose: () => void, T: any }> = ({ distortion, onClose, T }) => {
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md p-5 glass rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-800/30 animate-scale-in backdrop-blur-xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <LightbulbIcon className="w-6 h-6 text-white"/>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{T.ui.chat.distortionDetected}</h4>
                    <div className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 mb-2">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">{distortion.type}</p>
                    </div>
                    <p className="text-sm italic text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">"{distortion.statement}"</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{T.ui.chat.distortionInfo(distortion.type)}</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all flex-shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

const UserAvatar: React.FC<{ profile: UserProfile, className?: string }> = ({ profile, className }) => {
    if (profile.avatarUrl) {
        return <img src={profile.avatarUrl} alt={profile.name} className={`rounded-full object-cover bg-slate-200 dark:bg-slate-700 ${className}`} />;
    }
    return (
        <div className={`rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ${className}`}>
            <UserIcon className="w-3/5 h-3/5 text-slate-400 dark:text-slate-500" />
        </div>
    );
};

export const ChatView: React.FC<ChatViewProps> = ({ 
    sessionState, 
    activeSession, 
    currentInput, 
    currentOutput, 
    activeDistortion, 
    setActiveDistortion, 
    inputAnalyserNode, 
    outputAnalyserNode, 
    userProfile, 
    T,
    onStartVoiceSession,
    onStopSession,
    onSendMessage,
    onNewChat,
    textInput = '',
    setTextInput
}) => {
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isIdle = sessionState === SessionState.IDLE;
    const isListening = sessionState === SessionState.LISTENING || sessionState === SessionState.USER_SPEAKING;
    const isProcessing = sessionState === SessionState.PROCESSING;
    const isSpeaking = sessionState === SessionState.SPEAKING;

    useEffect(() => {
        console.log('📱 ChatView rendered - activeSession:', activeSession ? {
            id: activeSession.id,
            mode: activeSession.mode,
            hasTranscript: !!activeSession.transcript,
            transcriptLength: activeSession.transcript?.length || 0
        } : 'null');
        console.log('📱 SessionState:', sessionState);
        console.log('📱 isIdle:', isIdle);
    }, [activeSession, sessionState, isIdle]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.transcript, currentInput, currentOutput]);

    const handleSend = () => {
        if (textInput.trim() && onSendMessage) {
            onSendMessage(textInput.trim());
            if (setTextInput) setTextInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!activeSession) {
        return (
            <div className="relative flex flex-1 w-full flex-col bg-gradient-to-b from-white/50 to-purple-50/30 dark:from-slate-900/50 dark:to-purple-950/20 overflow-hidden min-h-0 items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl mx-auto mb-4">
                        <span className="material-symbols-outlined text-white text-4xl">chat_bubble</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {T.ui.chat?.noSessionTitle || 'Keine aktive Sitzung'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {T.ui.chat?.noSessionSubtitle || 'Starte eine neue Konversation, um mit Aura zu sprechen'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        {onNewChat && (
                            <button
                                onClick={async () => {
                                    if (onNewChat) {
                                        await onNewChat(ChatMode.TEXT);
                                    }
                                }}
                                className="flex-1 flex items-center justify-center gap-3 rounded-2xl h-14 px-6 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold"
                            >
                                <span className="material-symbols-outlined">chat_bubble</span>
                                <span>{T.ui.chat?.startTextChat || 'Text-Chat starten'}</span>
                            </button>
                        )}
                        {onStartVoiceSession && (
                            <button
                                onClick={async () => {
                                    // First create voice session if needed, then start voice
                                    if (!activeSession && onNewChat) {
                                        await onNewChat(ChatMode.VOICE);
                                        // Small delay to ensure session is set
                                        await new Promise(resolve => setTimeout(resolve, 200));
                                    }
                                    if (onStartVoiceSession) {
                                        onStartVoiceSession();
                                    }
                                }}
                                className="flex-1 flex items-center justify-center gap-3 rounded-2xl h-14 px-6 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold"
                            >
                                <span className="material-symbols-outlined">mic</span>
                                <span>{T.ui.chat?.startSession || 'Sprach-Sitzung starten'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-1 w-full flex-col bg-gradient-to-b from-white/50 to-purple-50/30 dark:from-slate-900/50 dark:to-purple-950/20 overflow-hidden min-h-0">
            {/* Modern Top App Bar */}
            <div className="flex items-center glass p-5 justify-between border-b border-white/20 dark:border-white/5 shrink-0 backdrop-blur-xl">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <AuraHumanAvatar className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold">Aura</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Your AI companion</p>
                    </div>
                </div>
                <button className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">more_vert</span>
                </button>
            </div>

            {/* Modern Chat History */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {activeSession.summary && (
                    <div className="mb-4 p-4 rounded-2xl glass border border-yellow-200/50 dark:border-yellow-800/30 card-shadow animate-fade-in-up">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-white text-lg">lightbulb</span>
                            </div>
                            <div className="flex-1">
                                <strong className="block mb-1 text-sm font-semibold text-slate-900 dark:text-white">
                                    {T.ui.chat?.sessionSummaryTitle ?? 'Zusammenfassung'}
                                </strong>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{activeSession.summary}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {(activeSession.transcript || []).map((entry, idx) => {
                    const distortion = activeSession.cognitiveDistortions?.find(d => d.transcriptEntryId === entry.id);
                    const isDistortionActive = activeDistortion?.transcriptEntryId === entry.id;
                    const isUser = entry.speaker === Speaker.USER;
                    
                    return (
                        <div 
                            key={entry.id} 
                            className={`flex items-end gap-3 animate-fade-in-up ${isUser ? 'justify-end' : ''}`}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            {!isUser && (
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                                    <AuraHumanAvatar className="w-6 h-6" />
                                </div>
                            )}
                            <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                                <p className={`text-xs font-medium px-2 ${isUser ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isUser ? 'You' : 'Aura'}
                                </p>
                                <div className={`relative group rounded-2xl px-4 py-3 shadow-md transition-all duration-200 ${
                                    isUser 
                                        ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-br-md' 
                                        : 'glass border border-white/20 dark:border-white/5 text-slate-900 dark:text-white rounded-bl-md'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                                    {distortion && (
                                        <button
                                            onClick={() => setActiveDistortion(isDistortionActive ? null : distortion)}
                                            className={`absolute -bottom-2 -right-2 p-2 rounded-full backdrop-blur-md transition-all ${
                                                isDistortionActive 
                                                    ? 'bg-purple-200 dark:bg-purple-800 shadow-lg scale-110' 
                                                    : 'bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100'
                                            }`}
                                            title={T.ui.chat.distortionDetected}
                                        >
                                            <LightbulbIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {isUser && (
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-md flex-shrink-0">
                                    <UserAvatar profile={userProfile} className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {currentInput && (
                    <div className="flex items-end gap-3 justify-end animate-fade-in-up">
                        <div className="flex flex-col gap-1.5 items-end max-w-[75%]">
                            <p className="text-xs font-medium px-2 text-purple-600 dark:text-purple-400">You</p>
                            <div className="rounded-2xl rounded-br-md px-4 py-3 bg-gradient-to-br from-purple-500/30 to-violet-500/30 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50">
                                <p className="text-sm text-purple-700 dark:text-purple-300 italic">{currentInput}</p>
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-md flex-shrink-0">
                            <UserAvatar profile={userProfile} className="w-6 h-6" />
                        </div>
                    </div>
                )}
                
                {currentOutput && (
                    <div className="flex items-end gap-3 animate-fade-in-up">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                            <AuraHumanAvatar className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1.5 items-start max-w-[75%]">
                            <p className="text-xs font-medium px-2 text-slate-500 dark:text-slate-400">Aura</p>
                            <div className="rounded-2xl rounded-bl-md px-4 py-3 glass border border-white/20 dark:border-white/5 flex items-center gap-2">
                                <p className="text-sm text-slate-600 dark:text-slate-400">Aura is typing</p>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0s'}} />
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={transcriptEndRef} />
            </div>

            {/* Modern Input Area */}
            <div className="glass border-t border-white/20 dark:border-white/5 p-4 sm:p-5 shrink-0 backdrop-blur-xl">
                {isIdle && (
                    <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
                        {/* Text Input - Show for TEXT mode or if mode is undefined (backward compatibility) */}
                        {(activeSession?.mode === ChatMode.TEXT || !activeSession?.mode) && (
                            <div className="flex-1 flex items-center gap-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/10 px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
                                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">edit</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput?.(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={T.ui.chat?.inputPlaceholder || "Schreibe eine Nachricht..."}
                                    className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base"
                                    disabled={isProcessing}
                                />
                                {textInput.trim() && (
                                    <button
                                        onClick={handleSend}
                                        disabled={isProcessing}
                                        className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-lg">send</span>
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Voice Button - Show for VOICE mode or as additional option for TEXT mode */}
                        {onStartVoiceSession && (
                            <button
                                onClick={onStartVoiceSession}
                                className={`flex items-center justify-center gap-2 sm:gap-3 rounded-2xl h-12 sm:h-auto px-6 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95 font-semibold text-sm sm:text-base whitespace-nowrap ${
                                    activeSession?.mode === ChatMode.VOICE ? 'flex-1' : ''
                                }`}
                            >
                                <span className="material-symbols-outlined">mic</span>
                                <span className="hidden sm:inline">
                                    {activeSession?.mode === ChatMode.VOICE 
                                        ? (T.ui.chat?.startSession || 'Sprach-Sitzung starten')
                                        : (T.ui.chat?.startVoice || 'Sprache')
                                    }
                                </span>
                            </button>
                        )}
                    </div>
                )}

                {/* Active Session Controls */}
                {(isListening || isProcessing || isSpeaking) && (
                    <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 flex-1">
                            {isListening && (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {T.ui.chat?.listening || 'Höre zu...'}
                                    </span>
                                </>
                            )}
                            {isProcessing && (
                                <>
                                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {T.ui.chat?.processing || 'Verarbeite...'}
                                    </span>
                                </>
                            )}
                            {isSpeaking && (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {T.ui.chat?.speaking || 'Aura spricht...'}
                                    </span>
                                </>
                            )}
                        </div>
                        {onStopSession && (
                            <button
                                onClick={onStopSession}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all duration-200"
                            >
                                <span className="material-symbols-outlined text-lg">stop</span>
                                <span className="text-sm font-medium">{T.ui.chat?.stop || 'Stoppen'}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {activeDistortion && (
                <DistortionInfoCard
                    distortion={activeDistortion}
                    onClose={() => setActiveDistortion(null)}
                    T={T}
                />
            )}
        </div>
    );
};
