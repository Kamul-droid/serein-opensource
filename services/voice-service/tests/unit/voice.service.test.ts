import { listVoices, checkVoiceHealth } from '../../src/services/voice.service';
import { config } from '../../src/config';

describe('Voice Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('falls back to default voice list when provider fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Coqui unavailable')) as unknown as typeof fetch;
    const voices = await listVoices();
    expect(voices[0].id).toBe(config.coqui.defaultVoice);
  });

  it('health check returns false when providers fail', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Down')) as unknown as typeof fetch;
    const status = await checkVoiceHealth();
    expect(status.coqui).toBe(false);
    expect(status.whisper).toBe(false);
  });
});
