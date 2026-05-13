const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

function formatError(data, status) {
  if (typeof data?.detail === 'string') return data.detail
  if (Array.isArray(data?.detail)) return data.detail.map((e) => e.msg || JSON.stringify(e)).join(', ')
  if (data?.detail && typeof data.detail === 'object') return JSON.stringify(data.detail)
  return `HTTP ${status}`
}

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      credentials: 'include',
      headers: {
        ...options.headers,
      },
      ...options,
    }

    if (!options.skipJsonHeaders && !(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    if (endpoint.startsWith('/auth/')) {
      config.headers['X-Client-Type'] = 'web'
    }

    let response = await fetch(url, config)
    let data = {}
    try {
      data = await response.json()
    } catch {
      data = {}
    }

    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      try {
        const refreshResponse = await this.refreshToken()
        localStorage.setItem('access_token', refreshResponse.access_token)
        config.headers['Authorization'] = `Bearer ${refreshResponse.access_token}`
        response = await fetch(url, config)
        try {
          data = await response.json()
        } catch {
          data = {}
        }
      } catch {
        localStorage.removeItem('access_token')
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/signup'
        }
        throw new Error('Сессия истекла')
      }
    }

    if (!response.ok) {
      throw new Error(formatError(data, response.status))
    }

    return data
  }

  async register(email, password, fullName) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName || null }),
    })
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' })
  }

  async refreshToken() {
    return this.request('/auth/refresh', { method: 'POST' })
  }

  async getMe() {
    return this.request('/auth/me')
  }

  async listNotes() {
    return this.request('/content/notes')
  }

  async getNote(noteId) {
    return this.request(`/content/notes/${noteId}`)
  }

  async uploadPdf(file) {
    const formData = new FormData()
    formData.append('file', file)
    const token = localStorage.getItem('access_token')
    const url = `${this.baseURL}/content/upload-pdf`
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) {
      try {
        const refreshResponse = await this.refreshToken()
        localStorage.setItem('access_token', refreshResponse.access_token)
        const retry = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { Authorization: `Bearer ${refreshResponse.access_token}` },
          body: formData,
        })
        const retryData = await retry.json().catch(() => ({}))
        if (!retry.ok) throw new Error(formatError(retryData, retry.status))
        return retryData
      } catch {
        localStorage.removeItem('access_token')
        window.location.href = '/signup'
        throw new Error('Требуется вход')
      }
    }
    if (!response.ok) throw new Error(formatError(data, response.status))
    return data
  }

  async deleteNote(noteId) {
    const url = `${this.baseURL}/content/notes/${noteId}`
    const token = localStorage.getItem('access_token')
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (response.status === 401) {
      await this.refreshToken().catch(() => null)
    }
    if (response.status === 204) return
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(formatError(data, response.status))
  }
}

export default new ApiClient()
