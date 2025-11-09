import React from 'react';
import { PlayIcon, StopIcon, DownloadIcon, LightbulbIcon, SpinnerIcon } from './Icons';

interface SessionSummaryCardProps {
  summary: string;
  T: any;
  onPlay: () => void;
  playbackState: 'idle' | 'loading' | 'playing';
  onExport: () => void;
}

export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({ 
  summary, 
  T, 
  onPlay, 
  playbackState,
  onExport 
}) => (
  <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 shadow-lg w-full max-w-3xl animate-fade-in">
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-3">
        <LightbulbIcon className="w-6 h-6 text-blue-500"/>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{T.ui.chat.insightsTitle || 'Deine Sitzungs-Einblicke'}</h3>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onExport}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label={T.ui.chat.exportSession || 'Sitzung exportieren'}
        >
          <DownloadIcon className="w-6 h-6 text-blue-500" />
        </button>
        <button 
          onClick={onPlay}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
          disabled={playbackState === 'loading'}
          aria-label={playbackState === 'playing' ? (T.ui.chat.stopSummary || 'Wiedergabe stoppen') : (T.ui.chat.playSummary || 'Zusammenfassung abspielen')}
        >
          {playbackState === 'loading' && <SpinnerIcon className="w-6 h-6 text-blue-500" />}
          {playbackState === 'playing' && <StopIcon className="w-6 h-6 text-blue-500" />}
          {playbackState === 'idle' && <PlayIcon className="w-6 h-6 text-blue-500" />}
        </button>
      </div>
    </div>
    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
      {summary.split('\n\n').map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
      ))}
    </div>
  </div>
);

