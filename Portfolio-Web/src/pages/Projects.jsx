/* ============================================================
   Projects Page
   ============================================================
   - Displays personal projects using the ProjectCard component.
   - Fetches and displays GitHub repositories using the GitHub
     REST API (Practical 3 – API Integration).
   - Manages asynchronous state: loading, success, and error.
   - Includes a search/filter input and retry functionality.
   ============================================================ */

import { useState, useEffect, useCallback } from "react";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import Spinner from "../components/Spinner/Spinner";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";
import RepoCard from "../components/RepoCard/RepoCard";

/* ---- Import project images ---- */
import resumeiqImage from "../assets/resumeiq.png";
import studymindImage from "../assets/studymind.png";
import restaurantImage from "../assets/restaurant.png";
import shortlinkImage from "../assets/shortlinkpro.png";

import "../css/Projects.css";

/* ---- Static Repo Entry ----
   ShortLink Pro is a private repo on GitHub, so the public API
   cannot return it. We include it as a static entry that is
   merged with the API-fetched repos so it always appears. */
const staticRepos = [
  {
    id: "static-shortlink-pro",
    name: "Short-Link-PRO",
    html_url: "https://github.com/krishbhingradiya/Short-Link-PRO",
    description:
      "A modern, developer-friendly link management engine to shorten URLs, create custom aliases, generate QR codes, and monitor analytics.",
    stargazers_count: 0,
    language: "JavaScript",
    forks_count: 0,
  },
];

/**
 * Projects – The page that showcases personal projects and live
 *            GitHub repositories fetched from the REST API.
 *
 * @returns {JSX.Element} The rendered Projects page.
 */
