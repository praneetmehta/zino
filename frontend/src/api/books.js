/**
 * Books API
 * Handles saving/loading book projects - all storage logic is on backend
 */
import env from '@/config/env.js'

const API_BASE_URL = env.apiUrl
function getAuthHeaders() {
  const authData = localStorage.getItem('ziner_auth')
  if (authData) {
    try {
      const { token } = JSON.parse(authData)
      if (token) {
        return { 'Authorization': `Bearer ${token}` }
      }
    } catch (e) {
      console.error('Failed to parse auth data:', e)
    }
  }
  return {}
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    ...options,
  })

  if (!res.ok) {
    const message = await res.text().catch(() => '')
    throw new Error(message || `Request failed with status ${res.status}`)
  }

  if (res.status === 204) {
    return null
  }

  return res.json()
}

export async function listBooks() {
  // No userId parameter - backend derives from JWT token
  return await request('/books')
}

export async function getBook(id) {
  return await request(`/books/${id}`)
}

export async function saveBook(payload) {
  return await request('/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteBook(id) {
  await request(`/books/${id}`, { method: 'DELETE' })
}

export async function getHealth() {
  return request('/health')
}
