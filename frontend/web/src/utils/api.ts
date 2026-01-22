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

type ChatRequest = {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  conversationId?: string;
  model?: string;
  temperature?: number;
  userContext?: { beliefs?: string[]; interests?: string[] };
};

type ChatResponse = {
  message: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, unknown>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ACCESS_TOKEN_KEY = 'serein_access_token';
const REFRESH_TOKEN_KEY = 'serein_refresh_token';

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event('serein:auth-updated'));
};

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = (await response.json()) as { accessToken?: string };
  if (!data.accessToken) {
    clearTokens();
    return false;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  window.dispatchEvent(new Event('serein:auth-updated'));
  return true;
};

const buildHeaders = (init?: RequestInit): Record<string, string> => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

export const authFetch = async (
  path: string,
  init?: RequestInit,
  retry = true
): Promise<Response> => {
  const headers = buildHeaders(init);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return authFetch(path, init, false);
    }
  }

  return response;
};

const request = async <T>(path: string, init?: RequestInit, retry = true): Promise<T> => {
  const response = await authFetch(path, init, retry);

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
  chat: (payload: ChatRequest) =>
    request<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
