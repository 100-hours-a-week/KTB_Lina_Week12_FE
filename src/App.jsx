import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthenticatedLayout from './layouts/AuthenticatedLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PasswordEditPage from './pages/PasswordEditPage.jsx'
import PostCreatePage from './pages/PostCreatePage.jsx'
import PostDetailPage from './pages/PostDetailPage.jsx'
import PostEditPage from './pages/PostEditPage.jsx'
import PostsPage from './pages/PostsPage.jsx'
import ProfileEditPage from './pages/ProfileEditPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import GuestRoute from './routes/GuestRoute.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/new" element={<PostCreatePage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/posts/:postId/edit" element={<PostEditPage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/password/edit" element={<PasswordEditPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
