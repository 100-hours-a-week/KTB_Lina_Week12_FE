import { Link } from 'react-router-dom'

function formatCount(count) {
  const number = Number(count) || 0

  if (number >= 1000) {
    return `${Math.floor(number / 1000)}k`
  }

  return number
}

function PostCard({ post }) {
  const author = post.author ?? {}

  return (
    <article className="post-card">
      <Link className="post-card__link" to={`/posts/${post.postId}`}>
        <div
          className="post-card__thumbnail"
          style={
            post.image
              ? { backgroundImage: `url("${post.image}")` }
              : undefined
          }
          role={post.image ? 'img' : undefined}
          aria-label={post.image ? `${post.title} 썸네일` : undefined}
        />
        <h2 className="post-card__title">{post.title}</h2>
        <div className="post-card__meta">
          <time>{post.createdAt}</time>
        </div>
        <hr className="post-card__divider" />
        <div className="post-card__author">
          <span
            className="post-card__avatar"
            style={
              author.profileImage
                ? { backgroundImage: `url("${author.profileImage}")` }
                : undefined
            }
            aria-hidden="true"
          />
          <span className="post-card__author-name">
            {author.nickname ?? '알 수 없음'}
          </span>
          <span className="post-card__stats">
            잘했어요👏 {formatCount(post.likesCount)}
            <span aria-hidden="true"> · </span>
            칭찬 {formatCount(post.commentsCount)}
            <span aria-hidden="true"> · </span>
            조회수 {formatCount(post.viewsCount)}
          </span>
        </div>
      </Link>
    </article>
  )
}

export default PostCard
