type AuthResponse = {
  user: { id: string; email: string; name?: string };
  accessToken: string;
  refreshToken: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

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
    const message = await response.text();
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
  getProfile: () => request('/users/me'),
  updateProfile: (payload: { name?: string; bio?: string }) =>
    request('/users/me', { method: 'PUT', body: JSON.stringify(payload) }),
  getPreferences: () => request('/users/me/preferences'),
  updatePreferences: (payload: { voiceGender?: string; communicationMode?: string }) =>
    request('/users/me/preferences', { method: 'PUT', body: JSON.stringify(payload) }),
  getBeliefs: () => request('/users/me/beliefs'),
  updateBeliefs: (payload: { beliefs: string[] }) =>
    request('/users/me/beliefs', { method: 'PUT', body: JSON.stringify(payload) }),
  getConversations: () => request('/conversations'),
  createConversation: (payload: { title?: string }) =>
    request('/conversations', { method: 'POST', body: JSON.stringify(payload) }),
  getMessages: (conversationId: string) => request(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, payload: { role: string; content: string }) =>
    request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  searchContent: (payload: { query: string }) =>
    request('/content/search', { method: 'POST', body: JSON.stringify(payload) }),
  getRecommendations: (payload: { beliefs: string[] }) =>
    request('/content/recommendations', { method: 'POST', body: JSON.stringify(payload) }),
  listVoices: () => request('/voice/voices'),
};
