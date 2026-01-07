import { useCallback, useRef, useState, useEffect } from 'react';
import { BatchSpeechRecognition, SpeechRecognitionConfig } from '../lib/speechRecognition';

export function useSpeechRecognition(config: Omit<SpeechRecognitionConfig, 'onStatusChange'>) {
  const [isRecording, setIsRecording] = useState(false);
  const [_liveTranscription, setLiveTranscription] = useState('');
  const recognitionRef = useRef<BatchSpeechRecognition | null>(null);

  useEffect(() => {
    if (!recognitionRef.current) {
      try {
        recognitionRef.current = new BatchSpeechRecognition({
          ...config,
          onStatusChange: (status) => {
            console.log('Recording status changed:', status);
            setIsRecording(status);
            if (!status) {
              setLiveTranscription('');
            }
          },
          onLiveTranscription: (text) => {
            setLiveTranscription(text);
            config.onLiveTranscription(text);
          },
          onBatchComplete: (text, timestamp) => {
            config.onBatchComplete(text, timestamp);
          },
          onError: (error) => {
            console.log('Recording error:', error);
            setIsRecording(false);
            setLiveTranscription('');
            config.onError?.(error);
          }
        });
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        config.onError?.('Failed to initialize speech recognition');
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setIsRecording(false);
          setLiveTranscription('');
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
        recognitionRef.current = null;
      }
    };
  }, [config]);

  const startRecording = useCallback(() => {
    console.log('Start recording called');
    if (!recognitionRef.current) {
      console.log('No recognition instance available');
      return;
    }
    try {
      console.log('Starting recording...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setLiveTranscription('');
      config.onError?.('Failed to start recording');
    }
  }, [config]);

  const stopRecording = useCallback(() => {
    console.log('Stop recording called');
    if (!recognitionRef.current) {
      console.log('No recognition instance available');
      return;
    }
    try {
      console.log('Stopping recording...');
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setLiveTranscription('');
      config.onError?.('Failed to stop recording');
    }
  }, [config]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
}