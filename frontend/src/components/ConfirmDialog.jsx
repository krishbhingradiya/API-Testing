import './ConfirmDialog.css';

/**
 * ConfirmDialog — Modal overlay for confirming destructive actions (e.g., delete).
 * Renders on top of everything with a blurred backdrop.
 */
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog__icon">⚠</div>
        <h3 className="confirm-dialog__title">{title || 'Confirm Action'}</h3>
        <p className="confirm-dialog__message">
          {message || 'Are you sure you want to proceed?'}
        </p>
        <div className="confirm-dialog__actions">
          <button
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={onCancel}
            id="confirm-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="confirm-dialog__btn confirm-dialog__btn--confirm"
            onClick={onConfirm}
            id="confirm-delete-btn"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
