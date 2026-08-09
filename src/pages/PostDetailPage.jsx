import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteComment,
  deletePost,
  getInitialPost,
  getPost,
  saveComment,
  togglePostLike,
} from '../api/posts.js'
import CommentItem from '../components/CommentItem.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import useAuth from '../hooks/useAuth.js'
import {
  applyCommentChanged,
  applyCommentDeleted,
  applyLikeChanged,
} from '../realtime/postEventState.js'
import { subscribeToPostEvents } from '../realtime/postEvents.js'
import './PostDetailPage.css'

function formatCount(count) {
  const number = Number(count) || 0

  if (number >= 1000) {
    return `${Math.floor(number / 1000)}k`
  }

  return number
}

function isSameUser(authorId, currentUserId) {
  return (
    authorId != null &&
    currentUserId != null &&
    String(authorId) === String(currentUserId)
  )
}

function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const commentInputRef = useRef(null)
  const [post, setPost] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [modal, setModal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const refreshPost = useCallback(async () => {
    const nextPost = await getPost(postId)
    setPost(nextPost)
  }, [postId])

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setError('')

    getInitialPost(postId)
      .then((postResult) => {
        if (!isActive) {
          return
        }

        setPost(postResult)
      })
      .catch(() => {
        if (isActive) {
          setError('게시글을 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [postId])

  useEffect(
    () =>
      subscribeToPostEvents(postId, {
        onCommentCreated: (payload) => {
          setPost((currentPost) =>
            applyCommentChanged(currentPost, payload),
          )
        },
        onCommentUpdated: (payload) => {
          setPost((currentPost) =>
            applyCommentChanged(currentPost, payload),
          )
        },
        onCommentDeleted: (payload) => {
          setPost((currentPost) =>
            applyCommentDeleted(currentPost, payload),
          )
        },
        onLikeChanged: (payload) => {
          setPost((currentPost) =>
            applyLikeChanged(currentPost, payload),
          )
        },
      }),
    [postId],
  )

  const handleLike = async () => {
    if (isPending) {
      return
    }

    setIsPending(true)
    setActionError('')

    try {
      const result = await togglePostLike(postId)
      setPost((currentPost) => ({
        ...currentPost,
        liked: Boolean(result.liked),
        likesCount: result.likesCount,
      }))
    } catch (likeError) {
      setActionError(
        likeError.message === 'authentication_required'
          ? '로그인이 필요합니다.'
          : '좋아요 처리에 실패했습니다.',
      )
    } finally {
      setIsPending(false)
    }
  }

  const handleCommentEdit = (comment) => {
    setEditingCommentId(comment.commentId)
    setCommentText(comment.content)
    setActionError('')
    requestAnimationFrame(() => commentInputRef.current?.focus())
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    const content = commentText.trim()

    if (!content || isPending) {
      return
    }

    setIsPending(true)
    setActionError('')

    try {
      await saveComment({
        postId,
        commentId: editingCommentId,
        content,
      })
      setCommentText('')
      setEditingCommentId(null)
      await refreshPost()
    } catch (commentError) {
      setActionError(
        commentError.message === 'authentication_required'
          ? '로그인이 필요합니다.'
          : '댓글을 저장하지 못했습니다.',
      )
    } finally {
      setIsPending(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!modal || isPending) {
      return
    }

    setIsPending(true)
    setActionError('')

    try {
      if (modal.type === 'post') {
        await deletePost(postId)
        navigate('/posts', { replace: true })
        return
      }

      await deleteComment({
        postId,
        commentId: modal.commentId,
      })
      setModal(null)
      await refreshPost()
    } catch {
      setModal(null)
      setActionError('삭제하지 못했습니다.')
    } finally {
      setIsPending(false)
    }
  }

  if (isLoading) {
    return <p className="post-detail-page__status">게시글을 불러오는 중...</p>
  }

  if (error || !post) {
    return (
      <div className="post-detail-page__status" role="alert">
        <p>{error || '게시글을 찾을 수 없습니다.'}</p>
        <button type="button" onClick={() => navigate('/posts')}>
          목록으로 돌아가기
        </button>
      </div>
    )
  }

  const currentUserId = user?.user_id ?? null
  const canManagePost = isSameUser(post.author?.userId, currentUserId)

  return (
    <main className="post-detail-page">
      <section className="post-detail-page__header">
        <h1>{post.title}</h1>
        <div className="post-detail-page__header-row">
          <div className="post-detail-page__author">
            <span
              className="post-detail-page__avatar"
              style={
                post.author?.profileImage
                  ? {
                      backgroundImage: `url("${post.author.profileImage}")`,
                    }
                  : undefined
              }
              aria-hidden="true"
            />
            <span>{post.author?.nickname ?? '알 수 없음'}</span>
            <time>{post.createdAt}</time>
          </div>

          {canManagePost && (
            <div className="post-detail-page__actions">
              <Link to={`/posts/${postId}/edit`}>수정</Link>
              <button
                type="button"
                onClick={() => setModal({ type: 'post' })}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </section>

      <hr className="post-detail-page__divider" />

      {post.image && (
        <img
          className="post-detail-page__image"
          src={post.image}
          alt={`${post.title} 첨부 이미지`}
        />
      )}
      <p className="post-detail-page__content">{post.content}</p>

      <div className="post-detail-page__stats">
        <button
          className={post.liked ? 'is-liked' : undefined}
          type="button"
          onClick={handleLike}
          disabled={isPending}
          aria-pressed={Boolean(post.liked)}
        >
          <strong>{formatCount(post.likesCount)}</strong>
          <span>잘했어요👏</span>
        </button>
        <div>
          <strong>{formatCount(post.viewsCount)}</strong>
          <span>조회수</span>
        </div>
        <div>
          <strong>{formatCount(post.commentsCount)}</strong>
          <span>댓글</span>
        </div>
      </div>

      <hr className="post-detail-page__divider" />

      <form
        className="post-detail-page__comment-form"
        onSubmit={handleCommentSubmit}
      >
        <textarea
          ref={commentInputRef}
          value={commentText}
          placeholder="댓글을 남겨주세요!"
          aria-label="댓글"
          onChange={(event) => setCommentText(event.target.value)}
        />
        <div>
          <button
            type="submit"
            disabled={!commentText.trim() || isPending}
          >
            {editingCommentId == null ? '칭찬 등록' : '칭찬 수정'}
          </button>
        </div>
      </form>

      {actionError && (
        <p className="post-detail-page__error" role="alert">
          {actionError}
        </p>
      )}

      <section className="post-detail-page__comments" aria-label="댓글 목록">
        {post.comments?.map((comment) => (
          <CommentItem
            key={comment.commentId}
            comment={comment}
            canManage={isSameUser(
              comment.author?.userId,
              currentUserId,
            )}
            onEdit={handleCommentEdit}
            onDelete={(commentId) =>
              setModal({ type: 'comment', commentId })
            }
          />
        ))}
      </section>

      {modal && (
        <ConfirmModal
          title={
            modal.type === 'post'
              ? '게시글을 삭제하시겠습니까?'
              : '댓글을 삭제하시겠습니까?'
          }
          description="삭제한 내용은 복구할 수 없습니다."
          isPending={isPending}
          onCancel={() => setModal(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </main>
  )
}

export default PostDetailPage
