import { Link, useParams } from 'react-router-dom'

const navigationItems = [
  { path: '/login', label: '로그인' },
  { path: '/signup', label: '회원가입' },
  { path: '/posts', label: '자랑 목록' },
  { path: '/posts/new', label: '자랑하기' },
  { path: '/profile/edit', label: '회원정보 수정' },
  { path: '/password/edit', label: '비밀번호 수정' },
]

function MigrationPage({ title, sourceFile }) {
  const { postId } = useParams()

  return (
    <main className="migration-page">
      <p className="migration-page__eyebrow">React migration</p>
      <h1>{title}</h1>
      <p className="migration-page__description">
        <code>{sourceFile}</code> 화면이 이 경로로 마이그레이션될 예정입니다.
      </p>
      {postId && <p>게시글 ID: {postId}</p>}

      <nav className="migration-page__navigation" aria-label="React 화면 목록">
        {navigationItems.map(({ path, label }) => (
          <Link key={path} to={path}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  )
}

export default MigrationPage
