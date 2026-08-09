import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth.js'
import './PostForm.css'

function getImageName(imageUrl) {
  if (!imageUrl) {
    return ''
  }

  try {
    return decodeURIComponent(
      new URL(imageUrl, window.location.origin).pathname.split('/').pop(),
    )
  } catch {
    return '기존 이미지'
  }
}

function PostForm({
  heading,
  submitLabel,
  initialTitle = '',
  initialContent = '',
  existingImage = '',
  previewUser = null,
  error,
  isSubmitting,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(existingImage)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const { user } = useAuth()
  const currentUser = previewUser ?? user

  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()
  const isValid = trimmedTitle !== '' && trimmedContent !== ''
  const validationMessage =
    hasInteracted && !isValid ? '제목과 내용을 모두 작성해주세요.' : ''

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(existingImage)
      return undefined
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [existingImage, imageFile])

  useEffect(() => {
    if (!isPreviewOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeWithEscape = (event) => {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false)
      }
    }

    document.addEventListener('keydown', closeWithEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [isPreviewOpen])

  const handleSubmit = (event) => {
    event.preventDefault()
    setHasInteracted(true)

    if (!isValid || isSubmitting) {
      return
    }

    onSubmit({
      title: trimmedTitle,
      content: trimmedContent,
      imageFile,
    })
  }

  const handlePreviewOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      setIsPreviewOpen(false)
    }
  }

  return (
    <>
      <main className="post-form-page">
        <h1>{heading}</h1>

        <form className="post-form" noValidate onSubmit={handleSubmit}>
          <div className="post-form__field">
            <label htmlFor="post-title">제목*</label>
            <input
              type="text"
              id="post-title"
              value={title}
              maxLength={26}
              placeholder="제목을 입력해주세요 (최대 26자)"
              onChange={(event) => {
                setTitle(event.target.value)
                setHasInteracted(true)
              }}
            />
          </div>

          <div className="post-form__field">
            <label htmlFor="post-content">내용*</label>
            <textarea
              id="post-content"
              value={content}
              placeholder="내용을 입력해주세요"
              onChange={(event) => {
                setContent(event.target.value)
                setHasInteracted(true)
              }}
            />
          </div>

          <p className="post-form__helper" role={error ? 'alert' : undefined}>
            {error || validationMessage}
          </p>

          <div className="post-form__field">
            <label htmlFor="post-image">이미지</label>
            <div className="post-form__image-row">
              <input
                type="file"
                id="post-image"
                accept="image/jpeg,image/png"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] ?? null)
                }
              />
              <span>
                {imageFile?.name ||
                  getImageName(existingImage) ||
                  '파일을 선택해주세요.'}
              </span>
            </div>
          </div>

          <div className="post-form__buttons">
            <button
              className="post-form__preview-button"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
            >
              미리보기
            </button>
            <button
              className="post-form__submit-button"
              type="submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? '처리 중...' : submitLabel}
            </button>
          </div>
        </form>
      </main>

      {isPreviewOpen && (
        <div
          className="post-preview"
          onMouseDown={handlePreviewOverlayClick}
        >
          <section
            className="post-preview__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-preview-title"
          >
            <header>
              <span>미리보기</span>
              <button type="button" onClick={() => setIsPreviewOpen(false)}>
                닫기
              </button>
            </header>
            <div className="post-preview__body">
              <h2 id="post-preview-title">
                {trimmedTitle || '제목을 입력해주세요.'}
              </h2>
              <div className="post-preview__author">
                <span
                  className="post-preview__avatar"
                  style={
                    currentUser?.profile_image
                      ? {
                          backgroundImage: `url("${currentUser.profile_image}")`,
                        }
                      : undefined
                  }
                  aria-hidden="true"
                />
                <span>{currentUser?.nickname ?? '나'}</span>
              </div>
              <hr />
              {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="게시글 첨부 미리보기" />
              )}
              <p>{trimmedContent || '내용을 입력해주세요.'}</p>
              <div className="post-preview__stats">
                <div>
                  <strong>0</strong>
                  <span>잘했어요👏</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>조회수</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>칭찬</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default PostForm
