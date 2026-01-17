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
    <div className="card stack" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="stack">
        <span className="badge">Start here</span>
        <h2>Create your account</h2>
        <p>Set up your preferences to personalize your experience.</p>
      </div>
      <form className="stack" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          placeholder="Name"
          style={{ color: 'rgb(27, 27, 29)' }}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          style={{ color: 'rgb(16, 15, 15)' }}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          style={{ color: 'rgb(26, 25, 25)' }}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
