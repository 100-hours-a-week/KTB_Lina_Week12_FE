import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthHeader from '../components/AuthHeader.jsx'
import { API_BASE_URL } from '../config/api.js'
import useAuth from '../hooks/useAuth.js'
import './LoginPage.css'

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,20}$/

function getValidationMessage(email, password) {
  if (!email) {
    return '이메일을 입력해주세요.'
  }

  if (!EMAIL_PATTERN.test(email)) {
    return '올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)'
  }

  if (!password) {
    return '비밀번호를 입력해주세요.'
  }

  if (!PASSWORD_PATTERN.test(password)) {
    return '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
  }

  return ''
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hasInteracted, setHasInteracted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  const trimmedEmail = email.trim()
  const trimmedPassword = password.trim()
  const validationMessage = getValidationMessage(
    trimmedEmail,
    trimmedPassword,
  )
  const isValid = validationMessage === ''
  const helperMessage =
    serverError || (hasInteracted ? validationMessage : '')

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
    setHasInteracted(true)
    setServerError('')
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    setHasInteracted(true)
    setServerError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setHasInteracted(true)

    if (!isValid || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      })
      const result = await response.json()

      if (response.ok && result.message === 'login_success') {
        const user = await signIn(result.data.accessToken)

        if (!user) {
          setServerError('로그인 상태를 확인하지 못했습니다.')
          return
        }

        const from = location.state?.from
        const returnPath = from?.pathname
          ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
          : '/posts'
        navigate(returnPath, { replace: true })
        return
      }

      setServerError('아이디 또는 비밀번호를 확인해주세요.')
    } catch {
      setServerError('서버와 통신에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <AuthHeader />
      <main className="login-page__content">
        <h1 className="login-page__title">로그인</h1>

        <form
          className="login-page__form"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="login-page__field">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="이메일을 입력하세요"
              autoComplete="email"
              onChange={handleEmailChange}
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              onChange={handlePasswordChange}
            />
          </div>

          <p className="login-page__helper" aria-live="polite">
            {helperMessage}
          </p>

          <button
            className="login-page__submit"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <Link className="login-page__signup" to="/signup">
          회원가입
        </Link>
      </main>
    </div>
  )
}

export default LoginPage
