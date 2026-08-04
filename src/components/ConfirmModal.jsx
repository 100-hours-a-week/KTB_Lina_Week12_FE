import { useEffect } from 'react'
import './ConfirmModal.css'

function ConfirmModal({
  title,
  description,
  isPending,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeWithEscape = (event) => {
      if (event.key === 'Escape' && !isPending) {
        onCancel()
      }
    }

    document.addEventListener('keydown', closeWithEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [isPending, onCancel])

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !isPending) {
      onCancel()
    }
  }

  return (
    <div className="confirm-modal" onMouseDown={handleOverlayClick}>
      <div
        className="confirm-modal__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
      >
        <h2 id="confirm-modal-title">{title}</h2>
        <p id="confirm-modal-description">{description}</p>
        <div className="confirm-modal__actions">
          <button type="button" onClick={onCancel} disabled={isPending}>
            취소
          </button>
          <button
            className="confirm-modal__confirm"
            type="button"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? '처리 중...' : '확인'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
