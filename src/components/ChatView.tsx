import React, { useEffect, useRef, useState } from 'react';
import { SessionState, ChatSession, Speaker, CognitiveDistortion, UserProfile, ChatMode } from '../types';
import { AuraHumanAvatar, LightbulbIcon, UserIcon } from './Icons';

// Helper function for relative time formatting
const getRelativeTime = (timestamp: number | undefined, language: string = 'de-DE'): string => {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const isDe = language.startsWith('de');
    
    if (seconds < 10) return isDe ? 'Gerade eben' : 'Just now';
    if (seconds < 60) return isDe ? 'vor wenigen Sekunden' : 'a few seconds ago';
    if (minutes === 1) return isDe ? 'vor 1 Minute' : '1 minute ago';
    if (minutes < 60) return isDe ? `vor ${minutes} Minuten` : `${minutes} minutes ago`;
    if (hours === 1) return isDe ? 'vor 1 Stunde' : '1 hour ago';
    if (hours < 24) return isDe ? `vor ${hours} Stunden` : `${hours} hours ago`;
    if (days === 1) return isDe ? 'Gestern' : 'Yesterday';
    if (days < 7) return isDe ? `vor ${days} Tagen` : `${days} days ago`;
    
    // For older messages, show the actual date
    return new Date(timestamp).toLocaleDateString(language, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

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
    const isIdle = sessionState === SessionState.IDLE;
    const isListening = sessionState === SessionState.LISTENING || sessionState === SessionState.USER_SPEAKING;
    const isProcessing = sessionState === SessionState.PROCESSING;
    const isSpeaking = sessionState === SessionState.SPEAKING;

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
                    {sessions.length === 0 ? (
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
                        <div className="space-y-2 max-w-4xl mx-auto">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        editingSessionId === session.id 
                                            ? 'cursor-default' 
                                            : 'cursor-pointer'
                                    } ${
                                        activeSession?.id === session.id
                                            ? 'bg-purple-600/10 border-purple-600/30 dark:bg-purple-600/20 dark:border-purple-600/40'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-purple-300 dark:hover:border-purple-700'
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
                                </div>
                            ))}
                        </div>
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
        <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950 w-full min-h-0 overflow-hidden">
            {/* Header - fixed */}
            <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                        onClick={() => setShowSessionsList(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-semibold"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        <span className="hidden sm:inline">{T.ui.chat?.backToSessions || 'Zurück'}</span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                        <AuraHumanAvatar className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-slate-900 dark:text-white font-bold leading-tight truncate">Aura</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{T.ui.chat?.assistantSubtitle || 'Your AI companion'}</p>
                    </div>
                </div>
                {hasSummary && onShowSummary && (
                    <button
                        onClick={onShowSummary}
                        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-purple-600/10 text-purple-700 dark:text-purple-300 border border-purple-200/40 dark:border-purple-800/40 hover:bg-purple-600/20 transition-all text-sm font-semibold"
                    >
                        <span className="material-symbols-outlined text-base">summarize</span>
                        <span>{T.ui.chat?.viewSummary || 'Zusammenfassung'}</span>
                    </button>
                )}
            </div>

            {/* Messages - scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 min-h-0">
                <div className="flex flex-col gap-5">
                    {activeSession.summary && (
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-yellow-200/60 dark:border-yellow-800/40 shadow-sm">
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
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0 ring-2 ring-white dark:ring-slate-900">
                                        <AuraHumanAvatar className="w-6 h-6" />
                                    </div>
                                )}
                                <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 px-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <p className={`text-xs font-semibold ${isUser ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {isUser ? 'You' : 'Aura'}
                                        </p>
                                        {entry.timestamp && (
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                {getRelativeTime(entry.timestamp, userProfile.language)}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`relative group rounded-2xl px-5 py-3.5 transition-all duration-300 hover:scale-[1.01] ${
                                        isUser 
                                            ? 'bg-gradient-to-br from-purple-600 via-purple-600 to-violet-600 text-white rounded-br-md shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 backdrop-blur-sm' 
                                            : 'bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-bl-md border border-slate-200/70 dark:border-slate-700/50 shadow-md shadow-slate-900/5 dark:shadow-slate-900/20 hover:shadow-lg hover:border-purple-300/50 dark:hover:border-purple-700/50 backdrop-blur-sm'
                                    }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                                        {distortion && (
                                            <button
                                                onClick={() => setActiveDistortion(isDistortionActive ? null : distortion)}
                                                className={`absolute -bottom-2 -right-2 p-2 rounded-full transition-all duration-200 shadow-lg ${
                                                    isDistortionActive 
                                                        ? 'bg-purple-200 dark:bg-purple-800 scale-110 shadow-purple-500/30' 
                                                        : 'bg-white dark:bg-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-slate-900/10'
                                                }`}
                                                title={T.ui.chat.distortionDetected}
                                            >
                                                <LightbulbIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {isUser && (
                                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-md flex-shrink-0 ring-2 ring-white dark:ring-slate-900">
                                        <UserAvatar profile={userProfile} className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {currentInput && (
                        <div className="flex items-end gap-3 justify-end animate-fade-in-up">
                            <div className="flex flex-col gap-2 items-end max-w-[75%]">
                                <p className="text-xs font-semibold px-2 text-purple-700 dark:text-purple-300">You</p>
                                <div className="rounded-2xl rounded-br-md px-5 py-3.5 bg-purple-100/60 dark:bg-purple-900/30 border-2 border-dashed border-purple-300/60 dark:border-purple-700/50 shadow-md backdrop-blur-sm">
                                    <p className="text-sm text-purple-800 dark:text-purple-200 italic">{currentInput}</p>
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-md flex-shrink-0 ring-2 ring-white dark:ring-slate-900">
                                <UserAvatar profile={userProfile} className="w-6 h-6" />
                            </div>
                        </div>
                    )}
                    
                    {currentOutput && (
                        <div className="flex items-end gap-3 animate-fade-in-up">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0 ring-2 ring-white dark:ring-slate-900">
                                <AuraHumanAvatar className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col gap-2 items-start max-w-[75%]">
                                <p className="text-xs font-semibold px-2 text-slate-600 dark:text-slate-400">Aura</p>
                                <div className="rounded-2xl rounded-bl-md px-5 py-3.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/50 shadow-md backdrop-blur-sm flex items-center gap-2">
                                    <p className="text-sm text-slate-700 dark:text-slate-200">{T.ui.chat?.typing || 'Aura schreibt...'}</p>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0s'}} />
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Aura schreibt Animation (wenn verarbeitet wird) */}
                    {isProcessing && !currentOutput && (
                        <div className="flex items-end gap-3 animate-fade-in-up">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0 ring-2 ring-white dark:ring-slate-900">
                                <AuraHumanAvatar className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col gap-2 items-start max-w-[75%]">
                                <p className="text-xs font-semibold px-2 text-slate-600 dark:text-slate-400">Aura</p>
                                <div className="rounded-2xl rounded-bl-md px-5 py-3.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/50 shadow-md backdrop-blur-sm flex items-center gap-2">
                                    <p className="text-sm text-slate-700 dark:text-slate-200">{T.ui.chat?.typing || 'Aura schreibt...'}</p>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0s'}} />
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={transcriptEndRef} />
                </div>
            </div>

            {/* Input Area - fixed bottom */}
            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pb-24 shrink-0">
                {(isListening || isSpeaking) && (
                    <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto mb-3">
                        <div className="flex items-center gap-3 flex-1">
                            {isListening && (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {T.ui.chat?.listening || 'Höre zu...'}
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

                <div className="max-w-4xl mx-auto">
                    <div className="flex items-end gap-2">
                        {/* Promenter Floating Mikrofon-Button mit Audio-Visualisierung */}
                        {onStartVoiceSession && (
                            <div className="fixed bottom-24 right-6 z-40">
                                <button
                                    onClick={isIdle ? onStartVoiceSession : onStopSession}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xl relative ${
                                        isIdle 
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30' 
                                            : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30 animate-pulse'
                                    }`}
                                    title={isIdle ? (T.ui.chat?.startVoice || 'Sprache starten') : (T.ui.chat?.stopVoice || 'Sprache stoppen')}
                                >
                                    {/* Audio-Visualisierung bei Aufnahme */}
                                    {!isIdle && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="absolute w-20 h-20 rounded-full border-2 border-red-400 animate-pulse-ring"></div>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-4 bg-white rounded-full voice-wave"></div>
                                                <div className="w-1 h-4 bg-white rounded-full voice-wave voice-wave-delay-1"></div>
                                                <div className="w-1 h-4 bg-white rounded-full voice-wave voice-wave-delay-2"></div>
                                                <div className="w-1 h-4 bg-white rounded-full voice-wave voice-wave-delay-3"></div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <span className="material-symbols-outlined text-2xl relative z-10">
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
                        <div className="flex-1 flex items-end gap-2 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-500/40 transition-all">
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
                                className="flex-1 bg-transparent border-none outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base leading-relaxed py-1.5"
                                disabled={isProcessing}
                            />
                            {/* Senden-Button direkt im Textfeld */}
                            <button
                                onClick={handleSend}
                                disabled={!textInput.trim() || isProcessing || isListening || isSpeaking}
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all mb-0.5 ${
                                    textInput.trim() && !isProcessing && !isListening && !isSpeaking
                                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/30'
                                        : 'bg-slate-300 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                }`}
                                title={T.ui.chat?.send || 'Senden'}
                            >
                                <span className="material-symbols-outlined text-lg">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {activeDistortion && (
                <DistortionInfoCard
                    distortion={activeDistortion}
                    onClose={() => setActiveDistortion(null)}
                    T={T}
                />
            )}

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
};
