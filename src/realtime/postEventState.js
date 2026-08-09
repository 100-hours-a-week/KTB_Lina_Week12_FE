function sameId(left, right) {
  return String(left) === String(right)
}

function nextCommentsCount(currentPost, payload) {
  return Number.isInteger(payload?.commentsCount)
    ? payload.commentsCount
    : currentPost.commentsCount
}

export function applyCommentChanged(currentPost, payload) {
  const comment = payload?.comment

  if (!currentPost || comment?.commentId == null) {
    return currentPost
  }

  const currentComments = Array.isArray(currentPost.comments)
    ? currentPost.comments
    : []
  const commentIndex = currentComments.findIndex((currentComment) =>
    sameId(currentComment.commentId, comment.commentId),
  )
  const comments = [...currentComments]

  if (commentIndex === -1) {
    comments.push(comment)
  } else {
    comments[commentIndex] = comment
  }

  return {
    ...currentPost,
    comments,
    commentsCount: nextCommentsCount(currentPost, payload),
  }
}

export function applyCommentDeleted(currentPost, payload) {
  if (!currentPost || payload?.commentId == null) {
    return currentPost
  }

  const currentComments = Array.isArray(currentPost.comments)
    ? currentPost.comments
    : []

  return {
    ...currentPost,
    comments: currentComments.filter(
      (comment) => !sameId(comment.commentId, payload.commentId),
    ),
    commentsCount: nextCommentsCount(currentPost, payload),
  }
}

export function applyLikeChanged(currentPost, payload) {
  if (
    !currentPost ||
    !Number.isInteger(payload?.likesCount) ||
    payload.likesCount < 0
  ) {
    return currentPost
  }

  return {
    ...currentPost,
    likesCount: payload.likesCount,
  }
}
