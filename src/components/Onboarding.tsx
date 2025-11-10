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

    // Update profile when defaultProfile changes (e.g., after login)
    useEffect(() => {
        if (defaultProfile.name && defaultProfile.name !== 'User') {
            setProfile(prev => ({ ...prev, name: defaultProfile.name }));
        }
    }, [defaultProfile.name]);

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
            console.log('🎯 Onboarding finished - calling onComplete with profile:', {
                name: profile.name,
                voice: profile.voice,
                language: profile.language,
                onboardingCompleted: profile.onboardingCompleted
            });
            onComplete(profile);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            changeStep(step - 1);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 0: // Welcome
                return (
                    <div>
                        <AuraHumanAvatar className="w-24 h-24 mx-auto mb-6"/>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white leading-tight tracking-tight">{T.ui.onboarding.welcomeTitle}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{T.ui.onboarding.welcomeSubtitle}</p>
                    </div>
                );
            case 1: // Name
                return (
                     <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white leading-tight tracking-tight">{T.ui.onboarding.nameTitle}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{T.ui.onboarding.nameSubtitle}</p>
                        <input
                            type="text"
                            value={profile.name === 'User' ? '' : profile.name}
                            onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                            className="w-full max-w-xs mt-8 px-4 py-3 bg-white/80 dark:bg-slate-700/80 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee] text-slate-900 dark:text-white"
                            placeholder={T.ui.onboarding.namePlaceholder}
                        />
                    </div>
                );
            case 2: // Language & Voice
                return (
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight tracking-tight">{T.ui.onboarding.languageVoiceTitle}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{T.ui.onboarding.languageVoiceSubtitle}</p>
                        <div className="mt-8 space-y-6 w-full max-w-sm mx-auto text-left">
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{T.ui.onboarding.languageLabel}</label>
                                <select 
                                    id="language" 
                                    value={profile.language} 
                                    onChange={(e) => setProfile(p => ({ ...p, language: e.target.value }))} 
                                    className="w-full px-3 py-2 bg-white/80 dark:bg-slate-700/80 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee] text-slate-900 dark:text-white"
                                >
                                    {AVAILABLE_LANGUAGES.map(lang => (<option key={lang.id} value={lang.id}>{lang.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{T.ui.onboarding.voiceLabel}</h3>
                                <div className="space-y-2">
                                    {AVAILABLE_VOICES.map(voice => {
                                        const genderMarker = T.ui.voiceGenderMarker[voice.gender];
                                        return (
                                            <div 
                                                key={voice.id} 
                                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                                    profile.voice === voice.id 
                                                        ? 'bg-violet-50 dark:bg-violet-900/40 border-violet-400' 
                                                        : 'bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                                                }`}
                                            >
                                                <label className="flex items-center cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="voice" 
                                                        value={voice.id} 
                                                        checked={profile.voice === voice.id} 
                                                        onChange={() => setProfile(p => ({ ...p, voice: voice.id }))} 
                                                        className="w-4 h-4 text-[#6c2bee] bg-gray-100 border-gray-300 focus:ring-[#6c2bee]" 
                                                    />
                                                    <span className="ms-3 text-sm font-medium text-slate-800 dark:text-slate-200">{voice.name} {genderMarker}</span>
                                                </label>
                                                <button 
                                                    onClick={() => onPreviewVoice(voice.id, profile.language)} 
                                                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                                                >
                                                    <PlayIcon className="w-4 h-4 text-slate-600 dark:text-slate-300"/>
                                                </button>
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
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight tracking-tight">{T.ui.onboarding.featuresTitle}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-md mx-auto">{T.ui.onboarding.featuresSubtitle}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-xl mx-auto text-left">
                            {features.map(f => (
                                <div key={f.title} className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg flex items-start gap-4">
                                    <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-full mt-1">
                                      <f.icon className="w-5 h-5 text-[#6c2bee] dark:text-violet-300" />
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#f6f6f8] dark:bg-[#161022] font-['Manrope']">
            {/* Decorative Shapes */}
            <div 
                className="absolute rounded-full bg-[#6c2bee]/20 blur-3xl transition-all duration-700 ease-in-out pointer-events-none"
                style={{
                    width: '12rem',
                    height: '12rem',
                    top: step === 0 ? '-5%' : step === 1 ? '35%' : step === 2 ? '25%' : '65%',
                    left: step % 2 === 0 ? '-10%' : '-15%',
                }}
            />
            <div 
                className="absolute rounded-full bg-[#6c2bee]/20 blur-3xl transition-all duration-700 ease-in-out pointer-events-none"
                style={{
                    width: '10rem',
                    height: '10rem',
                    bottom: step === 0 ? '20%' : step === 1 ? '5%' : step === 2 ? '15%' : '0%',
                    right: step % 2 === 0 ? '-10%' : '-15%',
                }}
            />
            
            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md h-full flex flex-col overflow-hidden">
                {/* Progress Indicators */}
                <div className="flex items-center justify-center gap-3 py-5 shrink-0">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                step >= i 
                                    ? 'bg-[#6c2bee]' 
                                    : 'bg-gray-300 dark:bg-white/20'
                            }`}
                        />
                    ))}
                </div>

                {/* Content - scrollable area */}
                <div className="flex-1 overflow-y-auto px-4 py-8 min-h-0">
                    <div className={`transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'} text-center`}>
                        {renderStepContent()}
                    </div>
                </div>
                
                {/* Buttons - fixed at bottom */}
                <div className="flex flex-col items-stretch gap-3 px-4 py-6 shrink-0 bg-[#f6f6f8] dark:bg-[#161022] border-t border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={nextStep} 
                        disabled={step === 1 && (!profile.name || profile.name === 'User')}
                        className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#6c2bee] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white shadow-lg shadow-[#6c2bee]/40 transition-all hover:bg-[#5a22cc] disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        <span className="truncate">{step === TOTAL_STEPS - 1 ? T.ui.onboarding.finish : T.ui.onboarding.next}</span>
                    </button>
                    
                    {step > 0 && (
                        <button 
                            onClick={prevStep}
                            className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent px-5 text-base font-bold leading-normal tracking-[0.015em] text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-white"
                        >
                            <span className="truncate">{T.ui.onboarding.back}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
