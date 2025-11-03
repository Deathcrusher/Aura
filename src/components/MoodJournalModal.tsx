import React, { useState } from 'react';
import { Mood } from '../types';
import { XIcon, MoodVeryGoodIcon, MoodGoodIcon, MoodNeutralIcon, MoodBadIcon, MoodVeryBadIcon } from './Icons';

interface MoodJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mood: Mood, note?: string) => void;
    T: any; // Translation object
}

const moodKeys: Mood[] = ['Sehr gut', 'Gut', 'Neutral', 'Schlecht', 'Sehr schlecht'];

const moodIcons: { [key in Mood]: { icon: React.FC<{ className?: string }>; color: string, darkColor: string } } = {
    'Sehr gut': { icon: MoodVeryGoodIcon, color: 'text-green-500', darkColor: 'dark:text-green-400' },
    'Gut': { icon: MoodGoodIcon, color: 'text-lime-500', darkColor: 'dark:text-lime-400' },
    'Neutral': { icon: MoodNeutralIcon, color: 'text-yellow-500', darkColor: 'dark:text-yellow-400' },
    'Schlecht': { icon: MoodBadIcon, color: 'text-orange-500', darkColor: 'dark:text-orange-400' },
    'Sehr schlecht': { icon: MoodVeryBadIcon, color: 'text-red-500', darkColor: 'dark:text-red-400' },
};

export const MoodJournalModal: React.FC<MoodJournalModalProps> = ({ isOpen, onClose, onSave, T }) => {
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!selectedMood) return;
        onSave(selectedMood, note.trim() || undefined);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{T.ui.moodModal.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.moodModal.subtitle}</p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex justify-around">
                            {moodKeys.map((moodKey) => {
                                const { icon: Icon, color, darkColor } = moodIcons[moodKey];
                                return (
                                <button
                                    key={moodKey}
                                    onClick={() => setSelectedMood(moodKey)}
                                    className={`text-center p-2 rounded-lg transition-all ${selectedMood === moodKey ? 'bg-blue-100 dark:bg-blue-900/50 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                >
                                    <Icon className={`w-12 h-12 mx-auto ${color} ${darkColor}`} />
                                    <span className={`mt-2 text-xs font-medium ${selectedMood === moodKey ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>{T.ui.moods[moodKey]}</span>
                                </button>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="mood-note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {T.ui.moodModal.notesLabel}
                        </label>
                        <textarea
                            id="mood-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full h-24 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={T.ui.moodModal.notesPlaceholder}
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                        {T.ui.cancel}
                    </button>
                    <button onClick={handleSave} disabled={!selectedMood} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {T.ui.save}
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <XIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>
        </div>
    );
};
