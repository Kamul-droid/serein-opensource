import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../state/auth';

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

export default function ChatPage() {
  const { accessToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

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
    const load = async () => {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
      } else {
        const created = await api.createConversation({ title: 'Welcome' });
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
  }, [selectedId, accessToken]);

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
  };

  const handleSend = async () => {
    if (!selectedId || !input.trim()) {
      return;
    }
    const content = input.trim();
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

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="card stack">
          <div className="chat-sidebar__header">
            <div className="section-title">
              <span className="badge">Your space</span>
              <h3>Conversations</h3>
              <p className="text-muted">Pick up any thread or start fresh.</p>
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
                  <strong>{conv.title || 'Untitled conversation'}</strong>
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
              <span className="badge">Active</span>
              <div>
                <h2>{selectedConversation?.title || 'Conversation'}</h2>
                <p className="text-muted">Your assistant listens, reflects, and responds with care.</p>
              </div>
            </div>
            <div className="chat-actions">
              <span className="pill">Private session</span>
              {loading && <span className="pill">Thinking...</span>}
            </div>
          </div>
          <div className="chat-window chat-window--elevated">
            {messages.length === 0 ? (
              <div className="auth-helper">
                Start by sharing how you feel today. Your assistant will respond with supportive guidance.
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
            <label className="form-row" htmlFor="chat-input">
              <span className="form-label">Message</span>
              <textarea
                id="chat-input"
                className="input composer-input"
                rows={4}
                placeholder="Share what's on your mind..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </label>
            <button className="button" onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
