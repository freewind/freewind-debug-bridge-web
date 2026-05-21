import { normalizeAPIBaseURL } from './normalizeAPIBaseURL'

export function readInitialAPIBaseURL() {
  if (typeof window === 'undefined') {
    return ''
  }

  return normalizeAPIBaseURL(window.localStorage.getItem('freewind-debug-bridge-web/api-base-url') || '')
}
