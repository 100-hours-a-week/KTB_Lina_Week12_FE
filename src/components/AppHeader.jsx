import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import './AppHeader.css'

function getBackPath(pathname) {
  const editMatch = pathname.match(/^\/posts\/([^/]+)\/edit$/)

  if (editMatch) {
    return `/posts/${editMatch[1]}`
  }

  return '/posts'
}

function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const showBackButton = location.pathname !== '/posts'
  const profileImage = user?.profile_image ?? ''

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    const closeMenuWithEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeMenuWithEscape)

    return () => {
      document.removeEventListener('pointerdown', closeMenu)
      document.removeEventListener('keydown', closeMenuWithEscape)
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-header">
      {showBackButton && (
        <Link
          className="app-header__back"
          to={getBackPath(location.pathname)}
          aria-label="뒤로가기"
        >
          &lt;
        </Link>
      )}

      <Link className="app-header__title" to="/posts">
        사소한 자랑 대회
      </Link>

      <div className="profile-menu" ref={menuRef}>
        <button
          className="profile-menu__trigger"
          type="button"
          aria-label="프로필 메뉴"
          aria-expanded={isMenuOpen}
          aria-controls="profile-dropdown"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          style={
            profileImage ? { backgroundImage: `url("${profileImage}")` } : undefined
          }
        />
        {isMenuOpen && (
          <ul className="profile-menu__dropdown" id="profile-dropdown">
            <li>
              <Link to="/profile/edit">회원정보수정</Link>
            </li>
            <li>
              <Link to="/password/edit">비밀번호수정</Link>
            </li>
            <li>
              <button type="button" onClick={handleLogout}>
                로그아웃
              </button>
            </li>
          </ul>
        )}
      </div>
    </header>
  )
}

export default AppHeader
