import { ServiceUnavailableError } from '@serein/shared/utils/errors';
import { createLogger } from '@serein/shared/utils/logger';
import { config } from '../config';
import { SynthesizeRequest, TranscribeRequest, VoiceInfo } from '../types';
import { Readable } from 'stream';

const logger = createLogger('voice-service');

const buildVoiceList = (voices: string[]): VoiceInfo[] =>
  voices.map((voice) => ({
    id: voice,
    name: voice.split('/').slice(-2).join(' '),
  }));

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new ServiceUnavailableError('voice-provider', {
      status: response.status,
      response: text,
    });
  }
  return response.json() as Promise<T>;
};

export const listVoices = async (): Promise<VoiceInfo[]> => {
  const url = `${config.coqui.url}${config.coqui.voicesPath}`;

  try {
    const data = await fetchJson<{ voices?: Array<{ id?: string; name?: string }>; items?: string[] }>(
      url
    );
    if (Array.isArray(data.items)) {
      return buildVoiceList(data.items);
    }
    if (Array.isArray(data.voices)) {
      return data.voices
        .map((voice) => ({
          id: voice.id ?? voice.name ?? '',
          name: voice.name ?? voice.id ?? '',
        }))
        .filter((voice) => voice.id.length > 0);
    }
  } catch (error) {
    logger.warn({ error }, 'Coqui voices fetch failed, using fallback list');
  }

  const fallback = config.coqui.voices.length > 0 ? config.coqui.voices : [config.coqui.defaultVoice];
  return buildVoiceList(fallback);
};

export const synthesizeSpeech = async (
  request: SynthesizeRequest
): Promise<{ buffer: Buffer; contentType: string }> => {
  const url = `${config.coqui.url}${config.coqui.synthesizePath}`;
  const payload = {
    text: request.text,
    voice: request.voiceId || config.coqui.defaultVoice,
    speed: request.speed,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ServiceUnavailableError('coqui-tts', {
      status: response.status,
      response: text,
    });
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'audio/wav';
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
  };
};

export const streamSynthesizeSpeech = async (
  request: SynthesizeRequest
): Promise<{ stream: Readable; contentType: string }> => {
  const url = `${config.coqui.url}${config.coqui.synthesizePath}`;
  const payload = {
    text: request.text,
    voice: request.voiceId || config.coqui.defaultVoice,
    speed: request.speed,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ServiceUnavailableError('coqui-tts', {
      status: response.status,
      response: text,
    });
  }

  if (!response.body) {
    throw new ServiceUnavailableError('coqui-tts', {
      reason: 'missing-stream',
    });
  }

  const contentType = response.headers.get('content-type') || 'audio/wav';
  const stream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
  return { stream, contentType };
};

export const transcribeSpeech = async (request: TranscribeRequest): Promise<Record<string, unknown>> => {
  const url = `${config.whisper.url}${config.whisper.transcribePath}`;
  const bytes = Buffer.from(request.audioBase64, 'base64');
  const blob = new Blob([bytes], {
    type: request.contentType || 'audio/wav',
  });
  const form = new FormData();
  form.append('audio', blob, request.filename || 'audio.wav');
  form.append('model', config.whisper.model);
  if (request.language) {
    form.append('language', request.language);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ServiceUnavailableError('whisper', {
      status: response.status,
      response: text,
    });
  }

  return response.json() as Promise<Record<string, unknown>>;
};

export const checkVoiceHealth = async (): Promise<{ coqui: boolean; whisper: boolean }> => {
  const check = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const [coqui, whisper] = await Promise.all([
    check(`${config.coqui.url}/health`),
    check(`${config.whisper.url}/health`),
  ]);

  return { coqui, whisper };
};
