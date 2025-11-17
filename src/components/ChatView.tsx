import React, { useEffect, useRef, useState } from 'react';
import { SessionState, ChatSession, Speaker, CognitiveDistortion, UserProfile, ChatMode } from '../types';
import { AuraHumanAvatar, LightbulbIcon, UserIcon } from './Icons';
import { ChatMessageSkeleton, LoadingSpinner } from './ui/SkeletonLoader';
import { AIThinkingState, VoiceRecordingState } from './ui/LoadingStates';
import { useLoadingState } from '../hooks/useLoadingState';
import { useDeviceInfo } from '../hooks/useResponsive';
import { Container, ResponsiveCard } from './ui/ResponsiveLayout';

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
    onShowSummary?: () => void;
    hasSummary?: boolean;
    sessions?: ChatSession[];
    onSelectSession?: (sessionId: string) => void;
    onDeleteSession?: (sessionId: string) => void;
    onStartEditing?: (session: ChatSession) => void;
    editingSessionId?: string | null;
    editingTitle?: string;
    onEditingTitleChange?: (title: string) => void;
    onSaveTitle?: () => void;
    onCancelEditing?: () => void;
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
    setTextInput,
    onShowSummary,
    hasSummary = false,
    sessions = [],
    onSelectSession,
    onDeleteSession,
    onStartEditing,
    editingSessionId = null,
    editingTitle = '',
    onEditingTitleChange,
    onSaveTitle,
    onCancelEditing,
}) => {
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [showSessionsList, setShowSessionsList] = useState(false);
    const [deleteConfirmSessionId, setDeleteConfirmSessionId] = useState<string | null>(null);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    
    // Responsive device info
    const { isMobile, isTablet, isDesktop, isMobilePortrait, isMobileLandscape } = useDeviceInfo();
    
    const isIdle = sessionState === SessionState.IDLE;
    const isListening = sessionState === SessionState.LISTENING || sessionState === SessionState.USER_SPEAKING;
    const isProcessing = sessionState === SessionState.PROCESSING;
    const isSpeaking = sessionState === SessionState.SPEAKING;

    // Loading state hook for AI responses
    const aiLoading = useLoadingState({ minLoadingTime: 800 });

    // Simulate loading when processing AI response
    useEffect(() => {
        if (isProcessing) {
            aiLoading.startLoading('KI verarbeitet deine Nachricht...');
        } else {
            aiLoading.stopLoading();
        }
    }, [isProcessing, aiLoading]);

    // Wenn keine aktive Sitzung, zeige automatisch die Sitzungsliste
    useEffect(() => {
        if (!activeSession) {
            setShowSessionsList(true);
        } else {
            setShowSessionsList(false);
        }
    }, [activeSession]);

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
        // Auto-scroll to bottom when new messages arrive
        if (transcriptEndRef.current) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [activeSession?.transcript, currentInput, currentOutput, isProcessing]);

    useEffect(() => {
        if (!inputRef.current) return;
        const textarea = inputRef.current;
        textarea.style.height = 'auto';
        const nextHeight = Math.min(textarea.scrollHeight, 160);
        textarea.style.height = `${nextHeight}px`;
    }, [textInput]);

    const handleSend = () => {
        if (textInput.trim() && onSendMessage) {
            onSendMessage(textInput.trim());
            if (setTextInput) setTextInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Sitzungsliste anzeigen
    if (showSessionsList || !activeSession) {
        return (
            <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950 w-full min-h-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                        <AuraHumanAvatar className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-slate-900 dark:text-white font-bold leading-tight truncate">{T.ui.sidebar?.sessions || 'Gespräche'}</h2>
                    </div>
                    {onNewChat && (
                        <button
                            onClick={async () => {
                                if (onNewChat) {
                                    await onNewChat(ChatMode.TEXT);
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 transition-all text-sm font-semibold"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span className="hidden sm:inline">{T.ui.sidebar?.newChat || 'Neues Gespräch'}</span>
                        </button>
                    )}
                </div>

                {/* Sitzungsliste */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoadingSessions ? (
                        <Container>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    {T.ui.chat?.recentSessions || 'Letzte Gespräche'}
                                </h3>
                            </div>
                            {/* Responsive Session Skeletons */}
                            <div className={`grid gap-4 ${
                                isMobile ? 'grid-cols-1' : 
                                isTablet ? 'grid-cols-2' : 
                                'grid-cols-3'
                            }`}>
                                {Array.from({ length: isMobile ? 3 : isTablet ? 4 : 6 }, (_, i) => (
                                    <ResponsiveCard key={i} className="animate-fade-in">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 animate-pulse"></div>
                                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2 animate-pulse opacity-60"></div>
                                            </div>
                                            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0"></div>
                                        </div>
                                    </ResponsiveCard>
                                ))}
                            </div>
                        </Container>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl mb-4">
                                <span className="material-symbols-outlined text-white text-4xl">chat_bubble</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">{T.ui.sidebar?.noSessions || 'Noch keine Gespräche'}</p>
                            {onNewChat && (
                                <button
                                    onClick={async () => {
                                        if (onNewChat) {
                                            await onNewChat(ChatMode.TEXT);
                                        }
                                    }}
                                    className="flex items-center justify-center gap-3 rounded-2xl h-14 px-6 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold"
                                >
                                    <span className="material-symbols-outlined">chat_bubble</span>
                                    <span>{T.ui.chat?.startConversation || 'Konversation starten'}</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <Container>
                            <div className={`grid gap-4 ${
                                isMobile ? 'grid-cols-1' : 
                                isTablet ? 'grid-cols-2' : 
                                'grid-cols-3'
                            }`}>
                                {sessions.map((session) => (
                                    <ResponsiveCard
                                        key={session.id}
                                        className={`transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                            editingSessionId === session.id 
                                                ? 'ring-2 ring-purple-500' 
                                                : ''
                                        } ${
                                            activeSession?.id === session.id
                                                ? 'bg-purple-600/10 border-purple-600/30 dark:bg-purple-600/20 dark:border-purple-600/40'
                                                : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                                        }`}
                                        onClick={(e) => {
                                            // Nicht ausführen, wenn im Bearbeitungsmodus
                                            if (editingSessionId === session.id) {
                                                return;
                                            }
                                            // Prüfe nochmal, ob der Klick auf einen Button oder ein interaktives Element war
                                            const target = e.target as HTMLElement;
                                            const isInteractiveTarget = target.closest('button, [role="button"], input, textarea, select, [data-interactive="true"]');
                                            
                                            if (isInteractiveTarget) {
                                                // Event wurde auf einem interaktiven Element ausgelöst -> nicht Session wechseln
                                                e.stopPropagation();
                                                return;
                                            }
                                            if (onSelectSession) {
                                                console.log('📱 Selecting session:', session.id);
                                                onSelectSession(session.id);
                                                setShowSessionsList(false);
                                            } else {
                                                console.warn('⚠️ onSelectSession is not defined');
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            // Prüfe, ob der Klick auf einen Button oder ein interaktives Element war
                                            const target = e.target as HTMLElement;
                                            if (target.closest('button, [role="button"], input, textarea, select, [data-interactive="true"]') ||
                                                editingSessionId === session.id) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                    {editingSessionId === session.id ? (
                                        <div 
                                            className="flex items-center gap-2 w-full" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onMouseUp={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => onEditingTitleChange?.(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onSaveTitle?.();
                                                    } else if (e.key === 'Escape') {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onCancelEditing?.();
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                className="flex-1 bg-transparent border-b-2 border-purple-600 outline-none text-sm font-medium text-slate-900 dark:text-white px-2 py-1"
                                                autoFocus
                                            />
                                            <div 
                                                className="flex items-center gap-1" 
                                                data-interactive="true"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        console.log('💾 Save button clicked - calling onSaveTitle');
                                                        if (onSaveTitle) {
                                                            onSaveTitle();
                                                        }
                                                        return false;
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onMouseUp={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex-shrink-0 z-10 relative"
                                                    title="Speichern"
                                                >
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        console.log('❌ Cancel button clicked - calling onCancelEditing');
                                                        if (onCancelEditing) {
                                                            onCancelEditing();
                                                        }
                                                        return false;
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onMouseUp={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    className="p-1.5 rounded-lg bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors flex-shrink-0 z-10 relative"
                                                    title="Abbrechen"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base truncate flex-1">
                                                    {session.title}
                                                </h3>
                                                <div 
                                                    className="flex items-center gap-2 ml-2" 
                                                    data-interactive="true"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onMouseUp={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    {onStartEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                console.log('✏️ Edit button clicked for session:', session.id);
                                                                onStartEditing(session);
                                                                return false;
                                                            }}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            onMouseUp={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors z-10 relative"
                                                            title={T.ui.chat?.renameSession || 'Umbenennen'}
                                                        >
                                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-lg">edit</span>
                                                        </button>
                                                    )}
                                                    {onDeleteSession && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setDeleteConfirmSessionId(session.id);
                                                                return false;
                                                            }}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            onMouseUp={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors z-10 relative"
                                                            title={T.ui.chat?.deleteSession || 'Löschen'}
                                                        >
                                                            <span className="material-symbols-outlined text-red-500 text-lg">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(session.startTime).toLocaleDateString(userProfile.language || 'de-DE', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            {session.summary && (
                                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                                                    {session.summary}
                                                </p>
                                            )}
                                        </>
                                    )}
                                    </ResponsiveCard>
                                ))}
                            </div>
                        </Container>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmSessionId && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
                        onClick={() => setDeleteConfirmSessionId(null)}
                    >
                        <div 
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        {T.ui.chat?.deleteSession || 'Sitzung löschen'}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {T.ui.chat?.deleteSessionConfirm?.(sessions.find(s => s.id === deleteConfirmSessionId)?.title || '') || 
                                         `Möchten Sie die Sitzung "${sessions.find(s => s.id === deleteConfirmSessionId)?.title || ''}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirmSessionId(null)}
                                    className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-semibold"
                                >
                                    {T.ui.cancel || 'Abbrechen'}
                                </button>
                                <button
                                    onClick={() => {
                                        if (onDeleteSession && deleteConfirmSessionId) {
                                            onDeleteSession(deleteConfirmSessionId);
                                            setDeleteConfirmSessionId(null);
                                        }
                                    }}
                                    className="px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors font-semibold"
                                >
                                    {T.ui.chat?.deleteSession || 'Löschen'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

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
                    <div className="flex flex-col gap-3 w-full">
                        {onNewChat && (
                            <button
                                onClick={async () => {
                                    if (onNewChat) {
                                        await onNewChat(ChatMode.TEXT);
                                    }
                                }}
                                className="flex items-center justify-center gap-3 rounded-2xl h-14 px-6 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold"
                            >
                                <span className="material-symbols-outlined">chat_bubble</span>
                                <span>{T.ui.chat?.startConversation || 'Konversation starten'}</span>
                            </button>
                        )}
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                            {T.ui.chat?.conversationHint || 'Du kannst jederzeit zwischen Text und Sprache wechseln'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-1 flex-col bg-slate-50 dark:bg-slate-950 w-full min-h-0 overflow-hidden ${
            isDesktop ? 'max-w-6xl mx-auto' : ''
        }`}>
            {/* Header - fixed */}
            <div className={`flex flex-wrap items-center gap-3 p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 ${
                isDesktop ? 'px-8' : ''
            }`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                        onClick={() => setShowSessionsList(true)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold ${
                            isMobile ? 'text-sm' : 'text-sm'
                        }`}
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        <span className="hidden sm:inline">{T.ui.chat?.backToSessions || 'Zurück'}</span>
                    </button>
                    <div className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0 ${
                        isMobile ? 'w-10 h-10' : 'w-12 h-12'
                    }`}>
                        <AuraHumanAvatar className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />
                    </div>
                    <div className="min-w-0">
                        <h2 className={`text-slate-900 dark:text-white font-bold leading-tight truncate ${
                            isMobile ? 'text-lg' : 'text-xl'
                        }`}>Aura</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{T.ui.chat?.assistantSubtitle || 'Your AI companion'}</p>
                    </div>
                </div>
                {hasSummary && onShowSummary && (
                    <button
                        onClick={onShowSummary}
                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl bg-purple-600/10 text-purple-700 dark:text-purple-300 border border-purple-200/40 dark:border-purple-800/40 hover:bg-purple-600/20 transition-all font-semibold ${
                            isMobile ? 'text-sm' : 'text-sm'
                        }`}
                    >
                        <span className="material-symbols-outlined text-base">summarize</span>
                        <span className="hidden sm:inline">{T.ui.chat?.viewSummary || 'Zusammenfassung'}</span>
                    </button>
                )}
            </div>

            {/* Messages - scrollable */}
            <div className={`flex-1 overflow-y-auto flex flex-col gap-4 min-h-0 ${
                isDesktop ? 'px-8 py-6' : 'px-4 py-5'
            }`}>
                <div className="flex flex-col gap-4">
                    {activeSession.summary && (
                        <ResponsiveCard className="bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200/60 dark:border-yellow-800/40">
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
                        </ResponsiveCard>
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
                                    <div className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0 ${
                                        isMobile ? 'w-9 h-9' : 'w-10 h-10'
                                    }`}>
                                        <AuraHumanAvatar className={isMobile ? 'w-6 h-6' : 'w-7 h-7'} />
                                    </div>
                                )}
                                <div className={`flex flex-col gap-1.5 ${
                                    isMobile ? 'max-w-[85%]' : isTablet ? 'max-w-[75%]' : 'max-w-[70%]'
                                } ${isUser ? 'items-end' : 'items-start'}`}>
                                    <p className={`text-xs font-medium px-2 ${isUser ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {isUser ? 'You' : 'Aura'}
                                    </p>
                                    <ResponsiveCard className={`relative group transition-all duration-200 ${
                                        isUser 
                                            ? 'bg-purple-600 text-white rounded-br-md' 
                                            : 'bg-white dark:bg-slate-900/80 text-slate-900 dark:text-white rounded-bl-md border border-slate-200/70 dark:border-slate-700/60'
                                    }`}>
                                        <p className={`leading-relaxed whitespace-pre-wrap ${
                                            isMobile ? 'text-sm' : 'text-sm'
                                        }`}>{entry.text}</p>
                                        {distortion && (
                                            <button
                                                onClick={() => setActiveDistortion(isDistortionActive ? null : distortion)}
                                                className={`absolute -bottom-2 -right-2 p-2 rounded-full transition-all shadow ${
                                                    isDistortionActive 
                                                        ? 'bg-purple-200 dark:bg-purple-800 scale-110' 
                                                        : 'bg-white dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100'
                                                }`}
                                                title={T.ui.chat.distortionDetected}
                                            >
                                                <LightbulbIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </button>
                                        )}
                                    </ResponsiveCard>
                                </div>
                                {isUser && (
                                    <div className={`rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center shadow-md flex-shrink-0 ${
                                        isMobile ? 'w-9 h-9' : 'w-10 h-10'
                                    }`}>
                                        <UserAvatar profile={userProfile} className={isMobile ? 'w-6 h-6' : 'w-7 h-7'} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {currentInput && (
                        <div className="flex items-end gap-3 justify-end animate-fade-in-up">
                            <div className={`flex flex-col gap-1.5 items-end ${
                                isMobile ? 'max-w-[85%]' : 'max-w-[75%]'
                            }`}>
                                <p className="text-xs font-medium px-2 text-purple-600 dark:text-purple-400">You</p>
                                <ResponsiveCard className="rounded-br-md bg-purple-500/20 border-purple-200/50 dark:border-purple-800/50">
                                    <p className={`text-purple-700 dark:text-purple-300 italic ${
                                        isMobile ? 'text-sm' : 'text-sm'
                                    }`}>{currentInput}</p>
                                </ResponsiveCard>
                            </div>
                            <div className={`rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center shadow-md flex-shrink-0 ${
                                isMobile ? 'w-9 h-9' : 'w-10 h-10'
                            }`}>
                                <UserAvatar profile={userProfile} className={isMobile ? 'w-6 h-6' : 'w-7 h-7'} />
                            </div>
                        </div>
                    )}
                    
                    {currentOutput && (
                        <div className="flex items-end gap-3 animate-fade-in-up">
                            <div className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0 ${
                                isMobile ? 'w-9 h-9' : 'w-10 h-10'
                            }`}>
                                <AuraHumanAvatar className={isMobile ? 'w-6 h-6' : 'w-7 h-7'} />
                            </div>
                            <div className={`flex flex-col gap-1.5 items-start ${
                                isMobile ? 'max-w-[85%]' : 'max-w-[75%]'
                            }`}>
                                <p className="text-xs font-medium px-2 text-slate-500 dark:text-slate-400">Aura</p>
                                <ResponsiveCard className="rounded-bl-md bg-white dark:bg-slate-900/80 border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
                                    <LoadingSpinner size="sm" className="text-purple-500" />
                                    <p className={`text-slate-700 dark:text-slate-300 italic ${
                                        isMobile ? 'text-sm' : 'text-sm'
                                    }`}>{currentOutput}</p>
                                </ResponsiveCard>
                            </div>
                        </div>
                    )}
                    
                    {/* AI Thinking State */}
                    <AIThinkingState 
                        isVisible={aiLoading.isLoading && !currentOutput}
                        message={aiLoading.message}
                    />
                    
                    <div ref={transcriptEndRef} />
                </div>
            </div>

            {/* Voice Recording State Overlay */}
            <VoiceRecordingState 
                isActive={isListening}
                message={isListening ? (T.ui.chat?.listening || 'Höre zu...') : undefined}
            />

            {/* Input Area - fixed bottom */}
            <div className={`border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 ${
                isDesktop ? 'p-6 pb-24' : 'p-4 pb-24'
            }`}>
                {(isListening || isSpeaking) && (
                    <div className={`flex items-center justify-center gap-4 mb-3 ${
                        isDesktop ? 'max-w-4xl' : 'max-w-full'
                    } mx-auto`}>
                        <div className="flex items-center gap-3 flex-1">
                            {isListening && (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className={`font-medium text-slate-700 dark:text-slate-300 ${
                                        isMobile ? 'text-sm' : 'text-sm'
                                    }`}>
                                        {T.ui.chat?.listening || 'Höre zu...'}
                                    </span>
                                </>
                            )}
                            {isSpeaking && (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                                    <span className={`font-medium text-slate-700 dark:text-slate-300 ${
                                        isMobile ? 'text-sm' : 'text-sm'
                                    }`}>
                                        {T.ui.chat?.speaking || 'Aura spricht...'}
                                    </span>
                                </>
                            )}
                        </div>
                        {onStopSession && (
                            <button
                                onClick={onStopSession}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all duration-200 ${
                                    isMobile ? 'text-sm' : 'text-sm'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">stop</span>
                                <span className="font-medium">{T.ui.chat?.stop || 'Stoppen'}</span>
                            </button>
                        )}
                    </div>
                )}

                <div className={`${
                    isDesktop ? 'max-w-4xl' : 'max-w-full'
                } mx-auto`}>
                    <div className="flex items-end gap-2">
                        {/* Promenter Floating Mikrofon-Button mit Audio-Visualisierung */}
                        {onStartVoiceSession && (
                            <div className={`fixed z-40 ${
                                isMobile ? 'bottom-24 right-4' : 'bottom-24 right-6'
                            }`}>
                                <button
                                    onClick={isIdle ? onStartVoiceSession : onStopSession}
                                    className={`rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xl relative ${
                                        isMobile ? 'w-14 h-14' : 'w-16 h-16'
                                    } ${
                                        isIdle 
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30' 
                                            : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30 animate-pulse'
                                    }`}
                                    title={isIdle ? (T.ui.chat?.startVoice || 'Sprache starten') : (T.ui.chat?.stopVoice || 'Sprache stoppen')}
                                >
                                    {/* Audio-Visualisierung bei Aufnahme */}
                                    {!isIdle && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className={`absolute rounded-full border-2 border-red-400 animate-pulse-ring ${
                                                isMobile ? 'w-18 h-18' : 'w-20 h-20'
                                            }`}></div>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-4 bg-white rounded-full voice-wave"></div>
                                                <div className="w-1 h-4 bg-white rounded-full voice-wave voice-wave-delay-1"></div>
                                                <div className="w-1 h-4 bg-white rounded-full voice-wave voice-wave-delay-2"></div>
                                                <div className="w-1 h-4 bg-white rounded-full voice-wave voice-wave-delay-3"></div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <span className={`material-symbols-outlined relative z-10 ${
                                        isMobile ? 'text-xl' : 'text-2xl'
                                    }`}>
                                        {isIdle ? 'mic' : 'mic_off'}
                                    </span>
                                </button>
                                
                                {/* Status-Indikator */}
                                {!isIdle && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                                )}
                            </div>
                        )}
                        
                        {/* Textfeld mit integriertem Senden-Button */}
                        <div className={`flex-1 flex items-end gap-2 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-500/40 transition-all ${
                            isMobile ? 'py-2' : 'py-2.5'
                        }`}>
                            <textarea
                                ref={inputRef}
                                value={textInput}
                                onChange={(e) => setTextInput?.(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    isListening || isSpeaking 
                                        ? (T.ui.chat?.inputPlaceholderVoice || "Tippe eine Nachricht oder sprich weiter...")
                                        : (T.ui.chat?.inputPlaceholder || "Schreibe eine Nachricht...")
                                }
                                rows={1}
                                className={`flex-1 bg-transparent border-none outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed py-1.5 ${
                                    isMobile ? 'text-sm' : 'text-sm sm:text-base'
                                }`}
                                disabled={isProcessing}
                            />
                            {/* Senden-Button direkt im Textfeld */}
                            <button
                                onClick={handleSend}
                                disabled={!textInput.trim() || isProcessing || isListening || isSpeaking}
                                className={`flex-shrink-0 rounded-full flex items-center justify-center transition-all mb-0.5 ${
                                    isMobile ? 'w-7 h-7' : 'w-8 h-8'
                                } ${
                                    textInput.trim() && !isProcessing && !isListening && !isSpeaking
                                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/30'
                                        : 'bg-slate-300 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                }`}
                                title={T.ui.chat?.send || 'Senden'}
                            >
                                <span className={`material-symbols-outlined ${
                                    isMobile ? 'text-base' : 'text-lg'
                                }`}>send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default ChatView;
