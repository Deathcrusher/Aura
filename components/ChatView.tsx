import React, { useEffect, useRef } from 'react';
import { SessionState, ChatSession, Speaker, CognitiveDistortion } from '../types';
import { AuraHumanAvatar, LightbulbIcon } from './Icons';

interface ChatViewProps {
    sessionState: SessionState;
    activeSession: ChatSession;
    currentInput: string;
    currentOutput: string;
    activeDistortion: CognitiveDistortion | null;
    setActiveDistortion: (distortion: CognitiveDistortion | null) => void;
    inputAnalyserNode: AnalyserNode | null;
    outputAnalyserNode: AnalyserNode | null;
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


export const ChatView: React.FC<ChatViewProps> = ({ sessionState, activeSession, currentInput, currentOutput, activeDistortion, setActiveDistortion, inputAnalyserNode, outputAnalyserNode, T }) => {
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

            if (analyser) {
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);

                const avg = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
                const normalizedAvg = avg / 128.0;

                const color = sessionState === SessionState.USER_SPEAKING ? 'rgba(34, 197, 94, ' : 'rgba(45, 212, 191, ';
                const baseRadius = 96; // Corresponds to w-48 avatar

                for (let i = 1; i <= 3; i++) {
                    const radius = baseRadius + (i * 15) + (normalizedAvg * 25);
                    const opacity = Math.max(0, 0.5 - (i * 0.15) - (1 - normalizedAvg) * 0.3);
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
                const radius = 96 + 10 + breath * 10;
                const opacity = 0.1 + breath * 0.3;
                
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

    const getStatusRingClass = () => {
        switch(sessionState) {
            case SessionState.LISTENING:
                return 'border-blue-500'; // Static, visualizer handles pulse
            case SessionState.USER_SPEAKING:
                return 'border-green-500';
            case SessionState.PROCESSING:
                 return 'border-purple-500 animate-spin';
            case SessionState.SPEAKING:
                return 'border-teal-400';
            case SessionState.CONNECTING:
                return 'border-slate-400 animate-pulse';
            default:
                return 'border-slate-300 dark:border-slate-600';
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative">
            
            {/* Central Aura Avatar and Status */}
            <div className="relative w-48 h-48 flex items-center justify-center">
                 <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{width: '100%', height: '100%'}} />
                 <div className={`absolute -inset-1 rounded-full border-4 transition-colors duration-500 ${getStatusRingClass()}`}></div>
                 <AuraHumanAvatar className="w-full h-full relative" />
            </div>

            {/* Live Transcript Area */}
            <div className="w-full max-w-3xl h-1/3 flex flex-col justify-end mt-8">
                 <div className="p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm rounded-xl overflow-y-auto border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                        {activeSession.transcript.map(entry => {
                             const distortion = activeSession.cognitiveDistortions?.find(d => d.transcriptEntryId === entry.id);
                             const isDistortionActive = activeDistortion?.transcriptEntryId === entry.id;
                            return(
                                <div key={entry.id} className="flex group">
                                    <span className={`font-semibold w-16 flex-shrink-0 ${entry.speaker === Speaker.USER ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {entry.speaker === Speaker.USER ? 'Du:' : 'Aura:'}
                                    </span>
                                    <p className="flex-1">{entry.text}</p>
                                    {distortion && (
                                        <button 
                                            onClick={() => setActiveDistortion(isDistortionActive ? null : distortion)}
                                            className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full ${isDistortionActive ? 'bg-purple-200 dark:bg-purple-800' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                            title={T.ui.chat.distortionDetected}
                                        >
                                            <LightbulbIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                        {currentInput && (
                            <div className="flex group">
                                <span className="font-semibold w-16 flex-shrink-0 text-blue-600 dark:text-blue-400">Du:</span>
                                <p className="flex-1 text-slate-500 dark:text-slate-400">{currentInput}</p>
                            </div>
                        )}
                        {currentOutput && (
                            <div className="flex group">
                                <span className="font-semibold w-16 flex-shrink-0 text-slate-800 dark:text-slate-200">Aura:</span>
                                <p className="flex-1 text-slate-500 dark:text-slate-400">{currentOutput}</p>
                                <span className="inline-block w-1 h-3.5 ml-1 bg-slate-500 animate-pulse self-center"></span>
                            </div>
                        )}
                        <div ref={transcriptEndRef} />
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
        </div>
    );
};