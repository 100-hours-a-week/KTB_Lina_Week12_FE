import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { uploadImage } from '../api/images.js'
import { getInitialPost, updatePost } from '../api/posts.js'
import PostForm from '../components/PostForm.jsx'
import useAuth from '../hooks/useAuth.js'
import './PostEditPage.css'

function isSameUser(authorId, currentUserId) {
  return (
    authorId != null &&
    currentUserId != null &&
    String(authorId) === String(currentUserId)
  )
}

function PostEditPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setError('')

    getInitialPost(postId)
      .then((postResult) => {
        if (!isActive) {
          return
        }

        if (!isSameUser(postResult.author?.userId, user.user_id)) {
          setError('게시글 수정 권한이 없습니다.')
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
  }, [postId, user])

  const handleSubmit = async ({ title, content, imageFile }) => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const image = imageFile ? await uploadImage(imageFile) : post.image
      await updatePost(postId, {
        title,
        content,
        image: image ?? null,
      })
      navigate(`/posts/${postId}`, { replace: true })
    } catch (submitError) {
      setError(
        submitError.message === 'authentication_required'
          ? '로그인이 필요합니다.'
          : '게시글을 수정하지 못했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="post-edit-page__status">게시글을 불러오는 중...</p>
  }

  if (error && !post) {
    return (
      <div className="post-edit-page__status" role="alert">
        <p>{error}</p>
        <button type="button" onClick={() => navigate(`/posts/${postId}`)}>
          상세 화면으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <PostForm
      heading="자랑 수정"
      submitLabel="수정하기"
      initialTitle={post.title}
      initialContent={post.content}
      existingImage={post.image ?? ''}
      previewUser={user}
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  )
}

export default PostEditPage
