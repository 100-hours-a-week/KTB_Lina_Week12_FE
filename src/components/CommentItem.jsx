function CommentItem({ comment, canManage, onDelete, onEdit }) {
  const author = comment.author ?? {}

  return (
    <article className="comment-item">
      <div className="comment-item__header">
        <div className="comment-item__author">
          <span
            className="comment-item__avatar"
            style={
              author.profileImage
                ? { backgroundImage: `url("${author.profileImage}")` }
                : undefined
            }
            aria-hidden="true"
          />
          <span className="comment-item__author-name">
            {author.nickname ?? '알 수 없음'}
          </span>
          <time className="comment-item__date">{comment.createdAt}</time>
        </div>

        {canManage && (
          <div className="comment-item__actions">
            <button type="button" onClick={() => onEdit(comment)}>
              수정
            </button>
            <button type="button" onClick={() => onDelete(comment.commentId)}>
              삭제
            </button>
          </div>
        )}
      </div>
      <p className="comment-item__content">{comment.content}</p>
    </article>
  )
}

export default CommentItem
