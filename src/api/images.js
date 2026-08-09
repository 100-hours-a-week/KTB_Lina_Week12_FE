import { API_BASE_URL } from '../config/api.js'
import { authorizedFetch } from './client.js'

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await authorizedFetch(`${API_BASE_URL}/images`, {
    method: 'POST',
    body: formData,
  })
  const result = await response.json()
  const imageUrl = result?.data?.url

  if (!response.ok || !imageUrl) {
    throw new Error('image_upload_failed')
  }

  return imageUrl
}
