import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../state/auth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/onboarding');
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
          <span className="badge badge--soft">Start your journey</span>
          <div className="stack">
            <h1 className="auth-hero__title">Build a support system that grows with you.</h1>
            <p className="auth-hero__text">
              Serein helps you reflect, track patterns, and feel supported in everyday moments.
            </p>
          </div>
          <ul className="auth-hero__list">
            <li className="auth-hero__item">Personalized onboarding for your goals.</li>
            <li className="auth-hero__item">Private journals that stay organized.</li>
            <li className="auth-hero__item">Conversation history so nothing gets lost.</li>
          </ul>
        </section>
        <section className="auth-panel">
          <div className="section-title">
            <span className="badge">Create account</span>
            <h2>Start in minutes</h2>
            <p className="text-muted">Tell us a little about you to personalize your assistant.</p>
          </div>
          <form className="stack" onSubmit={handleSubmit}>
            <label className="form-row" htmlFor="register-name">
              <span className="form-label">Name</span>
              <input
                id="register-name"
                className="input"
                type="text"
                placeholder="What should we call you?"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="form-row" htmlFor="register-email">
              <span className="form-label">Email</span>
              <input
                id="register-email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="form-row" htmlFor="register-password">
              <span className="form-label">Password</span>
              <input
                id="register-password"
                className="input"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="text-error">{error}</p>}
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <div className="auth-helper">
            We use your preferences to tailor suggestions and supportive reminders.
          </div>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
