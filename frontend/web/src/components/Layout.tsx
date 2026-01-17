import { Link } from 'react-router-dom';
import { useAuth } from '../state/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">Serein</div>
        <nav className="topbar__links">
          {isAuthenticated ? (
            <>
              <Link to="/chat">Chat</Link>
              <Link to="/history">History</Link>
              <Link to="/voice">Voice</Link>
              <Link to="/profile">Profile</Link>
              <button className="button button--ghost" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
