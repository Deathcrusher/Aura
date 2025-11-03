import React, { useState, useEffect } from 'react';
import { UserProfile, AVAILABLE_LANGUAGES, AVAILABLE_VOICES } from '../types';
import { PlayIcon, AuraHumanAvatar, ChatBubbleIcon, ChartBarIcon, GoalsIcon, HeartIcon } from './Icons';

interface OnboardingProps {
    defaultProfile: UserProfile;
    onComplete: (profile: UserProfile) => void;
    onPreviewVoice: (voiceId: string, language: string) => void;
    translations: any;
}

const TOTAL_STEPS = 4;

export const Onboarding: React.FC<OnboardingProps> = ({ defaultProfile, onComplete, onPreviewVoice, translations }) => {
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const T = translations[profile.language as keyof typeof translations] || translations['de-DE'];

    const changeStep = (newStep: number) => {
        setIsFadingOut(true);
        setTimeout(() => {
            setStep(newStep);
            setIsFadingOut(false);
        }, 300); // Match animation duration
    };

    const nextStep = () => {
        if (step < TOTAL_STEPS - 1) {
            changeStep(step + 1);
        } else {
            onComplete(profile);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            changeStep(step - 1);
        }
    };

    const renderStepContent = () => {
        const contentClass = `transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`;
        
        switch (step) {
            case 0: // Welcome
                return (
                    <div className={contentClass}>
                        <AuraHumanAvatar className="w-24 h-24 mx-auto mb-6"/>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{T.ui.onboarding.welcomeTitle}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{T.ui.onboarding.welcomeSubtitle}</p>
                    </div>
                );
            case 1: // Name
                return (
                     <div className={contentClass}>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{T.ui.onboarding.nameTitle}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{T.ui.onboarding.nameSubtitle}</p>
                        <input
                            type="text"
                            value={profile.name === 'User' ? '' : profile.name}
                            onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                            className="w-full max-w-xs mt-8 px-4 py-3 bg-white/80 dark:bg-slate-700/80 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={T.ui.onboarding.namePlaceholder}
                        />
                    </div>
                );
            case 2: // Language & Voice
                return (
                    <div className={contentClass}>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{T.ui.onboarding.languageVoiceTitle}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{T.ui.onboarding.languageVoiceSubtitle}</p>
                        <div className="mt-8 space-y-6 w-full max-w-sm mx-auto text-left">
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{T.ui.onboarding.languageLabel}</label>
                                <select id="language" value={profile.language} onChange={(e) => setProfile(p => ({ ...p, language: e.target.value }))} className="w-full px-3 py-2 bg-white/80 dark:bg-slate-700/80 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {AVAILABLE_LANGUAGES.map(lang => (<option key={lang.id} value={lang.id}>{lang.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{T.ui.onboarding.voiceLabel}</h3>
                                <div className="space-y-2">
                                    {AVAILABLE_VOICES.map(voice => {
                                        const genderMarker = T.ui.voiceGenderMarker[voice.gender];
                                        return (
                                            <div key={voice.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${profile.voice === voice.id ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400' : 'bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
                                                <label className="flex items-center cursor-pointer">
                                                    <input type="radio" name="voice" value={voice.id} checked={profile.voice === voice.id} onChange={() => setProfile(p => ({ ...p, voice: voice.id }))} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" />
                                                    <span className="ms-3 text-sm font-medium text-slate-800 dark:text-slate-200">{voice.name} {genderMarker}</span>
                                                </label>
                                                <button onClick={() => onPreviewVoice(voice.id, profile.language)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><PlayIcon className="w-4 h-4 text-slate-600 dark:text-slate-300"/></button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Features
             const features = [
                { icon: ChatBubbleIcon, title: T.ui.onboarding.featureChat, desc: T.ui.onboarding.featureChatDesc },
                { icon: ChartBarIcon, title: T.ui.onboarding.featureInsights, desc: T.ui.onboarding.featureInsightsDesc },
                { icon: GoalsIcon, title: T.ui.onboarding.featureGoals, desc: T.ui.onboarding.featureGoalsDesc },
                { icon: HeartIcon, title: T.ui.onboarding.featureMood, desc: T.ui.onboarding.featureMoodDesc },
            ];
             return (
                    <div className={contentClass}>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{T.ui.onboarding.featuresTitle}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-md mx-auto">{T.ui.onboarding.featuresSubtitle}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-xl mx-auto text-left">
                            {features.map(f => (
                                <div key={f.title} className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mt-1">
                                      <f.icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">{f.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-2xl text-center flex-1 flex flex-col justify-center overflow-y-auto pt-8">
                {renderStepContent()}
            </div>
            
            <div className="w-full max-w-xl pb-8 pt-4">
                <div className="flex items-center justify-center gap-2 mb-6">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div key={i} className={`w-1/4 h-1 rounded-full transition-colors ${step >= i ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <button 
                        onClick={prevStep} 
                        className={`px-6 py-2 rounded-lg font-semibold transition-opacity ${step === 0 ? 'opacity-0 cursor-default' : 'opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        disabled={step === 0}
                    >
                        {T.ui.onboarding.back}
                    </button>
                    <button 
                        onClick={nextStep} 
                        disabled={step === 1 && (!profile.name || profile.name === 'User')}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {step === TOTAL_STEPS - 1 ? T.ui.onboarding.finish : T.ui.onboarding.next}
                    </button>
                </div>
            </div>
        </div>
    );
};
