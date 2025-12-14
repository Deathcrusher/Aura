import React, { useState, useEffect } from 'react';
import { XIcon, LightbulbIcon } from './Icons';
import { BottomNavigation } from './BottomNavigation';
import { ViewType } from '../types';

interface GoalsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (description: string) => void;
    onSuggestSmartGoal: (description: string) => Promise<string>;
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
    T: any; // Translation object
}

export const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose, onSave, onSuggestSmartGoal, currentView, onNavigate, T }) => {
    const [description, setDescription] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDescription(''); // Reset on open
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSuggest = async () => {
        if (!description.trim()) return;
        setIsSuggesting(true);
        try {
            const suggestion = await onSuggestSmartGoal(description);
            setDescription(suggestion);
        } catch (e) {
            console.error("Failed to get goal suggestion", e);
            alert(T.ui.goalsModal.suggestionError);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSave = () => {
        if (!description.trim()) return;
        onSave(description.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center bg-white dark:bg-slate-800 p-4 pb-2 justify-between sticky top-0 z-10 border-b border-white/10">
                  <button 
                    onClick={onClose}
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6c2bee]/20 text-[#6c2bee] dark:text-violet-300"
                    aria-label={T.ui.cancel}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <h1 className="text-slate-90 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{T.ui.goalsModal.title}</h1>
                  <div className="flex w-12 items-center justify-end">
                    <button onClick={onClose} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-slate-900 dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                      <svg className="w-6 h-6 text-slate-500 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-32 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee]"
                        placeholder={T.ui.goalsModal.placeholder}
                    />
                    <button
                        onClick={handleSuggest}
                        disabled={isSuggesting || !description.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#483d8b] dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 rounded-md hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSuggesting ? (
                            <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{T.ui.goalsModal.suggestingText}</span>
                            </>
                        ) : (
                             <>
                            <LightbulbIcon className="w-5 h-5"/>
                            <span>{T.ui.goalsModal.suggestButton}</span>
                            </>
                        )}

                    </button>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={handleSave}
                    disabled={!description.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl h-12 px-6 bg-[#6c2bee] text-white shadow-lg shadow-[#6c2bee]/30 hover:bg-[#5a22d6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{T.ui.goalsModal.saveButton}</span>
                  </button>
                </div>

                {/* Bottom Navigation Bar */}
                <div className="sticky bottom-0 w-full max-w-lg mx-auto rounded-b-2xl overflow-hidden">
                  <BottomNavigation 
                    currentView={currentView} 
                    onNavigate={(view) => {
                      onNavigate(view);
                      onClose(); // Close modal when navigating
                    }}
                  />
                </div>
            </div>
        </div>
    );
};
