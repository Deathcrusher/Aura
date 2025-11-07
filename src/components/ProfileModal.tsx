import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AVAILABLE_VOICES, AVAILABLE_LANGUAGES, SubscriptionPlan } from '../types';
import { XIcon, PlayIcon, UserIcon, CameraIcon, StopIcon, SpinnerIcon, LogOutIcon, SparklesIcon } from './Icons';

type VoicePreviewState = { id: string; status: 'loading' | 'playing' } | null;

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
    onProfileChange: (newProfile: UserProfile) => void;
    onPreviewVoice: (voiceId: string) => void;
    voicePreviewState: VoicePreviewState;
    onLogout: () => void;
    onOpenSubscriptionModal: () => void;
    T: any; // Translation object
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, onProfileChange, onPreviewVoice, voicePreviewState, onLogout, onOpenSubscriptionModal, T }) => {
    const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onProfileChange(localProfile);
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalProfile(p => ({ ...p, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleManageSubscription = () => {
        onClose(); // Close this modal first
        onOpenSubscriptionModal();
    };

    const isPremium = profile.subscription.plan === SubscriptionPlan.PREMIUM;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center bg-white dark:bg-slate-800 p-4 pb-2 justify-between sticky top-0 z-10 border-b border-white/10">
                  <button className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6c2bee]/20 text-[#6c2bee] dark:text-violet-300" onClick={onClose}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{T.ui.profileModal.title}</h1>
                  <div className="flex w-12 items-center justify-end">
                    <button onClick={onClose} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-slate-900 dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                      <svg className="w-6 h-6 text-slate-500 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            {localProfile.avatarUrl ? (
                                <img
                                    src={localProfile.avatarUrl}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover bg-slate-200 dark:bg-slate-600 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-[#6c2bee]"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                    <UserIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 p-2 bg-[#6c2bee] text-white rounded-full hover:bg-[#5a22cc] transition-colors shadow-md border-2 border-white dark:border-slate-800"
                                aria-label="Change profile picture"
                            >
                                <CameraIcon className="w-5 h-5"/>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                     <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{T.ui.subscription.currentPlan}</h3>
                        <p className={`font-bold text-lg ${isPremium ? 'text-yellow-500' : 'text-slate-800 dark:text-slate-200'}`}>
                           {isPremium ? 'Aura Premium' : 'Aura Free'}
                        </p>
                        <button onClick={handleManageSubscription} className="mt-2 text-sm font-semibold text-[#483d8b] dark:text-violet-300 hover:underline">
                            {isPremium ? T.ui.subscription.manage : T.ui.subscription.upgrade}
                        </button>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {T.ui.profileModal.nameLabel}
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={localProfile.name}
                            onChange={(e) => setLocalProfile(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee]"
                            placeholder={T.ui.profileModal.namePlaceholder}
                        />
                    </div>
                     <div>
                        <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {T.ui.profileModal.languageLabel}
                        </label>
                        <select
                            id="language"
                            value={localProfile.language}
                            onChange={(e) => setLocalProfile(p => ({ ...p, language: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee]"
                        >
                            {AVAILABLE_LANGUAGES.map(lang => (
                                <option key={lang.id} value={lang.id}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{T.ui.profileModal.voiceLabel}</h3>
                        <div className="space-y-2">
                            {AVAILABLE_VOICES.map(voice => {
                                const isSelected = localProfile.voice === voice.id;
                                const isPreviewingThis = voicePreviewState?.id === voice.id;
                                const status = isPreviewingThis ? voicePreviewState?.status : null;
                                const genderMarker = T.ui.voiceGenderMarker[voice.gender];

                                return (
                                <div key={voice.id} className={`p-3 rounded-lg border transition-colors ${isSelected ? 'bg-violet-50 dark:bg-violet-900/40 border-violet-400' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center cursor-pointer flex-1 mr-2">
                                            <input
                                                type="radio"
                                                name="voice"
                                                value={voice.id}
                                                checked={isSelected}
                                                onChange={() => setLocalProfile(p => ({ ...p, voice: voice.id }))}
                                                className="w-4 h-4 text-[#6c2bee] bg-gray-100 border-gray-300 focus:ring-[#6c2bee] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="ms-3 text-sm font-medium text-slate-800 dark:text-slate-200">{voice.name} {genderMarker}</span>
                                        </label>
                                        <button 
                                            onClick={() => onPreviewVoice(voice.id)} 
                                            disabled={!!voicePreviewState && !isPreviewingThis}
                                            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-7 h-7"
                                            aria-label={`Preview voice ${voice.name}`}
                                            >
                                            {status === 'loading' && <SpinnerIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                                            {status === 'playing' && <StopIcon className="w-4 h-4 text-slate-600 dark:text-slate-300"/>}
                                            {!isPreviewingThis && <PlayIcon className="w-4 h-4 text-slate-600 dark:text-slate-300"/>}
                                        </button>
                                    </div>
                                    {T.ui.voiceDescriptions?.[voice.id] && (
                                        <p className="pl-8 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {T.ui.voiceDescriptions[voice.id]}
                                        </p>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-between items-center">
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title={T.ui.profileModal.logout}
                  >
                    <LogOutIcon className="w-5 h-5"/>
                    <span>{T.ui.profileModal.logout}</span>
                  </button>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                      {T.ui.cancel}
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-[#6c2bee] rounded-md hover:bg-[#5a22cc] transition-colors disabled:opacity-50">
                      {T.ui.save}
                    </button>
                  </div>
                </div>
            </div>
        </div>
    );
};
