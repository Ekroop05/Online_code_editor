const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const rawWsBaseUrl = import.meta.env.VITE_WS_BASE_URL?.trim()

function normalizeBaseUrl(value) {
  if (!value) {
    return ''
  }

  return value.replace(/\/+$/, '')
}

export const apiBaseUrl = normalizeBaseUrl(rawApiBaseUrl)

export function buildApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  if (!apiBaseUrl) {
    return path
  }

  return `${apiBaseUrl}${path}`
}

export function buildWebSocketUrl(path) {
  if (rawWsBaseUrl) {
    return `${normalizeBaseUrl(rawWsBaseUrl)}${path}`
  }

  if (apiBaseUrl) {
    const wsBaseUrl = apiBaseUrl.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:')
    return `${wsBaseUrl}${path}`
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}${path}`
}
