import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [beliefs, setBeliefs] = useState('');
  const [mode, setMode] = useState('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const beliefList = beliefs
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (beliefList.length > 0) {
        await api.updateBeliefs({ beliefs: beliefList });
      }

      await api.updatePreferences({ communicationMode: mode });
      navigate('/chat');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card stack" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="stack">
        <span className="badge">Onboarding</span>
        <h2>Tell us about your journey</h2>
        <p>We’ll tailor guidance based on your beliefs and preferred mode.</p>
      </div>
      <form className="stack" onSubmit={handleSubmit}>
        <label className="stack" style={{ gap: 8 }}>
          <span>Beliefs or topics you value</span>
          <input
            className="input"
            placeholder="Mindfulness, gratitude, spirituality..."
            value={beliefs}
            onChange={(event) => setBeliefs(event.target.value)}
          />
        </label>
        <label className="stack" style={{ gap: 8 }}>
          <span>Preferred communication mode</span>
          <select className="input" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="text">Text only</option>
            <option value="voice">Voice only</option>
            <option value="both">Both</option>
          </select>
        </label>
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
