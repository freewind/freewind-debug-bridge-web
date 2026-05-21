export function normalizeAPIBaseURL(value?: string) {
  return (value || '').trim().replace(/\/+$/, '')
}
