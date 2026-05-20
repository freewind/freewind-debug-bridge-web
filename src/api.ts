type FetchJSONInit = RequestInit & {
  baseURL?: string
}

function normalizeBaseURL(baseURL?: string): string {
  return (baseURL || '').trim().replace(/\/+$/, '')
}

function buildRequestURL(path: string, baseURL?: string): string {
  if (/^[a-z]+:\/\//i.test(path)) {
    return path
  }

  const normalizedBaseURL = normalizeBaseURL(baseURL)
  if (!normalizedBaseURL) {
    return path
  }

  return `${normalizedBaseURL}${path.startsWith('/') ? path : `/${path}`}`
}

export async function fetchJSON<T>(path: string, init?: FetchJSONInit): Promise<T> {
  const { baseURL, ...requestInit } = init || {}
  const response = await fetch(buildRequestURL(path, baseURL), requestInit)
  const data = await response.json()
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'request failed'
    throw new Error(message)
  }
  return data as T
}

export function buildQuery(values: Record<string, unknown>): string {
  const params = new URLSearchParams()

  Object.entries(values).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null) {
      return
    }
    const value = String(rawValue).trim()
    if (!value) {
      return
    }
    params.set(key, value)
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function prettyJSON(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
