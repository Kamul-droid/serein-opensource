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
    <div className="auth-layout">
      <div className="auth-card">
        <section className="auth-hero">
          <span className="badge badge--soft">Serein Assistant</span>
          <div className="stack">
            <h1 className="auth-hero__title">Welcome back to your calm space.</h1>
            <p className="auth-hero__text">
              Reconnect with your guided conversations, reflections, and habits that keep you grounded.
            </p>
          </div>
          <ul className="auth-hero__list">
            <li className="auth-hero__item">Daily check-ins tailored to your mood.</li>
            <li className="auth-hero__item">Secure, private conversations with your assistant.</li>
            <li className="auth-hero__item">Gentle prompts to build sustainable routines.</li>
          </ul>
        </section>
        <section className="auth-panel">
          <div className="section-title">
            <span className="badge">Welcome back</span>
            <h2>Sign in</h2>
            <p className="text-muted">Continue where you left off and review your progress.</p>
          </div>
          <form className="stack" onSubmit={handleSubmit}>
            <label className="form-row" htmlFor="login-email">
              <span className="form-label">Email</span>
              <input
                id="login-email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="form-row" htmlFor="login-password">
              <span className="form-label">Password</span>
              <input
                id="login-password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="text-error">{error}</p>}
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="auth-helper">
            Your data is encrypted in transit. You can export or delete anytime.
          </div>
          <p className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
