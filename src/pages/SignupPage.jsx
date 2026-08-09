import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthHeader from '../components/AuthHeader.jsx'
import { API_BASE_URL } from '../config/api.js'
import './SignupPage.css'

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,20}$/

function validateForm({ email, nickname, password, passwordConfirm }) {
  const errors = {}

  if (!email) {
    errors.email = '이메일을 입력해주세요.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email =
      '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
  }

  if (!password) {
    errors.password = '비밀번호를 입력해주세요.'
  } else if (!PASSWORD_PATTERN.test(password)) {
    errors.password =
      '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = '비밀번호를 한번 더 입력해주세요.'
  } else if (passwordConfirm !== password) {
    errors.passwordConfirm = '비밀번호가 다릅니다.'
  }

  if (!nickname) {
    errors.nickname = '닉네임을 입력해주세요.'
  } else if (nickname.includes(' ')) {
    errors.nickname = '띄어쓰기를 없애주세요.'
  } else if (nickname.length > 10) {
    errors.nickname = '닉네임은 최대 10자까지 작성 가능합니다.'
  }

  return errors
}

function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [hasInteracted, setHasInteracted] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const values = {
    email: email.trim(),
    password: password.trim(),
    passwordConfirm: passwordConfirm.trim(),
    nickname: nickname.trim(),
  }
  const validationErrors = validateForm(values)
  const isValid = Object.keys(validationErrors).length === 0

  const getError = (field) => {
    if (serverErrors[field]) {
      return serverErrors[field]
    }

    return hasInteracted ? validationErrors[field] ?? '' : ''
  }

  const updateField = (setter, serverErrorField) => (event) => {
    setter(event.target.value)
    setHasInteracted(true)
    setServerErrors((errors) => ({
      ...errors,
      [serverErrorField]: '',
      form: '',
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setHasInteracted(true)

    if (!isValid || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setServerErrors({})

    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          nickname: values.nickname,
        }),
      })
      const result = await response.json()

      if (response.ok) {
        navigate('/login', { replace: true })
        return
      }

      if (result.message === 'duplicate_email') {
        setServerErrors({ email: '중복된 이메일입니다.' })
      } else if (result.message === 'duplicate_nickname') {
        setServerErrors({ nickname: '중복된 닉네임입니다.' })
      } else {
        setServerErrors({ form: '회원가입에 실패했습니다.' })
      }
    } catch {
      setServerErrors({ form: '서버와 통신에 실패했습니다.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="signup-page">
      <AuthHeader backTo="/login" />
      <main className="signup-page__content">
        <h1 className="signup-page__title">회원가입</h1>

        <form
          className="signup-page__form"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="signup-page__field">
            <label htmlFor="email">이메일*</label>
            <input
              type="email"
              id="email"
              value={email}
              placeholder="이메일을 입력하세요"
              autoComplete="email"
              onChange={updateField(setEmail, 'email')}
            />
            <p className="signup-page__helper">{getError('email')}</p>
          </div>

          <div className="signup-page__field">
            <label htmlFor="password">비밀번호*</label>
            <input
              type="password"
              id="password"
              value={password}
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
              onChange={updateField(setPassword, 'password')}
            />
            <p className="signup-page__helper">{getError('password')}</p>
          </div>

          <div className="signup-page__field">
            <label htmlFor="password-confirm">비밀번호 확인*</label>
            <input
              type="password"
              id="password-confirm"
              value={passwordConfirm}
              placeholder="비밀번호를 한번 더 입력하세요"
              autoComplete="new-password"
              onChange={updateField(setPasswordConfirm, 'passwordConfirm')}
            />
            <p className="signup-page__helper">
              {getError('passwordConfirm')}
            </p>
          </div>

          <div className="signup-page__field">
            <label htmlFor="nickname">닉네임*</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              maxLength={11}
              placeholder="닉네임을 입력하세요"
              onChange={updateField(setNickname, 'nickname')}
            />
            <p className="signup-page__helper">{getError('nickname')}</p>
          </div>

          <p className="signup-page__form-error" aria-live="polite">
            {serverErrors.form ?? ''}
          </p>

          <button
            className="signup-page__submit"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <Link className="signup-page__login-link" to="/login">
          로그인하러 가기
        </Link>
      </main>
    </div>
  )
}

export default SignupPage
