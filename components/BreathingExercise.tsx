import React, { useState, useEffect } from 'react';

interface BreathingExerciseProps {
    onFinish: () => void;
    translations: {
        inhale: string;
        hold: string;
        exhale: string;
        holdEmpty: string;
        finishButton: string;
    };
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onFinish, translations }) => {
    const breathingCycle = [
        { instruction: translations.inhale, duration: 4 },
        { instruction: translations.hold, duration: 4 },
        { instruction: translations.exhale, duration: 4 },
        { instruction: translations.holdEmpty, duration: 4 },
    ];

    const [cycleIndex, setCycleIndex] = useState(0);
    const [countdown, setCountdown] = useState(breathingCycle[0].duration);

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev > 1) {
                    return prev - 1;
                }
                const nextIndex = (cycleIndex + 1) % breathingCycle.length;
                setCycleIndex(nextIndex);
                return breathingCycle[nextIndex].duration;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [cycleIndex, breathingCycle]);

    const { instruction } = breathingCycle[cycleIndex];
    const isHolding = instruction === translations.hold || instruction === translations.holdEmpty;
    const isExhaling = instruction === translations.exhale;

    let scale = isHolding ? (isExhaling ? 0.5 : 1.5) : (isExhaling ? 0.5 : 1.5);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
            <div className="text-center">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                    <div
                        className="absolute w-full h-full bg-blue-500 rounded-full transition-transform duration-[4000ms] ease-in-out"
                        style={{ transform: `scale(${scale})` }}
                    ></div>
                    <span className="relative text-7xl font-bold text-white mix-blend-overlay">{countdown}</span>
                </div>
                <p className="mt-8 text-2xl text-white font-medium">{instruction}</p>
            </div>
            <button
                onClick={onFinish}
                className="absolute bottom-10 px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
            >
                {translations.finishButton}
            </button>
        </div>
    );
};
