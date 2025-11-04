// Voice utilities for speech recognition and synthesis

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting voice recorder:', error);
      throw error;
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'de-DE';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (this.onResultCallback) {
          this.onResultCallback(transcript);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  start(onResult: (text: string) => void, onEnd: () => void): void {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    this.onResultCallback = onResult;
    this.onEndCallback = onEnd;
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

import { GoogleGenAI, Modality } from '@google/genai'
import { decode, decodeAudioData } from './audio'

export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  isSupported(): boolean {
    return Boolean((import.meta as any).env?.VITE_API_KEY) || 'speechSynthesis' in window;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private async speakWithGemini(text: string, lang: string, voiceName?: string) {
    const apiKey = (import.meta as any).env?.VITE_API_KEY as string | undefined;
    if (!apiKey) throw new Error('Missing VITE_API_KEY for Gemini TTS');

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: voiceName ? { prebuiltVoiceConfig: { voiceName } } : undefined,
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error('No audio data returned from Gemini');

    // Prepare audio context at 24kHz (matches generated PCM)
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch {}
    }
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;

    const buffer = await decodeAudioData(decode(base64Audio), this.audioCtx, 24000, 1);
    const source = this.audioCtx.createBufferSource();
    this.audioSource = source;
    source.buffer = buffer;
    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    return new Promise<void>((resolve, reject) => {
      source.onended = () => {
        resolve();
      };
      try {
        source.start();
      } catch (e) {
        reject(e);
      }
    });
  }

  async speak(text: string, lang: string = 'de-DE', voiceName?: string): Promise<void> {
    // Try Gemini TTS first
    try {
      if ((import.meta as any).env?.VITE_API_KEY) {
        return await this.speakWithGemini(text, lang, voiceName);
      }
    } catch (e) {
      console.warn('Gemini TTS failed, falling back to Web Speech:', e);
    }

    // Fallback to Web Speech API
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      this.stop();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      let voices = this.synth.getVoices();
      if (!voices || voices.length === 0) {
        const once = () => {
          this.synth.removeEventListener('voiceschanged', once);
          this.speak(text, lang, voiceName).then(resolve).catch(reject);
        };
        this.synth.addEventListener('voiceschanged', once);
        setTimeout(() => {
          this.synth.removeEventListener('voiceschanged', once);
          this.synth.speak(utterance);
          resolve();
        }, 1000);
        return;
      }

      if (voiceName) {
        const voice = voices.find(v => v.name.includes(voiceName));
        if (voice) utterance.voice = voice;
      } else {
        const germanVoice = voices.find(v => v.lang.startsWith('de'));
        if (germanVoice) utterance.voice = germanVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(event);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  stop(): void {
    // Stop Web Speech if active
    if (this.synth.speaking) this.synth.cancel();
    this.currentUtterance = null;

    // Stop Gemini playback if active
    try { this.audioSource?.stop(); } catch {}
    this.audioSource = null;
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch {}
      this.audioCtx = null;
    }
    this.analyser = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking || Boolean(this.audioSource);
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }
}

// Audio context utilities for visualization
export class AudioVisualization {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  async createFromStream(stream: MediaStream): Promise<AnalyserNode> {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);

    return this.analyser;
  }

  cleanup(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }
}
