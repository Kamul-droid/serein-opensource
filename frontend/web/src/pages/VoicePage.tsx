import { useEffect, useState } from 'react';
import { api } from '../utils/api';

type Voice = {
  id: string;
  name: string;
};

export default function VoicePage() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [text, setText] = useState('Take a slow deep breath and relax.');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listVoices()
      .then((data) => {
        setVoices(data.voices || []);
        if (data.voices?.length) {
          setSelectedVoice(data.voices[0].id);
        }
      })
      .catch(() => null);
  }, []);

  const handleSynthesize = async () => {
    setError(null);
    setAudioUrl(null);
    try {
      const response = await fetch('/voice/synthesize/stream', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(getAuthHeader() || {}),
        },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });
      if (!response.ok || !response.body) {
        throw new Error('Voice synthesis failed.');
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const parts: BlobPart[] = chunks.map(
        (chunk) =>
          chunk.buffer.slice(
            chunk.byteOffset,
            chunk.byteOffset + chunk.byteLength
          ) as ArrayBuffer
      );
      const blob = new Blob(parts, { type: response.headers.get('content-type') || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleTranscribe = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setTranscription(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    try {
      const result = await fetch('/voice/transcribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(getAuthHeader() || {}),
        },
        body: JSON.stringify({
          audioBase64: base64,
          filename: file.name,
          contentType: file.type,
        }),
      });
      if (!result.ok) {
        throw new Error('Transcription failed.');
      }
      const data = await result.json();
      setTranscription(data.text || JSON.stringify(data));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Voice mode</h2>
        <p>Generate speech responses or transcribe audio inputs.</p>
        <label className="stack" style={{ gap: 8 }}>
          <span>Voice</span>
          <select className="input" value={selectedVoice} onChange={(event) => setSelectedVoice(event.target.value)}>
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>
        <label className="stack" style={{ gap: 8 }}>
          <span>Text to synthesize</span>
          <textarea className="input" rows={3} value={text} onChange={(event) => setText(event.target.value)} />
        </label>
        <button className="button" onClick={handleSynthesize}>
          Generate voice
        </button>
        {audioUrl && <audio controls src={audioUrl} style={{ width: '100%' }} />}
      </div>

      <div className="card stack">
        <h3>Transcribe audio</h3>
        <input type="file" accept="audio/*" onChange={handleTranscribe} />
        {transcription && <p>{transcription}</p>}
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  );
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });

const getAuthHeader = () => {
  const token = localStorage.getItem('serein_access_token');
  return token ? { authorization: `Bearer ${token}` } : null;
};
