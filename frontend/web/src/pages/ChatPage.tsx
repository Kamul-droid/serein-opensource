import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

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

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((conv) => conv.id === selectedId),
    [conversations, selectedId]
  );

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
    if (!selectedId) {
      return;
    }
    const loadMessages = async () => {
      const data = await api.getMessages(selectedId);
      setMessages(data);
    };
    loadMessages().catch(() => null);
  }, [selectedId]);

  const handleSend = async () => {
    if (!selectedId || !input.trim()) {
      return;
    }
    const content = input.trim();
    setInput('');
    setLoading(true);

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.sendMessage(selectedId, { role: 'user', content });
      const updated = await api.getMessages(selectedId);
      setMessages(updated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-layout">
      <div className="grid grid--2">
        <div className="card stack">
          <h3>Your conversations</h3>
          <div className="stack">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className="button button--ghost"
                onClick={() => setSelectedId(conv.id)}
                style={{
                  justifyContent: 'flex-start',
                  background: conv.id === selectedId ? '#e0e7ff' : 'transparent',
                }}
              >
                {conv.title || 'Untitled conversation'}
              </button>
            ))}
          </div>
        </div>
        <div className="card stack">
          <div className="stack">
            <span className="badge">Active</span>
            <h2>{selectedConversation?.title || 'Conversation'}</h2>
          </div>
          <div className="chat-window">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role === 'user' ? 'message--user' : 'message--assistant'}`}
              >
                {message.content}
                <div className="message-meta">{message.role}</div>
              </div>
            ))}
          </div>
          <div className="stack">
            <textarea
              className="input"
              rows={3}
              placeholder="Share what's on your mind..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button className="button" onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