function Projects() {
  /* ============================================================
     Static Projects Data
     ============================================================ */
  const projectsList = [
    {
      id: 1,
      title: "ResumeIQ AI",
      description: "AI Powered Resume Analysis Platform that helps job seekers optimise their resumes and match them with the best opportunities.",
      features: [
        "ATS Score",
        "Resume Analysis",
        "Job Description Matching",
        "AI Career Advisor",
        "Resume Authentication",
        "Recruiter Dashboard",
      ],
      technologies: ["React", "Node.js", "Express", "MongoDB", "OpenAI"],
      image: resumeiqImage,
    },
    {
      id: 2,
      title: "StudyMind AI",
      description: "AI Powered Learning Platform that transforms the way students study with intelligent tools and personalised learning paths.",
      features: [
        "AI Notes",
        "Quiz Generator",
        "OCR",
        "Handwriting Recognition",
        "Past Paper Analysis",
        "Roadmaps",
      ],
      technologies: ["React", "Supabase", "Python", "TensorFlow", "OpenAI"],
      image: studymindImage,
    },
    {
      id: 3,
      title: "Dine Flow",
      description: "A full-featured restaurant management web application with an admin dashboard for handling orders, menus, reservations, and analytics.",
      features: [
        "Order Management",
        "Menu Management",
        "Table Reservations",
        "Revenue Analytics",
        "Staff Management",
        "Real-time Updates",
      ],
      technologies: ["React", "Node.js", "Express", "MongoDB"],
      image: restaurantImage,
    },
    {
      id: 4,
      title: "ShortLink Pro",
      description: "A modern, developer-friendly link management engine to shorten URLs, create custom aliases, generate QR codes, and monitor analytics.",
      features: [
        "URL Shortening",
        "Custom Aliases",
        "QR Code Generation",
        "Click Analytics",
        "Link Expiration",
        "Workspace Management",
      ],
      technologies: ["React", "Node.js", "Express", "MongoDB"],
      image: shortlinkImage,
    },
  ];

  /* ============================================================
     GitHub API State (Practical 3)
     ============================================================
     Three core state variables manage the asynchronous lifecycle:
       - repos:            fetched repository array
       - loading:          true while the request is in flight
       - error:            null on success, or error message string
     Additional utility states:
       - searchQuery:      filters rendered repo list by name
       - isSimulatedError: tracks if simulated error mode is active */

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSimulatedError, setIsSimulatedError] = useState(false);

  /**
   * fetchRepos – Fetches the public repositories from the GitHub REST API.
   *
   * @param {boolean} shouldFail - If true, intentionally breaks the API URL
   *                               to test loading & error states (Step 6).
   */
  const fetchRepos = useCallback((shouldFail = false) => {
    setLoading(true);
    setError(null);
    setIsSimulatedError(shouldFail);

    const apiUrl = shouldFail
      ? "https://api.github.com/users/INVALID_USER_SIMULATE_FAIL_12345/repos"
      : "https://api.github.com/users/krishbhingradiya/repos?sort=updated&per_page=30";

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `GitHub API responded with status ${res.status} (${
              shouldFail ? "Simulated API Failure" : "Request Failed"
            })`
          );
        }
        return res.json();
      })
      .then((data) => {
        const apiRepoNames = data.map((r) => r.name.toLowerCase());
        const uniqueStatic = staticRepos.filter(
          (sr) => !apiRepoNames.includes(sr.name.toLowerCase())
        );
        setRepos([...uniqueStatic, ...data]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ---- Trigger fetch on mount ---- */
  useEffect(() => {
    fetchRepos(false);
  }, [fetchRepos]);

  /* ---- Filter repos by search query ---- */
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ============================================================
     Render
     ============================================================ */
  return (
    <main className="projects-page">
      <div className="projects-container">
        {/* ===== Section 1: Static Personal Projects ===== */}
        <h1 className="projects-title fade-in-section">
          My <span className="gradient-text">Projects</span>
        </h1>

        <p className="projects-subtitle fade-in-section">
          A selection of projects I have built to solve real-world problems
          using modern technologies.
        </p>

        {/* Projects grid */}
        <div className="projects-grid">
          {projectsList.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              features={project.features}
              technologies={project.technologies}
              image={project.image}
            />
          ))}
        </div>

        {/* ===== Section 2: GitHub Repositories (API) ===== */}
        <h2 className="repos-section-title fade-in-section">
          GitHub <span className="gradient-text">Repositories</span>
        </h2>

        <p className="repos-section-subtitle fade-in-section">
          Live data fetched dynamically from the GitHub REST API.
        </p>

        {/* Control Bar: Search Input + API Call Fail Simulator Button */}
        <div className="repos-controls-bar fade-in-section">
          <div className="repos-search-wrapper">
            <input
              type="text"
              id="repo-search-input"
              className="repos-search-input"
              placeholder="Search repositories by name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search repositories"
            />
          </div>

          <div className="repos-action-btns">
            <button
              type="button"
              className={`repos-control-btn repos-fail-btn ${
                isSimulatedError ? "active" : ""
              }`}
              onClick={() => fetchRepos(true)}
              title="Simulate API fetch failure to test error state and retry button"
              id="simulate-api-fail-btn"
            >
              <span className="btn-icon">⚠️</span>
              Simulate API Failure
            </button>

            <button
              type="button"
              className="repos-control-btn repos-reload-btn"
              onClick={() => fetchRepos(false)}
              title="Reload live GitHub repositories"
              id="fetch-live-repos-btn"
            >
              <span className="btn-icon">↻</span>
              Fetch Live Repos
            </button>
          </div>
        </div>

        {/* ---- Conditional Rendering Based on Request State ---- */}

        {/* Loading State → show Spinner */}
        {loading && <Spinner />}

        {/* Error State → show ErrorMessage with Retry button */}
        {error && !loading && (
          <ErrorMessage
            message={error}
            onRetry={() => fetchRepos(false)}
          />
        )}

        {/* Success State → show RepoCard list */}
        {!loading && !error && (
          <div className="repos-grid">
            {filteredRepos.length > 0 ? (
              filteredRepos.map((repo) => (
                <RepoCard
                  key={repo.id}
                  name={repo.name}
                  htmlUrl={repo.html_url}
                  description={repo.description}
                  stars={repo.stargazers_count}
                  language={repo.language}
                  forks={repo.forks_count}
                />
              ))
            ) : (
              <p className="repos-no-results">
                No repositories match &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default Projects;

