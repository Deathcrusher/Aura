import React from 'react';

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Zm0 12a5 5 0 0 1-5-5V5a5 5 0 0 1 10 0v6a5 5 0 0 1-5 5Z" />
    <path d="M12 18.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5ZM8 21.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Z" />
    <path d="M15 15a1 1 0 0 1 1 1v.393a7.001 7.001 0 0 1-8 0V16a1 1 0 1 1 2 0v.107a5.002 5.002 0 0 0 4 0V16a1 1 0 0 1 1-1Z" />
  </svg>
);

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 6h12v12H6z" />
  </svg>
);

export const SpeakingIndicator: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center space-x-1 ${className}`}>
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
    </div>
);

const AURA_AVATAR_BASE64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/2wBDAQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCAEgASADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EABwQAQEBAAMBAQEAAAAAAAAAAAABEQISIUFRgf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A8qKigioCoKgqCoKgqCoAqCoKgoiioKqKigioKIIoigioKIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqCoKgqAqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqCoKgqAqCoKgqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgq";

export const AuraHumanAvatar: React.FC<{ className?: string }> = ({ className }) => (
    <img src={AURA_AVATAR_BASE64} alt="Aura, your AI therapist" className={`rounded-full object-cover ${className}`} />
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>
);

export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
);

export const GoalsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
);

export const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
);

export const MoodVeryGoodIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3.5 6c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3.5 9.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
);

export const MoodGoodIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.5 8c.83 0 1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3.5 6.5c1.01 0 1.91-.39 2.6-1H9.01c.69.61 1.59 1 2.59 1z"/></svg>
);

export const MoodNeutralIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.5 8c.83 0 1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-4 6H8v-1.5h7V14z"/></svg>
);

export const MoodBadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.5 8c.83 0 1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3.41 5.59c-.78.78-2.05.78-2.83 0l-.35-.35c.98-.63 2.2-.63 3.18 0l-.35.35c.08.08.15.17.22.26z"/></svg>
);

export const MoodVeryBadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3.5 6c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3.5 4.5c-2.33 0-4.31 1.46-5.11 3.5H6.89c-.8-2.04-2.78-3.5-5.11-3.5z"/></svg>
);

export const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>
);

export const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8 5v14l11-7z" />
    </svg>
);

export const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <circle cx="12" cy="12" r="3.2"/>
        <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`animate-spin ${className}`}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>
);

export const LogOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.5l1.09 3.37h3.55l-2.87 2.08 1.09 3.37L12 9.24l-2.86 2.08 1.09-3.37-2.87-2.08h3.55L12 2.5zM6 12l1.09 3.37h3.55l-2.87 2.08 1.09 3.37L6 18.74l-2.86 2.08 1.09-3.37-2.87-2.08h3.55L6 12zm12 0l1.09 3.37h3.55l-2.87 2.08 1.09 3.37L18 18.74l-2.86 2.08 1.09-3.37-2.87-2.08h3.55L18 12z"/>
  </svg>
);