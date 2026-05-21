export function buildQuery(values: Record<string, unknown>) {
  const params = new URLSearchParams()

  Object.entries(values).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null) {
      return
    }

    const value = Array.isArray(rawValue) ? rawValue.join(',') : String(rawValue).trim()
    if (!value) {
      return
    }

    params.set(key, value)
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}
