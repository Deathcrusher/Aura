import React from 'react';
import { SparklesIcon } from './Icons';

interface PremiumLockOverlayProps {
    onUpgrade: () => void;
    T: any;
}

export const PremiumLockOverlay: React.FC<PremiumLockOverlayProps> = ({ onUpgrade, T }) => {
    return (
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 rounded-xl">
            <SparklesIcon className="w-12 h-12 text-yellow-500 mb-2"/>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{T.ui.subscription.premiumFeature}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{T.ui.subscription.unlockInsights}</p>
            <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-[#6c2bee] text-white font-semibold rounded-lg hover:bg-[#5a22cc] transition-colors flex items-center gap-2"
            >
                <SparklesIcon className="w-5 h-5"/>
                <span>{T.ui.subscription.upgradeNow}</span>
            </button>
        </div>
    );
};
