import React, { useState, useEffect } from 'react';
import { XIcon, LightbulbIcon } from './Icons';

interface GoalsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (description: string) => void;
    onSuggestSmartGoal: (description: string) => Promise<string>;
    T: any; // Translation object
}

export const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose, onSave, onSuggestSmartGoal, T }) => {
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
                  <button className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6c2bee]/20 text-[#6c2bee] dark:text-violet-300">
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

                {/* Bottom Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 w-full max-w-lg mx-auto">
                  <div className="flex justify-around items-center h-20 max-w-md mx-auto">
                    <button className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-1l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                      <span className="text-xs font-medium">Home</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      <span className="text-xs font-medium">Chat</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 text-[#6c2bee] dark:text-violet-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span className="text-xs font-bold">Journal</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span className="text-xs font-medium">Profile</span>
                    </button>
                  </div>
                </div>
            </div>
        </div>
    );
};
