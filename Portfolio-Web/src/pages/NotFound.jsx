/* ============================================================
   NotFound Component (404 Page)
   ============================================================
   - Rendered when a user navigates to an undefined path.
   - Provides a clear message and a Link to navigate back to home.
   ============================================================ */

import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";
import "../css/NotFound.css";

/**
 * NotFound – Renders a custom 404 error page.
 *
 * @returns {JSX.Element} The rendered NotFound page.
 */
function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-container fade-in-section">
        {/* Visual warning icon */}
        <div className="not-found-icon-wrap">
          <FiAlertTriangle size={60} className="not-found-icon" />
        </div>

        {/* Error code & heading */}
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>

        {/* Home navigation CTA button */}
        <Link to="/" className="not-found-btn">
          <FiHome size={18} />
          <span>Back to Home</span>
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
