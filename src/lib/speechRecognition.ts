// Web Speech API Type Declarations
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export interface SpeechRecognitionConfig {
  onBatchComplete: (text: string, timestamp: string) => void;
  onLiveTranscription: (text: string) => void;
  onError: (error: string) => void;
  onStatusChange: (isRecording: boolean) => void;
  silenceTimeout?: number;
}

export class BatchSpeechRecognition {
  private recognition: SpeechRecognition | null = null;
  private isRecording = false;
  private silenceTimer: number | null = null;
  private currentBatchText = '';
  private interimTranscript = '';
  private lastSpeechTimestamp = Date.now();
  private manuallyStopped = false;
  private restartAttempts = 0;
  private maxRestartAttempts = 5;

  private networkRetryDelay = 2000;
  private isReconnecting = false;
  private lastNetworkCheck = 0;
  private networkCheckInterval = 1000;
  private lastProcessedText = '';
  private sentenceBuffer = '';

  private config: Required<SpeechRecognitionConfig> = {
    onBatchComplete: () => { },
    onLiveTranscription: () => { },
    onError: () => { },
    onStatusChange: () => { },
    silenceTimeout: 10000,
  };

  constructor(config: SpeechRecognitionConfig) {
    this.config = { ...this.config, ...config };
  }

  private isSecureContext(): boolean {
    return window.isSecureContext;
  }

