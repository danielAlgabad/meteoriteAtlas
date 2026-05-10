const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, params = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      searchParams.set(k, String(v))
    }
  })
  const query = searchParams.toString()
  const url = `${BASE}${path}${query ? `?${query}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json()
}

export function fetchMeteorities(params = {}) {
  return request('/meteorites', params)
}

export function fetchMeteoriteById(id) {
  return request(`/meteorites/${id}`)
}

export function fetchStats() {
  return request('/meteorites/stats')
}

export function searchMeteorities(q, limit = 20) {
  return request('/meteorites/search', { q, limit })
}
