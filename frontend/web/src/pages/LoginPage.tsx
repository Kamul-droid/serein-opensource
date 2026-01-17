import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../state/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card stack" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="stack">
        <span className="badge">Welcome back</span>
        <h2>Sign in</h2>
        <p>Access your conversations and continue your well-being journey.</p>
      </div>
      <form className="stack" onSubmit={handleSubmit}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
