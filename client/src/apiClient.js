// API client utility for communicating with the SynthNote backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // For web client, add X-Client-Type header for auth endpoints
    if (endpoint.startsWith('/auth/')) {
      config.headers['X-Client-Type'] = 'web';
    }

    let response = await fetch(url, config);
    let data = await response.json();

    // If unauthorized and not auth endpoint, try to refresh token
    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      try {
        const refreshResponse = await this.refreshToken();
        localStorage.setItem('access_token', refreshResponse.access_token);
        // Retry the original request with new token
        config.headers['Authorization'] = `Bearer ${refreshResponse.access_token}`;
        response = await fetch(url, config);
        data = await response.json();
      } catch {
        // Refresh failed, logout
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Auth endpoints
  async register(email, password, fullName) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/users/me');
  }

  async updateUserProfile(updates) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export default new ApiClient();