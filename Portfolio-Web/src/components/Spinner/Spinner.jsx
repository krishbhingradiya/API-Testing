/* ============================================================
   Spinner Component
   ============================================================
   - Displays a gradient ring spinner with a pulsing glow.
   - Shown while an asynchronous operation (e.g., API fetch)
     is in progress.
   ============================================================ */

import "./Spinner.css";

/**
 * Spinner – A loading indicator with a rotating gradient ring.
 *
 * @returns {JSX.Element} The rendered Spinner.
 */
function Spinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading">
      {/* Glow container + rotating ring */}
      <div className="spinner-glow">
        <div className="spinner-ring"></div>
      </div>

      {/* Loading text */}
      <p className="spinner-text">Loading repositories…</p>
    </div>
  );
}

export default Spinner;
