import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

type Conversation = {
  id: string;
  title?: string;
  updatedAt?: string;
};

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .getConversations()
      .then(setConversations)
      .catch(() => null);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return conversations;
    }
    const lower = query.toLowerCase();
    return conversations.filter((conv) => (conv.title || '').toLowerCase().includes(lower));
  }, [conversations, query]);

  return (
    <div className="stack">
      <div className="card stack">
        <div className="stack">
          <h2>Conversation history</h2>
          <p>Find past conversations and revisit insights.</p>
        </div>
        <input
          className="input"
          placeholder="Search conversations"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="stack">
          {filtered.map((conv) => (
            <div key={conv.id} className="card" style={{ padding: 12 }}>
              <strong>{conv.title || 'Untitled conversation'}</strong>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{conv.updatedAt}</div>
            </div>
          ))}
          {filtered.length === 0 && <p>No conversations yet.</p>}
        </div>
      </div>
    </div>
  );
}
