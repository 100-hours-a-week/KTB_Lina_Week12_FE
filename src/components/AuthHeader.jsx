import { Link } from 'react-router-dom'
import './AuthHeader.css'

function AuthHeader({ backTo }) {
  return (
    <header className="auth-header">
      {backTo && (
        <Link
          className="auth-header__back"
          to={backTo}
          aria-label="뒤로가기"
        >
          &lt;
        </Link>
      )}
      <Link className="auth-header__title" to="/login">
        사소한 자랑 대회
      </Link>
    </header>
  )
}

export default AuthHeader
