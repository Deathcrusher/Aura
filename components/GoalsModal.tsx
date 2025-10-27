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
                <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{T.ui.goalsModal.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.goalsModal.subtitle}</p>
                </div>

                <div className="p-6 space-y-4">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-32 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={T.ui.goalsModal.placeholder}
                    />
                    <button
                        onClick={handleSuggest}
                        disabled={isSuggesting || !description.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                        {T.ui.cancel}
                    </button>
                    <button onClick={handleSave} disabled={!description.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {T.ui.goalsModal.saveButton}
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <XIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>
        </div>
    );
};
