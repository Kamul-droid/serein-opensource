# Voice Service

Voice service for Serein Open Source. Bridges text-to-speech (Coqui TTS) and speech-to-text (Whisper).

## Features

- Text-to-speech (TTS) proxy
- Speech-to-text (STT) proxy
- Voice catalog endpoint
- Health checks for Coqui and Whisper

## APIs

- `POST /voice/synthesize` - Generate speech from text
- `POST /voice/synthesize/stream` - Stream speech audio
- `POST /voice/transcribe` - Transcribe audio to text
- `GET /voice/voices` - List available voices
- `GET /health` - Service health check

**Note**: All routes require authentication (JWT token in Authorization header)

## Environment Variables

```env
PORT=3006
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
COQUI_TTS_URL=http://localhost:5002
COQUI_TTS_SYNTHESIZE_PATH=/api/tts
COQUI_TTS_VOICES_PATH=/api/voices
COQUI_TTS_DEFAULT_VOICE=tts_models/en/ljspeech/tacotron2-DDC
COQUI_TTS_VOICES=tts_models/en/ljspeech/tacotron2-DDC
WHISPER_URL=http://localhost:5003
WHISPER_TRANSCRIBE_PATH=/api/transcribe
WHISPER_MODEL=base
```

## Example Requests

### Synthesize
```json
{
  "text": "Take a deep breath and relax.",
  "voiceId": "tts_models/en/ljspeech/tacotron2-DDC"
}
```

### Stream Synthesize
```json
{
  "text": "Let's take this one breath at a time.",
  "voiceId": "tts_models/en/ljspeech/tacotron2-DDC"
}
```

### Transcribe
```json
{
  "audioBase64": "<base64-wav>",
  "filename": "audio.wav",
  "contentType": "audio/wav"
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```
