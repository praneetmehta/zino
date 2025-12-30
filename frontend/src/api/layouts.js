/**
 * Layouts API
 * Handles saving/loading custom layouts
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

export async function listCustomLayouts() {
  const data = await request('/layouts/custom')
  return data.layouts || []
}

export async function saveCustomLayout(layout) {
  return await request('/layouts/custom', {
    method: 'POST',
    body: JSON.stringify(layout),
  })
}

export async function deleteCustomLayout(id) {
  await request(`/layouts/custom/${id}`, { method: 'DELETE' })
}
