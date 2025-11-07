import React, { useEffect, useRef } from 'react';
import { SessionState, ChatSession, Speaker, CognitiveDistortion, UserProfile } from '../types';
import { AuraHumanAvatar, LightbulbIcon, UserIcon } from './Icons';

interface ChatViewProps {
    sessionState: SessionState;
    activeSession: ChatSession;
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
                    {/* Inline X icon */}
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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession.transcript, currentInput, currentOutput]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        const centerX = (canvas.width / dpr) / 2;
        const centerY = (canvas.height / dpr) / 2;

        let animationFrameId: number;
        let idlePhase = 0;

        const renderFrame = () => {
            animationFrameId = requestAnimationFrame(renderFrame);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const analyser = sessionState === SessionState.USER_SPEAKING
                ? inputAnalyserNode
                : sessionState === SessionState.SPEAKING
                    ? outputAnalyserNode
                    : null;
            
            const baseRadius = 64; // Corresponds to w-32 avatar

            if (analyser) {
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);

                const avg = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
                const normalizedAvg = avg / 128.0;

                const color = sessionState === SessionState.USER_SPEAKING ? 'rgba(34, 197, 94, ' : 'rgba(45, 212, 191, ';
                

                for (let i = 1; i <= 3; i++) {
                    const radius = baseRadius + (i * 12) + (normalizedAvg * 20);
                    const opacity = Math.max(0, 0.4 - (i * 0.12) - (1 - normalizedAvg) * 0.3);
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctx.strokeStyle = `${color}${opacity})`;
                    ctx.lineWidth = 1 + normalizedAvg * 1.5;
                    ctx.stroke();
                }
            } else if (sessionState === SessionState.LISTENING || sessionState === SessionState.IDLE) {
                idlePhase += 0.015;
                const breath = (Math.sin(idlePhase) + 1) / 2; // Varies between 0 and 1

                const color = 'rgba(59, 130, 246, '; // Blue for listening state
                const radius = baseRadius + 10 + breath * 8;
                const opacity = 0.1 + breath * 0.25;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = `${color}${opacity})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        };

        renderFrame();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [sessionState, inputAnalyserNode, outputAnalyserNode]);

    const getStatusRingClass = (speaker: 'aura' | 'user') => {
        if (speaker === 'aura') {
            switch(sessionState) {
                case SessionState.LISTENING:
                    return 'border-[#6c2bee]/50';
                case SessionState.SPEAKING:
                    return 'border-teal-400';
                case SessionState.PROCESSING:
                case SessionState.CONNECTING:
                     return 'border-purple-500 animate-spin';
                default:
                    return 'border-slate-300 dark:border-slate-600';
            }
        }
        if (speaker === 'user') {
            return sessionState === SessionState.USER_SPEAKING ? 'border-green-500' : 'border-slate-300 dark:border-slate-600';
        }
        return 'border-slate-300 dark:border-slate-600';
    }

    return (
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
            
            {/* Avatars Row */}
            <div className="flex justify-between items-center w-full max-w-3xl mx-auto px-2 sm:px-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                    <UserAvatar profile={userProfile} className="w-full h-full"/>
                    <div className={`absolute -inset-1 rounded-full border-2 transition-colors duration-500 ${getStatusRingClass('user')}`}></div>
                </div>
                 <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center">
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{width: '100%', height: '100%'}} />
                    <AuraHumanAvatar className="w-full h-full relative" />
                    <div className={`absolute -inset-1 rounded-full border-2 transition-colors duration-500 ${getStatusRingClass('aura')}`}></div>
                </div>
            </div>


            {/* Live Transcript Area */}
            <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-end mt-4 min-h-0">
                 {activeSession.summary && (
                    <div className="mb-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-900 dark:text-yellow-100">
                        <strong className="block mb-1">{T.ui.chat?.sessionSummaryTitle ?? 'Zusammenfassung'}</strong>
                        <p>{activeSession.summary}</p>
                    </div>
                 )}
                 <div className="px-3 sm:px-4 py-4 rounded-xl overflow-y-auto space-y-4">
                    {activeSession.transcript.map(entry => {
                         const distortion = activeSession.cognitiveDistortions?.find(d => d.transcriptEntryId === entry.id);
                         const isDistortionActive = activeDistortion?.transcriptEntryId === entry.id;
                         const isUser = entry.speaker === Speaker.USER;
                        return(
                            <div key={entry.id} className={`flex items-start gap-3 group animate-bubble-in ${isUser ? 'justify-end' : ''}`}>
                                {!isUser && <AuraHumanAvatar className="w-8 h-8 flex-shrink-0" />}
                                <div className={`relative max-w-md p-3 rounded-2xl ${isUser ? 'bg-violet-100 dark:bg-violet-900/60 rounded-br-none' : 'bg-white dark:bg-slate-800 rounded-bl-none'}`}>
                                    <p className={`text-sm ${isUser ? 'text-violet-900 dark:text-violet-100' : 'text-slate-800 dark:text-slate-200'}`}>{entry.text}</p>
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
                                {isUser && <UserAvatar profile={userProfile} className="w-8 h-8 flex-shrink-0" />}
                            </div>
                        )
                    })}
                    {currentInput && (
                        <div className="flex items-start gap-3 justify-end animate-bubble-in">
                            <div className="max-w-md p-3 rounded-2xl bg-violet-100/50 dark:bg-violet-900/30 rounded-br-none text-violet-900/70 dark:text-violet-100/70 italic">
                                <p className="text-sm">{currentInput}</p>
                            </div>
                            <UserAvatar profile={userProfile} className="w-8 h-8 flex-shrink-0" />
                        </div>
                    )}
                    {currentOutput && (
                         <div className="flex items-start gap-3 animate-bubble-in">
                            <AuraHumanAvatar className="w-8 h-8 flex-shrink-0" />
                            <div className="max-w-md p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 rounded-bl-none text-slate-800/70 dark:text-slate-200/70 italic flex items-center">
                                <p className="text-sm">{currentOutput}</p>
                                <span className="inline-block w-1 h-3.5 ml-1 bg-slate-500 animate-pulse self-center"></span>
                            </div>
                        </div>
                    )}
                    <div ref={transcriptEndRef} />
                </div>
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
