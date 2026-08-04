import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import './RouteGuard.css'

function getReturnPath(location) {
  const from = location.state?.from

  if (!from?.pathname) {
    return '/posts'
  }

  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

function GuestRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <p className="route-guard__loading">로그인 상태를 확인하는 중...</p>
  }

  if (status === 'authenticated') {
    return <Navigate to={getReturnPath(location)} replace />
  }

  return <Outlet />
}

export default GuestRoute
