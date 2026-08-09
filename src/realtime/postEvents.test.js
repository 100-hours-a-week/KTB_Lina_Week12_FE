import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyCommentChanged,
  applyCommentDeleted,
} from './postEventState.js'

const initialPost = {
  postId: 1,
  commentsCount: 1,
  comments: [
    {
      commentId: 10,
      content: '기존 댓글',
    },
  ],
}

test('새 댓글 이벤트를 목록에 추가한다', () => {
  const nextPost = applyCommentChanged(initialPost, {
    comment: {
      commentId: 11,
      content: '새 댓글',
    },
    commentsCount: 2,
  })

  assert.equal(nextPost.comments.length, 2)
  assert.equal(nextPost.comments[1].content, '새 댓글')
  assert.equal(nextPost.commentsCount, 2)
})

test('같은 댓글 이벤트가 다시 오면 중복 추가하지 않고 교체한다', () => {
  const nextPost = applyCommentChanged(initialPost, {
    comment: {
      commentId: '10',
      content: '수정된 댓글',
    },
    commentsCount: 1,
  })

  assert.equal(nextPost.comments.length, 1)
  assert.equal(nextPost.comments[0].content, '수정된 댓글')
})

test('삭제 이벤트의 댓글만 목록에서 제거한다', () => {
  const nextPost = applyCommentDeleted(initialPost, {
    commentId: '10',
    commentsCount: 0,
  })

  assert.deepEqual(nextPost.comments, [])
  assert.equal(nextPost.commentsCount, 0)
})