  private isSpeechRecognitionSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  private async checkNetworkConnectivity(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastNetworkCheck < this.networkCheckInterval) {
      return true;
    }
    this.lastNetworkCheck = now;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch('https://www.google.com/generate_204', {
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Network check timed out');
      }
      return navigator.onLine;
    }
  }

  private async initializeRecognition() {
    if (!this.isSpeechRecognitionSupported()) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    if (!this.isSecureContext()) {
      throw new Error('Speech recognition requires a secure context (HTTPS)');
    }

    try {
      if (this.recognition) {
        this.cleanupRecognition();
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      if (!this.recognition) {
        throw new Error('Failed to create SpeechRecognition instance');
      }

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = this.handleStart.bind(this);
      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);

      this.recognition.onaudiostart = () => {
        console.log('Audio recording started');
        this.lastSpeechTimestamp = Date.now();
      };

      this.recognition.onaudioend = () => {
        console.log('Audio recording ended');
        this.processBatchAndReset(true);
      };

      this.recognition.onnomatch = () => {
        console.log('No speech was recognized');
      };

      console.log('Speech recognition initialized successfully');
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize speech recognition: ${errorMessage}`);
    }
  }

  private cleanupRecognition() {
    if (!this.recognition) return;

    this.recognition.onstart = null;
    this.recognition.onresult = null;
    this.recognition.onerror = null;
    this.recognition.onend = null;
    this.recognition.onaudiostart = null;
    this.recognition.onaudioend = null;
    this.recognition.onnomatch = null;

    try {
      if (this.isRecording) {
        this.recognition.abort();
      }
      this.recognition.stop();
    } catch (error) {
      console.warn('Error during recognition cleanup:', error);
    }

    this.recognition = null;
  }

  private removeDuplicateSegments(text: string): string {
    const segments = text.split(/([.!?]\s+)/).filter(Boolean);
    const uniqueSegments = new Set<string>();

    return segments
      .filter(segment => {
        const normalized = segment.trim().toLowerCase();
        if (!normalized || uniqueSegments.has(normalized)) {
          return false;
        }
        uniqueSegments.add(normalized);
        return true;
      })
      .join('');
  }

  private processBatchAndReset(force = false) {
    let combinedText = [this.currentBatchText, this.interimTranscript, this.sentenceBuffer]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (combinedText) {
      combinedText = this.removeDuplicateSegments(combinedText);

      const similarity = this.calculateTextSimilarity(combinedText, this.lastProcessedText);
      if (similarity < 0.7 || force) {
        console.log('Processing batch:', combinedText);
        this.config.onBatchComplete(combinedText, new Date().toISOString());
        // We don't want to persist the last processed text too aggressively across forced batches
        // or we might suppress valid similar phrases in new batches
        this.lastProcessedText = force ? '' : combinedText;
      }

      this.currentBatchText = '';
      this.interimTranscript = '';
      this.sentenceBuffer = '';
      this.config.onLiveTranscription('');
    }

    if (force) {
      this.clearTimers();
    }
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private processCompleteSentences(text: string): { complete: string; incomplete: string } {
    const sentenceRegex = /[.!?]+\s+/g;
    const sentences = text.split(sentenceRegex);
    const lastSentence = sentences.pop() || '';

    const completeSentences = sentences.join('. ').trim();
    return {
      complete: completeSentences ? completeSentences + '.' : '',
      incomplete: lastSentence.trim()
    };
  }

  private async handleNetworkError() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    try {
      const isConnected = await this.checkNetworkConnectivity();

      if (!isConnected) {
        this.processBatchAndReset(true);
        this.stop();
        this.config.onError('No internet connection detected. Please check your network connection and try again.');
        return;
      }

      if (this.restartAttempts < this.maxRestartAttempts && !this.manuallyStopped) {
        this.restartAttempts++;
        await new Promise(resolve => setTimeout(resolve, this.networkRetryDelay));

        await this.initializeRecognition();
        if (this.recognition && !this.manuallyStopped) {
          await this.recognition.start();
          console.log('Recognition restarted after network error');
        }
      } else {
        this.processBatchAndReset(true);
        this.stop();
        this.config.onError('Unable to establish a stable connection. Please try again.');
      }
    } catch (error) {
      console.error('Error during network recovery:', error);
      this.processBatchAndReset(true);
      this.stop();
      this.config.onError('Failed to recover from network error. Please try again.');
    } finally {
      this.isReconnecting = false;
    }
  }

  private handleStart() {
    console.log('Recording started');
    this.isRecording = true;
    this.currentBatchText = '';
    this.interimTranscript = '';
    this.sentenceBuffer = '';
    this.lastProcessedText = '';
    this.restartAttempts = 0;
    this.config.onStatusChange(true);
    this.startSilenceDetection();
  }

  private handleResult(event: SpeechRecognitionEvent) {
    if (this.manuallyStopped) return;

    this.lastSpeechTimestamp = Date.now();
    this.restartAttempts = 0;

    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    if (finalTranscript) {
      const { complete, incomplete } = this.processCompleteSentences(finalTranscript);

      if (complete) {
        this.currentBatchText = complete;
        this.processBatchAndReset();
      }

      this.sentenceBuffer = incomplete;
    }

    this.interimTranscript = interimTranscript;

    const liveText = [this.sentenceBuffer, this.interimTranscript]
      .filter(Boolean)
      .join(' ')
      .trim();

    this.config.onLiveTranscription(liveText);
  }

  private startSilenceDetection() {
    if (this.silenceTimer) {
      window.clearInterval(this.silenceTimer);
    }

    this.silenceTimer = window.setInterval(() => {
      const silenceDuration = Date.now() - this.lastSpeechTimestamp;
      if (silenceDuration >= this.config.silenceTimeout) {
        console.log('Silence timeout reached, stopping recording');
        this.processBatchAndReset(true);
        this.stop();
        this.config.onError('No speech detected for an extended period. Recording stopped.');
      }
    }, 1000);
  }

  private async checkMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      return false;
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent) {
    console.log('Speech recognition error:', event.error);

    if (event.error === 'not-allowed') {
      this.processBatchAndReset(true);
      this.stop();
      this.config.onError('Microphone access denied. Please allow microphone access in your browser settings and try again.');
      return;
    }

    if (event.error === 'network') {
      this.handleNetworkError();
      return;
    }

    if (event.error === 'audio-capture') {
      this.processBatchAndReset(true);
      this.stop();
      this.config.onError('No microphone detected. Please ensure your microphone is properly connected and try again.');
      return;
    }

    if (event.error === 'no-speech' && !this.manuallyStopped) {
      if (this.restartAttempts < this.maxRestartAttempts) {
        this.restartAttempts++;
        this.restart();
        return;
      }
      this.processBatchAndReset(true);
      this.stop();
      this.config.onError('No speech detected. Please try speaking again.');
      return;
    }

    if (event.error === 'aborted' && !this.manuallyStopped) {
      this.restart();
      return;
    }

    this.processBatchAndReset(true);
    this.stop();
    this.config.onError(`Speech recognition error: ${event.error}. Please try again.`);
  }

  private handleEnd() {
    console.log('Recognition service disconnected');

    if (this.manuallyStopped) {
      this.isRecording = false;
      this.config.onStatusChange(false);
      return;
    }

    if (this.isRecording && this.restartAttempts < this.maxRestartAttempts) {
      console.log(`Auto-restarting (${this.restartAttempts + 1}/${this.maxRestartAttempts})`);
      this.restart();
    } else {
      this.processBatchAndReset(true);
      this.stop();
    }
  }

  private restart() {
    if (!this.isRecording || this.manuallyStopped) return;

    setTimeout(async () => {
      try {
        await this.initializeRecognition();
        if (this.recognition) {
          await this.recognition.start();
        }
      } catch (error) {
        console.error('Failed to restart recognition:', error);
        this.processBatchAndReset(true);
        this.stop();
        this.config.onError('Failed to restart speech recognition. Please try again.');
      }
    }, this.networkRetryDelay);
  }

  private clearTimers() {
    if (this.silenceTimer) {
      window.clearInterval(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  public async start() {
    if (this.isRecording) {
      console.log('Already recording, ignoring start request');
      return;
    }

    try {
      if (!this.isSecureContext()) {
        throw new Error('Speech recognition requires a secure context (HTTPS)');
      }

      if (!this.isSpeechRecognitionSupported()) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      const isConnected = await this.checkNetworkConnectivity();
      if (!isConnected) {
        throw new Error('No internet connection detected. Please check your network connection.');
      }

      const hasMicrophoneAccess = await this.checkMicrophonePermission();
      if (!hasMicrophoneAccess) {
        throw new Error('Microphone access is required. Please allow microphone access in your browser settings.');
      }

      this.manuallyStopped = false;
      this.restartAttempts = 0;
      this.currentBatchText = '';
      this.interimTranscript = '';
      this.sentenceBuffer = '';
      this.lastProcessedText = '';
      this.isReconnecting = false;

      await this.initializeRecognition();

      if (!this.recognition) {
        throw new Error('Failed to initialize speech recognition');
      }

      console.log('Starting speech recognition');
      this.lastSpeechTimestamp = Date.now();
      await this.recognition.start();
      this.isRecording = true;
      this.config.onStatusChange(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.isRecording = false;
      this.config.onStatusChange(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.config.onError(`Failed to start speech recognition: ${errorMessage}`);
    }
  }

  public stop() {
    if (!this.isRecording) {
      console.log('Not recording, ignoring stop request');
      return;
    }

    console.log('Stopping speech recognition');
    this.manuallyStopped = true;
    this.isRecording = false;

    try {
      this.processBatchAndReset(true);
      this.cleanupRecognition();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }

    this.clearTimers();
    this.config.onStatusChange(false);
  }
}