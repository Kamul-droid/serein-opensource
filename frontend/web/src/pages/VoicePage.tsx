import { useEffect, useMemo, useRef, useState } from 'react';
import { api, authFetch } from '../utils/api';
import { useAuth } from '../state/auth';

type Voice = {
  id: string;
  name: string;
};

type Conversation = {
  id: string;
  title?: string;
  updatedAt?: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
};

type UserContext = {
  beliefs?: string[];
  interests?: string[];
};

export default function VoicePage() {
  const { accessToken } = useAuth();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conv) => conv.id === selectedId),
    [conversations, selectedId]
  );

  const getRoleLabel = (role: Message['role']) => {
    if (role === 'assistant') return 'Serein';
    if (role === 'user') return 'You';
    return 'System';
  };

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

  useEffect(() => {
    const load = async () => {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
      } else {
        const created = await api.createConversation({ title: 'Voice session' });
        setConversations([created]);
        setSelectedId(created.id);
      }
    };
    load().catch(() => null);
  }, []);

  useEffect(() => {
    api
      .getProfile()
      .then((profile) => {
        setUserContext({
          beliefs: profile.beliefs || [],
          interests: profile.interests || [],
        });
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    const loadMessages = async () => {
      const data = await api.getMessages(selectedId);
      setMessages(data);
    };
    loadMessages().catch(() => null);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const wsBase =
      import.meta.env.VITE_WS_BASE_URL ||
      (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/^http/, 'ws');
    const token = accessToken || localStorage.getItem('serein_access_token') || '';
    const wsUrl = `${wsBase}/conversations/${selectedId}/stream?token=${encodeURIComponent(token)}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as {
          type?: string;
          content?: string;
          message?: string;
          delta?: string;
        };
        if (payload.type === 'assistant_chunk' && typeof payload.delta === 'string') {
          const delta = payload.delta;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && last.id.startsWith('stream-')) {
              return [
                ...prev.slice(0, -1),
                { ...last, content: `${last.content}${delta}` },
              ];
            }
            return [
              ...prev,
              {
                id: `stream-${Date.now()}`,
                role: 'assistant',
                content: delta,
              },
            ];
          });
        }
        if (payload.type === 'assistant' && typeof payload.content === 'string') {
          const content = payload.content;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && last.id.startsWith('stream-')) {
              return [
                ...prev.slice(0, -1),
                {
                  id: `assistant-${Date.now()}`,
                  role: 'assistant',
                  content,
                },
              ];
            }
            return [
              ...prev,
              {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content,
              },
            ];
          });
          if (voiceEnabled) {
            void synthesizeAndPlay(content);
          }
        }
        if (payload.type === 'error') {
          setError(payload.message || 'Streaming error');
        }
      } catch (err) {
        // Ignore non-JSON messages
      }
    };

    socket.onerror = () => setError('WebSocket connection failed');

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [selectedId, voiceEnabled, accessToken]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      recorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const sendFallbackResponse = async (conversationId: string, content: string) => {
    await api.sendMessage(conversationId, { role: 'user', content });
    const history = await api.getMessages(conversationId);
    const aiResponse = await api.chat({
      messages: history.map((msg) => ({ role: msg.role, content: msg.content })),
      conversationId,
      userContext: userContext || undefined,
    });
    await api.sendMessage(conversationId, { role: 'assistant', content: aiResponse.message });
    const updated = await api.getMessages(conversationId);
    setMessages(updated);
    if (voiceEnabled) {
      await synthesizeAndPlay(aiResponse.message);
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedId || !content.trim()) {
      return;
    }
    setInput('');
    setLoading(true);
    setError(null);

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ content }));
      } else {
        await sendFallbackResponse(selectedId, content);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const synthesizeAndPlay = async (text: string) => {
    if (!text.trim()) {
      return;
    }
    setError(null);
    setSpeaking(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    try {
      const response = await authFetch('/voice/synthesize/stream', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ text, ...(selectedVoice ? { voiceId: selectedVoice } : {}) }),
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
          if (audioRef.current) {
            audioRef.current.src = url;
            await audioRef.current.play().catch(() => null);
          }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSpeaking(false);
    }
  };

  const startListening = async () => {
    if (listening) {
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Voice recording is not supported in this browser.');
      return;
    }
    setError(null);
    setTranscription(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        try {
          const base64 = await blobToBase64(blob);
          const text = await transcribeAudio(base64, blob.type);
          setTranscription(text);
          setInput(text);
          if (voiceEnabled && text.trim()) {
            await sendMessage(text);
          }
        } catch (err) {
          setError((err as Error).message);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setListening(true);
    } catch (err) {
      setError('Microphone access failed.');
    }
  };

  const stopListening = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setListening(false);
  };

  const handleTranscribeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setTranscription(null);
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const text = await transcribeAudio(base64, file.type);
      setTranscription(text);
      setInput(text);
      if (voiceEnabled && text.trim()) {
        await sendMessage(text);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="card stack">
          <div className="chat-sidebar__header">
            <div className="section-title">
              <span className="badge badge--soft">Voice mode</span>
              <h3>Sessions</h3>
              <p className="text-muted">Switch between voice-enabled conversations.</p>
            </div>
            <span className="pill">Synced</span>
          </div>
          <div className="conversation-list">
            {conversations.map((conv) => {
              const isActive = conv.id === selectedId;
              return (
                <button
                  key={conv.id}
                  className={`conversation-item ${isActive ? 'conversation-item--active' : ''}`}
                  onClick={() => setSelectedId(conv.id)}
                >
                  <strong>{conv.title || 'Voice session'}</strong>
                  <div className="conversation-meta">
                    {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : 'Recently updated'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
      <section className="chat-main">
        <div className="card stack">
          <div className="chat-header">
            <div className="chat-header__title">
              <span className="badge">Live</span>
              <div>
                <h2>{selectedConversation?.title || 'Voice conversation'}</h2>
                <p className="text-muted">
                  Talk to Serein and receive responses in voice when enabled.
                </p>
              </div>
            </div>
            <div className="chat-actions">
              <span className="pill">{listening ? 'Listening' : 'Idle'}</span>
              {speaking && <span className="pill">Speaking</span>}
              {loading && <span className="pill">Thinking...</span>}
            </div>
          </div>
          <div className="voice-controls grid grid--2">
            <div className="stack">
              <label className="form-row">
                <span className="form-label">Voice output</span>
                <select
                  className="input"
                  value={selectedVoice}
                  onChange={(event) => setSelectedVoice(event.target.value)}
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-row">
                <span className="form-label">Voice mode</span>
                <button
                  className={`button button--ghost ${voiceEnabled ? 'voice-toggle--active' : ''}`}
                  type="button"
                  onClick={() => setVoiceEnabled((prev) => !prev)}
                >
                  {voiceEnabled ? 'Voice replies on' : 'Voice replies off'}
                </button>
              </label>
            </div>
            <div className="stack">
              <label className="form-row">
                <span className="form-label">Speak to Serein</span>
                <div className="voice-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={listening ? stopListening : startListening}
                  >
                    {listening ? 'Stop listening' : 'Start listening'}
                  </button>
                  <label className="button button--ghost" htmlFor="voice-upload">
                    Upload audio
                  </label>
                  <input
                    id="voice-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleTranscribeUpload}
                    hidden
                  />
                </div>
              </label>
              {transcription && <div className="auth-helper">{transcription}</div>}
            </div>
          </div>
          <div className="chat-window chat-window--elevated">
            {messages.length === 0 ? (
              <div className="auth-helper">
                Start by sharing your beliefs and interests. Voice replies are available when enabled.
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message message--${message.role}`}>
                  <div>{message.content}</div>
                  <div className="message__meta">{getRoleLabel(message.role)}</div>
                </div>
              ))
            )}
          </div>
          {error && <p className="text-error">{error}</p>}
          <div className="chat-composer">
            <label className="form-row" htmlFor="voice-chat-input">
              <span className="form-label">Message</span>
              <textarea
                id="voice-chat-input"
                className="input composer-input"
                rows={3}
                placeholder="Type or speak to continue the conversation..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </label>
            <button className="button" onClick={() => sendMessage(input)} disabled={loading}>
              {loading ? 'Sending...' : 'Send message'}
            </button>
          </div>
          <audio ref={audioRef} controls src={audioUrl || undefined} style={{ width: '100%' }} />
        </div>
      </section>
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

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Audio read failed'));
    reader.readAsDataURL(blob);
  });

const transcribeAudio = async (audioBase64: string, contentType: string) => {
  const result = await authFetch('/voice/transcribe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audioBase64,
      contentType,
    }),
  });
  if (!result.ok) {
    throw new Error('Transcription failed.');
  }
  const data = await result.json();
  return data.text || JSON.stringify(data);
};

