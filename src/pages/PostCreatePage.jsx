import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadImage } from '../api/images.js'
import { createPost } from '../api/posts.js'
import PostForm from '../components/PostForm.jsx'

function PostCreatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async ({ title, content, imageFile }) => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const image = imageFile ? await uploadImage(imageFile) : null
      const postId = await createPost({ title, content, image })
      navigate(`/posts/${postId}`, { replace: true })
    } catch (submitError) {
      setError(
        submitError.message === 'authentication_required'
          ? '로그인이 필요합니다.'
          : '게시글을 등록하지 못했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PostForm
      heading="자랑하기"
      submitLabel="완료"
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  )
}

export default PostCreatePage
