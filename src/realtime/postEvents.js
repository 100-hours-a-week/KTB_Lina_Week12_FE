import { API_BASE_URL } from '../config/api.js'

function addJsonEventListener(eventSource, eventName, handler) {
  eventSource.addEventListener(eventName, (event) => {
    try {
      handler(JSON.parse(event.data))
    } catch {
      // 잘못된 단일 이벤트는 무시하고 SSE 연결은 유지한다.
    }
  })
}

export function subscribeToPostEvents(
  postId,
  {
    onCommentCreated,
    onCommentUpdated,
    onCommentDeleted,
    onLikeChanged,
  },
) {
  const eventSource = new EventSource(
    `${API_BASE_URL}/posts/${encodeURIComponent(postId)}/events`,
  )

  addJsonEventListener(
    eventSource,
    'comment-created',
    onCommentCreated,
  )
  addJsonEventListener(
    eventSource,
    'comment-updated',
    onCommentUpdated,
  )
  addJsonEventListener(
    eventSource,
    'comment-deleted',
    onCommentDeleted,
  )
  addJsonEventListener(eventSource, 'like-changed', onLikeChanged)

  return () => eventSource.close()
}
