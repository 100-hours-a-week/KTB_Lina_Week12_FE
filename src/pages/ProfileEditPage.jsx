import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadImage } from '../api/images.js'
import { updateProfile, withdrawUser } from '../api/users.js'
import ConfirmModal from '../components/ConfirmModal.jsx'
import useAuth from '../hooks/useAuth.js'
import './ProfileEditPage.css'

function validateNickname(nickname) {
  if (!nickname) {
    return '닉네임을 입력해주세요.'
  }

  if (nickname.length > 10) {
    return '닉네임은 최대 10자까지 작성 가능합니다.'
  }

  return ''
}

function ProfileEditPage() {
  const navigate = useNavigate()
  const { signOut, updateUser, user } = useAuth()
  const [profile, setProfile] = useState(user)
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [profileFile, setProfileFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user?.profile_image ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [error, setError] = useState('')

  const trimmedNickname = nickname.trim()
  const nicknameError = validateNickname(trimmedNickname)

  useEffect(() => {
    if (!profileFile) {
      setPreviewUrl(profile?.profile_image ?? '')
      return undefined
    }

    const objectUrl = URL.createObjectURL(profileFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [profile, profileFile])

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

    if (nicknameError || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const profileImage = profileFile
        ? await uploadImage(profileFile)
        : profile.profile_image
      await updateProfile({
        nickname: trimmedNickname,
        profileImage: profileImage ?? null,
      })

      const updatedUser = {
        ...profile,
        nickname: trimmedNickname,
        profile_image: profileImage ?? null,
      }
      setProfile(updatedUser)
      updateUser(updatedUser)
      setProfileFile(null)
      setIsToastVisible(true)
    } catch (submitError) {
      if (submitError.code === 'duplicate_nickname') {
        setError('중복된 닉네임입니다.')
      } else if (submitError.message === 'authentication_required') {
        setError('로그인이 필요합니다.')
      } else {
        setError('회원정보를 수정하지 못했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await withdrawUser()
      signOut()
      navigate('/login', { replace: true })
    } catch (withdrawError) {
      setIsWithdrawModalOpen(false)
      setError(
        withdrawError.message === 'authentication_required'
          ? '로그인이 필요합니다.'
          : '회원 탈퇴에 실패했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!profile) {
    return (
      <div className="profile-edit-page__status" role="alert">
        <p>{error || '회원정보를 찾을 수 없습니다.'}</p>
        <button type="button" onClick={() => navigate('/login')}>
          로그인으로 이동
        </button>
      </div>
    )
  }

  return (
    <main className="profile-edit-page">
      <h1>회원정보 수정</h1>

      <form noValidate onSubmit={handleSubmit}>
        <span className="profile-edit-page__label">프로필 사진*</span>
        <label
          className="profile-edit-page__uploader"
          htmlFor="profile-image"
        >
          {previewUrl && <img src={previewUrl} alt="프로필 미리보기" />}
          <span>변경</span>
        </label>
        <input
          className="sr-only"
          type="file"
          id="profile-image"
          accept="image/jpeg,image/png"
          onChange={(event) =>
            setProfileFile(event.target.files?.[0] ?? null)
          }
        />

        <div className="profile-edit-page__field">
          <span className="profile-edit-page__label">이메일</span>
          <p className="profile-edit-page__email">{profile.email}</p>
        </div>

        <div className="profile-edit-page__field">
          <label htmlFor="profile-nickname">닉네임</label>
          <input
            type="text"
            id="profile-nickname"
            value={nickname}
            maxLength={11}
            placeholder="닉네임을 입력하세요"
            onChange={(event) => {
              setNickname(event.target.value)
              setHasInteracted(true)
              setError('')
            }}
          />
          <p className="profile-edit-page__helper" aria-live="polite">
            {error || (hasInteracted ? nicknameError : '')}
          </p>
        </div>

        <button
          className="profile-edit-page__submit"
          type="submit"
          disabled={Boolean(nicknameError) || isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '수정하기'}
        </button>
      </form>

      <button
        className="profile-edit-page__withdraw"
        type="button"
        onClick={() => setIsWithdrawModalOpen(true)}
      >
        회원 탈퇴
      </button>

      <div
        className={`profile-edit-page__toast${
          isToastVisible ? ' is-visible' : ''
        }`}
        role="status"
      >
        수정완료
      </div>

      {isWithdrawModalOpen && (
        <ConfirmModal
          title="회원탈퇴 하시겠습니까?"
          description="작성한 자랑과 칭찬의 작성자 정보는 알 수 없음으로 표시됩니다."
          isPending={isSubmitting}
          onCancel={() => setIsWithdrawModalOpen(false)}
          onConfirm={handleWithdraw}
        />
      )}
    </main>
  )
}

export default ProfileEditPage
