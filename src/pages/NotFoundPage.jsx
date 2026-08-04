import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="migration-page">
      <p className="migration-page__eyebrow">404</p>
      <h1>페이지를 찾을 수 없습니다</h1>
      <nav className="migration-page__navigation" aria-label="돌아가기">
        <Link to="/posts">자랑 목록으로</Link>
      </nav>
    </main>
  )
}

export default NotFoundPage
