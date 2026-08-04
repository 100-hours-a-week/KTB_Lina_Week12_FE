import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPosts } from '../api/posts.js'
import PostCard from '../components/PostCard.jsx'
import './PostsPage.css'

function PostsPage() {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const sentinelRef = useRef(null)
  const pageRef = useRef(1)
  const hasNextRef = useRef(true)
  const isLoadingRef = useRef(false)

  const loadPosts = useCallback(async () => {
    if (isLoadingRef.current || !hasNextRef.current) {
      return
    }

    isLoadingRef.current = true
    setIsLoading(true)
    setError('')

    try {
      const result = await getPosts({ page: pageRef.current })

      setPosts((currentPosts) => [...currentPosts, ...result.posts])
      hasNextRef.current = result.hasNext
      pageRef.current += 1
    } catch {
      setError('게시글을 불러오지 못했습니다.')
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadPosts()
        }
      },
      { rootMargin: '200px 0px' },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loadPosts])

  return (
    <main className="posts-page">
      <section className="posts-page__hero">
        <p className="posts-page__greeting">
          오늘은 무엇을 해냈나요?
          <br />
          사소한 일도 여기서는 충분히 자랑거리예요.
        </p>
        <div className="posts-page__tags" aria-label="커뮤니티 특징">
          <span>작은 성취도 인정</span>
          <span>비교 없이 칭찬만</span>
          <span>짧은 글도 OK</span>
        </div>
      </section>

      <div className="posts-page__write-row">
        <Link className="posts-page__write-link" to="/posts/new">
          자랑하기
        </Link>
      </div>

      {posts.length > 0 && (
        <section className="posts-page__list" aria-label="게시글 목록">
          {posts.map((post) => (
            <PostCard key={post.postId} post={post} />
          ))}
        </section>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <p className="posts-page__status">
          아직 등록된 자랑이 없습니다. 첫 자랑을 남겨보세요!
        </p>
      )}

      {error && (
        <div className="posts-page__status" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadPosts}>
            다시 시도
          </button>
        </div>
      )}

      {isLoading && (
        <p className="posts-page__status" aria-live="polite">
          게시글을 불러오는 중...
        </p>
      )}

      <div
        className="posts-page__sentinel"
        ref={sentinelRef}
        aria-hidden="true"
      />
    </main>
  )
}

export default PostsPage
