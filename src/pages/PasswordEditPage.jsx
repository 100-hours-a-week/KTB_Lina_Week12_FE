import { useEffect, useState } from 'react'
import { updatePassword } from '../api/users.js'
import './PasswordEditPage.css'

const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,20}$/

function validatePassword(password) {
  if (!password) {
    return '비밀번호를 입력해주세요.'
  }

  if (!PASSWORD_PATTERN.test(password)) {
    return '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
  }

  return ''
}

function validatePasswordConfirm(password, passwordConfirm) {
  if (!passwordConfirm) {
    return '비밀번호를 한번 더 입력해주세요.'
  }

  if (passwordConfirm !== password) {
    return '비밀번호가 다릅니다.'
  }

  return ''
}

function PasswordEditPage() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [error, setError] = useState('')

  const trimmedPassword = password.trim()
  const trimmedPasswordConfirm = passwordConfirm.trim()
  const passwordError = validatePassword(trimmedPassword)
  const passwordConfirmError = validatePasswordConfirm(
    trimmedPassword,
    trimmedPasswordConfirm,
  )
  const isValid = !passwordError && !passwordConfirmError

  useEffect(() => {
    if (!isToastVisible) {
      return undefined
    }

    const timer = window.setTimeout(() => setIsToastVisible(false), 2000)
    return () => window.clearTimeout(timer)
  }, [isToastVisible])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setHasInteracted(true)

    if (!isValid || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await updatePassword(trimmedPassword)
      setPassword('')
      setPasswordConfirm('')
      setHasInteracted(false)
      setIsToastVisible(true)
    } catch (submitError) {
      setError(
        submitError.message === 'authentication_required'
          ? '로그인이 필요합니다.'
          : '비밀번호를 수정하지 못했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    setHasInteracted(true)
    setError('')
  }

  const handlePasswordConfirmChange = (event) => {
    setPasswordConfirm(event.target.value)
    setHasInteracted(true)
    setError('')
  }

  return (
    <main className="password-edit-page">
      <h1>비밀번호 수정</h1>

      <form noValidate onSubmit={handleSubmit}>
        <div className="password-edit-page__field">
          <label htmlFor="new-password">비밀번호</label>
          <input
            type="password"
            id="new-password"
            value={password}
            placeholder="비밀번호를 입력하세요"
            autoComplete="new-password"
            onChange={handlePasswordChange}
          />
          <p>{hasInteracted ? passwordError : ''}</p>
        </div>

        <div className="password-edit-page__field">
          <label htmlFor="new-password-confirm">비밀번호 확인</label>
          <input
            type="password"
            id="new-password-confirm"
            value={passwordConfirm}
            placeholder="비밀번호를 한번 더 입력하세요"
            autoComplete="new-password"
            onChange={handlePasswordConfirmChange}
          />
          <p>{hasInteracted ? passwordConfirmError : ''}</p>
        </div>

        <p className="password-edit-page__error" role="alert">
          {error}
        </p>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? '수정 중...' : '수정하기'}
        </button>
      </form>

      <div
        className={`password-edit-page__toast${
          isToastVisible ? ' is-visible' : ''
        }`}
        role="status"
      >
        수정완료
      </div>
    </main>
  )
}

export default PasswordEditPage
