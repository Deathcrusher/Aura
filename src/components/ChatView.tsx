import React, { useEffect, useRef } from 'react';
import { SessionState, ChatSession, Speaker, CognitiveDistortion, UserProfile } from '../types';
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
}

const DistortionInfoCard: React.FC<{ distortion: CognitiveDistortion, onClose: () => void, T: any }> = ({ distortion, onClose, T }) => {
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="flex items-start">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full mr-3 mt-1">
                    <LightbulbIcon className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{T.ui.chat.distortionDetected}</h4>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase mb-1">{distortion.type}</p>
                    <p className="text-sm italic text-slate-600 dark:text-slate-400 mb-2">"{distortion.statement}"</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{T.ui.chat.distortionInfo(distortion.type)}</p>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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

export const ChatView: React.FC<ChatViewProps> = ({ sessionState, activeSession, currentInput, currentOutput, activeDistortion, setActiveDistortion, inputAnalyserNode, outputAnalyserNode, userProfile, T }) => {
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.transcript, currentInput, currentOutput]);

    if (!activeSession) {
        return (
            <div className="relative flex flex-1 w-full flex-col bg-[#f6f6f8] dark:bg-[#161022] overflow-hidden min-h-0 items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">No active session</p>
            </div>
        );
    }

    return (
        <div className="relative flex flex-1 w-full flex-col bg-[#f6f6f8] dark:bg-[#161022] overflow-hidden min-h-0">
            {/* Top App Bar */}
            <div className="flex items-center bg-[#f6f6f8] dark:bg-[#161022] p-4 pb-2 justify-between border-b border-white/10 shrink-0">
                <div className="flex size-12 shrink-0 items-center">
                    <AuraHumanAvatar className="w-9 h-9" />
                </div>
                <h2 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1">Aura</h2>
                <div className="flex w-12 items-center justify-end">
                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-black dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeSession.summary && (
                    <div className="mb-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-900 dark:text-yellow-100">
                        <strong className="block mb-1">{T.ui.chat?.sessionSummaryTitle ?? 'Zusammenfassung'}</strong>
                        <p>{activeSession.summary}</p>
                    </div>
                )}
                
                {(activeSession.transcript || []).map(entry => {
                    const distortion = activeSession.cognitiveDistortions?.find(d => d.transcriptEntryId === entry.id);
                    const isDistortionActive = activeDistortion?.transcriptEntryId === entry.id;
                    const isUser = entry.speaker === Speaker.USER;
                    
                    return (
                        <div key={entry.id} className={`flex items-end gap-3 ${isUser ? 'justify-end' : ''}`}>
                            {!isUser && <AuraHumanAvatar className="w-10 h-10 shrink-0" />}
                            <div className="flex flex-1 flex-col gap-1 items-start">
                                {!isUser && <p className="text-gray-500 dark:text-[#a69db9] text-[13px] font-normal leading-normal max-w-[360px]">Aura</p>}
                                {isUser && <p className="text-gray-500 dark:text-[#a69db9] text-[13px] font-normal leading-normal max-w-[360px] text-right ml-auto">You</p>}
                                <div className={`relative text-base font-normal leading-normal flex max-w-[360px] rounded-lg px-4 py-3 ${
                                    isUser 
                                        ? 'bg-[#6c2bee] text-white rounded-br-none ml-auto' 
                                        : 'bg-gray-200 dark:bg-[#2e2839] text-black dark:text-white rounded-bl-none'
                                }`}>
                                    <p>{entry.text}</p>
                                    {distortion && (
                                        <button
                                            onClick={() => setActiveDistortion(isDistortionActive ? null : distortion)}
                                            className={`absolute -bottom-3 -right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full backdrop-blur-sm ${isDistortionActive ? 'bg-purple-200 dark:bg-purple-800' : 'bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                            title={T.ui.chat.distortionDetected}
                                        >
                                            <LightbulbIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {isUser && <UserAvatar profile={userProfile} className="w-10 h-10 shrink-0" />}
                        </div>
                    );
                })}
                
                {currentInput && (
                    <div className="flex items-end gap-3 justify-end">
                        <div className="flex flex-1 flex-col gap-1 items-end">
                            <p className="text-gray-500 dark:text-[#a69db9] text-[13px] font-normal leading-normal max-w-[360px] text-right">You</p>
                            <p className="text-base font-normal leading-normal flex max-w-[360px] rounded-lg px-4 py-3 bg-[#6c2bee]/20 dark:bg-[#6c2bee]/30 text-[#6c2bee] dark:text-violet-200 rounded-br-none italic">
                                {currentInput}
                            </p>
                        </div>
                        <UserAvatar profile={userProfile} className="w-10 h-10 shrink-0" />
                    </div>
                )}
                
                {currentOutput && (
                    <div className="flex items-end gap-3">
                        <AuraHumanAvatar className="w-10 h-10 shrink-0" />
                        <div className="flex flex-1 flex-col gap-1 items-start">
                            <p className="text-gray-500 dark:text-[#a69db9] text-[13px] font-normal leading-normal max-w-[360px]">Aura</p>
                            <div className="text-base font-normal leading-normal flex max-w-[360px] rounded-lg px-4 py-3 bg-gray-200 dark:bg-[#2e2839] text-black dark:text-white rounded-bl-none items-center space-x-2">
                                <p>Aura is typing</p>
                                <div className="flex space-x-1">
                                    <div className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '-0.3s'}} />
                                    <div className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '-0.15s'}} />
                                    <div className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={transcriptEndRef} />
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
