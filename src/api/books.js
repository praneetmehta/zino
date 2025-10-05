const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4876'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
  const data = await request('/books')
  return data.books
}

export async function getBook(id) {
  const data = await request(`/books/${id}`)
  return data.book
}

export async function saveBook(payload) {
  const data = await request('/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.book
}

export async function deleteBook(id) {
  await request(`/books/${id}`, { method: 'DELETE' })
}

export async function getHealth() {
  return request('/health')
}
