import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ChatPage from './pages/ChatPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import VoicePage from './pages/VoicePage';
import { useAuth } from './state/auth';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/chat' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><HistoryPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/voice" element={<RequireAuth><VoicePage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
