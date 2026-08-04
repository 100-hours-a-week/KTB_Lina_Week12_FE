import { API_BASE_URL } from '../config/api.js'
import { authorizedFetch, getAccessToken } from './client.js'

export async function getCurrentUser({ signal } = {}) {
  const token = getAccessToken()

  if (!token) {
    return null
  }

  const response = await authorizedFetch(`${API_BASE_URL}/users/me`, {
    signal,
  })

  if (!response.ok) {
    return null
  }

  const result = await response.json()
  return result?.data ?? null
}

export async function updateProfile({ nickname, profileImage }) {
  const response = await authorizedFetch(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nickname,
      profile_image: profileImage,
    }),
  })
  const result = await response.json()

  if (!response.ok) {
    const error = new Error(`profile_update_failed:${response.status}`)
    error.code = result?.message
    throw error
  }

  return result?.data ?? null
}

export async function withdrawUser() {
  const response = await authorizedFetch(`${API_BASE_URL}/users`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`user_withdraw_failed:${response.status}`)
  }
}

export async function updatePassword(password) {
  const response = await authorizedFetch(`${API_BASE_URL}/users/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    throw new Error(`password_update_failed:${response.status}`)
  }
}
