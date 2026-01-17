/**
 * Types for Voice Service
 */

export interface SynthesizeRequest {
  text: string;
  voiceId?: string;
  speed?: number;
}

export interface TranscribeRequest {
  audioBase64: string;
  filename?: string;
  contentType?: string;
  language?: string;
}

export interface VoiceInfo {
  id: string;
  name: string;
}
