type AuthResponse = {
  user: { id: string; email: string; name?: string };
  accessToken: string;
  refreshToken: string;
};

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

type Profile = {
  id?: string;
  userId?: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  beliefs?: string[];
  interests?: string[];
};

type Preferences = {
  id?: string;
  userId?: string;
  voiceGender?: 'male' | 'female';
  voiceId?: string;
  communicationMode?: 'text' | 'voice' | 'both';
};

type VoiceList = {
  voices?: Array<{ id: string; name: string }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getAccessToken = () => localStorage.getItem('serein_access_token');

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const raw = await response.text();
    let message = raw;
    if (contentType.includes('application/json')) {
      try {
        const parsed = JSON.parse(raw) as { error?: string; message?: string };
        message = parsed.error || parsed.message || raw;
      } catch (err) {
        message = raw;
      }
    } else if (raw.trim().startsWith('<html')) {
      message = 'API gateway not reachable. Check VITE_API_BASE_URL and Nginx.';
    }
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};

export const api = {
  register: (payload: { email: string; password: string; name?: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: (refreshToken: string) =>
    request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  getProfile: () => request<Profile>('/users/me'),
  updateProfile: (payload: { name?: string; bio?: string }) =>
    request<Profile>('/users/me', { method: 'PUT', body: JSON.stringify(payload) }),
  getPreferences: () => request<Preferences>('/users/me/preferences'),
  updatePreferences: (payload: { voiceGender?: string; communicationMode?: string }) =>
    request<Preferences>('/users/me/preferences', { method: 'PUT', body: JSON.stringify(payload) }),
  getBeliefs: () => request<{ beliefs: string[] }>('/users/me/beliefs'),
  updateBeliefs: (payload: { beliefs: string[] }) =>
    request<{ beliefs: string[] }>('/users/me/beliefs', { method: 'PUT', body: JSON.stringify(payload) }),
  getConversations: () => request<Conversation[]>('/conversations'),
  createConversation: (payload: { title?: string }) =>
    request<Conversation>('/conversations', { method: 'POST', body: JSON.stringify(payload) }),
  getMessages: (conversationId: string) =>
    request<Message[]>(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, payload: { role: string; content: string }) =>
    request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  searchContent: (payload: { query: string }) =>
    request<{ items: unknown[] }>('/content/search', { method: 'POST', body: JSON.stringify(payload) }),
  getRecommendations: (payload: { beliefs: string[] }) =>
    request<{ items: unknown[] }>('/content/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listVoices: () => request<VoiceList>('/voice/voices'),
};
