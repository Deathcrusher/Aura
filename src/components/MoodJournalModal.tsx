import React, { useState } from 'react';
import { Mood, ViewType } from '../types';
import { XIcon, MoodVeryGoodIcon, MoodGoodIcon, MoodNeutralIcon, MoodBadIcon, MoodVeryBadIcon } from './Icons';
import { BottomNavigation } from './BottomNavigation';

interface MoodJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mood: Mood, note?: string) => void;
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
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

export const MoodJournalModal: React.FC<MoodJournalModalProps> = ({ isOpen, onClose, onSave, currentView, onNavigate, T }) => {
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
                  <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{T.ui.moodModal.title}</h1>
                  <div className="flex w-12 items-center justify-end">
                    <button onClick={onClose} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-slate-900 dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                      <svg className="w-6 h-6 text-slate-500 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
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
                                    className={`text-center p-2 rounded-lg transition-all ${selectedMood === moodKey ? 'bg-violet-100 dark:bg-violet-900/50 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                >
                                    <Icon className={`w-12 h-12 mx-auto ${color} ${darkColor}`} />
                                    <span className={`mt-2 text-xs font-medium ${selectedMood === moodKey ? 'text-[#483d8b] dark:text-violet-300' : 'text-slate-600 dark:text-slate-400'}`}>{T.ui.moods[moodKey]}</span>
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
                            className="w-full h-24 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee]"
                            placeholder={T.ui.moodModal.notesPlaceholder}
                        />
                    </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={handleSave}
                    disabled={!selectedMood}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl h-12 px-6 bg-[#6c2bee] text-white shadow-lg shadow-[#6c2bee]/30 hover:bg-[#5a22d6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">mood</span>
                    <span>{T.ui.save}</span>
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
