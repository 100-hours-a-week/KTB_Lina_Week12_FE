const ACCESS_TOKEN_KEY = 'accessToken'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export async function authorizedFetch(input, options = {}) {
  const token = getAccessToken()

  if (!token) {
    throw new Error('authentication_required')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(input, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearAccessToken()
    window.dispatchEvent(new Event('auth-expired'))
  }

  return response
}
