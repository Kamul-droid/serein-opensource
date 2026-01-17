export type ClientConfig = {
  baseUrl: string;
  accessToken?: string;
};

export type AuthResponse = {
  user: { id: string; email: string; name?: string };
  accessToken: string;
  refreshToken: string;
};

export class SereinClient {
  private baseUrl: string;
  private accessToken?: string;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
  }

  setAccessToken(token?: string) {
    this.accessToken = token;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    };
    if (this.accessToken) {
      headers.authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
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
  }

  register(payload: { email: string; password: string; name?: string }) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  login(payload: { email: string; password: string }) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  logout(refreshToken: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  getProfile() {
    return this.request('/users/me');
  }

  updateProfile(payload: { name?: string; bio?: string }) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  getBeliefs() {
    return this.request('/users/me/beliefs');
  }

  updateBeliefs(payload: { beliefs: string[] }) {
    return this.request('/users/me/beliefs', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  getConversations() {
    return this.request('/conversations');
  }

  createConversation(payload: { title?: string }) {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getMessages(conversationId: string) {
    return this.request(`/conversations/${conversationId}/messages`);
  }

  sendMessage(conversationId: string, payload: { role: string; content: string }) {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  listVoices() {
    return this.request('/voice/voices');
  }

  searchContent(payload: { query: string }) {
    return this.request('/content/search', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
