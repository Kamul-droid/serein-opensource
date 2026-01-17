const parseList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

/**
 * Configuration for Voice Service
 */
export const config = {
  port: parseInt(process.env.PORT || '3006', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  coqui: {
    url: process.env.COQUI_TTS_URL || 'http://localhost:5002',
    synthesizePath: process.env.COQUI_TTS_SYNTHESIZE_PATH || '/api/tts',
    voicesPath: process.env.COQUI_TTS_VOICES_PATH || '/api/voices',
    defaultVoice: process.env.COQUI_TTS_DEFAULT_VOICE || 'tts_models/en/ljspeech/tacotron2-DDC',
    voices: parseList(process.env.COQUI_TTS_VOICES, []),
  },
  whisper: {
    url: process.env.WHISPER_URL || 'http://localhost:5003',
    transcribePath: process.env.WHISPER_TRANSCRIBE_PATH || '/api/transcribe',
    model: process.env.WHISPER_MODEL || 'base',
  },
};
