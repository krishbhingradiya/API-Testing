/* ============================================================
   ErrorMessage Component
   ============================================================
   - Displays a user-friendly error message when an API call
     fails.
   - Includes a Retry button that re-triggers the fetch.
   ============================================================ */

import "./ErrorMessage.css";

/**
 * ErrorMessage – A glassmorphism error card with a retry action.
 *
 * @param {Object}   props           - Component props.
 * @param {string}   props.message   - The error message to display.
 * @param {Function} props.onRetry   - Callback to re-trigger the fetch.
 * @returns {JSX.Element} The rendered ErrorMessage.
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-wrapper" role="alert">
      <div className="error-card">
        {/* Warning icon */}
        <div className="error-icon">⚠️</div>

        {/* Error heading */}
        <h3 className="error-title">Something went wrong</h3>

        {/* Error details */}
        <p className="error-text">{message}</p>

        {/* Retry button – calls the parent's fetch function */}
        <button
          className="error-retry-btn"
          onClick={onRetry}
          type="button"
          id="retry-fetch-btn"
        >
          <span className="error-retry-icon">↻</span>
          Try Again
        </button>
      </div>
    </div>
  );
}

export default ErrorMessage;
