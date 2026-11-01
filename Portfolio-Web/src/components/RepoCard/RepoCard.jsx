/* ============================================================
   RepoCard Component
   ============================================================
   - Displays a single GitHub repository inside a glassmorphism
     card.
   - Shows: repo name (clickable link), description, star count,
     primary language, fork count, and html_url.
   ============================================================ */

import "./RepoCard.css";

/**
 * RepoCard – A card showcasing one GitHub repository.
 *
 * @param {Object}      props              - Component props.
 * @param {string}      props.name         - Repository name.
 * @param {string}      props.htmlUrl      - URL to the repository on GitHub.
 * @param {string|null} props.description  - Short repository description.
 * @param {number}      props.stars        - Star/stargazer count.
 * @param {string|null} props.language     - Primary programming language.
 * @param {number}      props.forks        - Fork count.
 * @returns {JSX.Element} The rendered RepoCard.
 */
function RepoCard({ name, htmlUrl, description, stars, language, forks }) {
  return (
    <div className="repo-card">
      {/* ===== Header: Name + Stars ===== */}
      <div className="repo-card-header">
        {/* Repo name as a clickable link */}
        <a
          href={htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-card-name"
        >
          {name}
        </a>

        {/* Star count badge */}
        <span className="repo-card-stars">⭐ {stars}</span>
      </div>

      {/* ===== Description ===== */}
      <p
        className={`repo-card-description ${
          !description ? "repo-card-no-description" : ""
        }`}
      >
        {description || "No description provided."}
      </p>

      {/* ===== Meta Row: Language, Forks, URL ===== */}
      <div className="repo-card-meta">
        {/* Language (only shown if available) */}
        {language && (
          <span className="repo-card-language">
            <span className="repo-card-language-dot"></span>
            {language}
          </span>
        )}

        {/* Fork count */}
        <span className="repo-card-forks">🍴 {forks}</span>

        {/* Direct URL */}
        <a
          href={htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-card-url"
        >
          {htmlUrl}
        </a>
      </div>
    </div>
  );
}

export default RepoCard;
