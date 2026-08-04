import { API_BASE_URL } from '../config/api.js'
import { authorizedFetch } from './client.js'

const initialPostRequests = new Map()

export async function getPosts({ page, limit = 10 }) {
  const response = await fetch(
    `${API_BASE_URL}/posts?page=${page}&limit=${limit}`,
  )

  if (!response.ok) {
    throw new Error(`posts_fetch_failed:${response.status}`)
  }

  const result = await response.json()
  const posts = result?.data?.posts

  if (!Array.isArray(posts)) {
    throw new Error('posts_response_invalid')
  }

  return {
    posts,
    hasNext: Boolean(result.data.hasNext),
  }
}

export async function getPost(postId) {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`)

  if (!response.ok) {
    throw new Error(`post_fetch_failed:${response.status}`)
  }

  const result = await response.json()

  if (!result?.data) {
    throw new Error('post_response_invalid')
  }

  return result.data
}

export function getInitialPost(postId) {
  if (!initialPostRequests.has(postId)) {
    const request = getPost(postId).finally(() => {
      initialPostRequests.delete(postId)
    })
    initialPostRequests.set(postId, request)
  }

  return initialPostRequests.get(postId)
}

export async function createPost({ title, content, image }) {
  const response = await authorizedFetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content,
      image,
    }),
  })
  const result = await response.json()
  const postId = result?.data?.post_id ?? result?.data?.postId

  if (!response.ok || postId == null) {
    throw new Error(`post_create_failed:${response.status}`)
  }

  return postId
}

export async function updatePost(postId, { title, content, image }) {
  const response = await authorizedFetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content,
      image,
    }),
  })

  if (!response.ok) {
    throw new Error(`post_update_failed:${response.status}`)
  }
}

export async function togglePostLike(postId) {
  const response = await authorizedFetch(
    `${API_BASE_URL}/posts/${postId}/likes`,
    {
    method: 'POST',
    },
  )
  const result = await response.json()

  if (!response.ok || !result?.data) {
    throw new Error(`post_like_failed:${response.status}`)
  }

  return result.data
}

export async function deletePost(postId) {
  const response = await authorizedFetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`post_delete_failed:${response.status}`)
  }
}

export async function saveComment({ postId, commentId, content }) {
  const isEditing = commentId != null
  const url = isEditing
    ? `${API_BASE_URL}/posts/${postId}/comments/${commentId}`
    : `${API_BASE_URL}/posts/${postId}/comments`
  const response = await authorizedFetch(url, {
    method: isEditing ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    throw new Error(`comment_save_failed:${response.status}`)
  }
}

export async function deleteComment({ postId, commentId }) {
  const response = await authorizedFetch(
    `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(`comment_delete_failed:${response.status}`)
  }
}
