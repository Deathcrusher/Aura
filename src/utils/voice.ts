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

export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  speak(text: string, lang: string = 'de-DE', voiceName?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find the requested voice
      const voices = this.synth.getVoices();
      if (voiceName) {
        const voice = voices.find(v => v.name.includes(voiceName));
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        // Find a German voice if language is German
        const germanVoice = voices.find(v => v.lang.startsWith('de'));
        if (germanVoice) {
          utterance.voice = germanVoice;
        }
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
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
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