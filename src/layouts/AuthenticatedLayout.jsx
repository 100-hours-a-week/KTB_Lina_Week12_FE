import { Outlet } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import './AuthenticatedLayout.css'

function AuthenticatedLayout() {
  return (
    <div className="authenticated-layout">
      <AppHeader />
      <div className="authenticated-layout__content">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthenticatedLayout
