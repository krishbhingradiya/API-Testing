/* ============================================================
   Hero Component
   ============================================================
   - The main "above-the-fold" section on the Home page.
   - Displays the greeting, name, roles, profile image,
     a short introduction, and two call-to-action buttons.
   - The animated background is handled purely with CSS
     (no animation libraries required).
   ============================================================ */

import { Link } from "react-router-dom";
import { FiEye, FiArrowRight } from "react-icons/fi";
import profileImage from "../../assets/profile.png";
import "./Hero.css";

/**
 * Hero – The large introductory section visitors see first.
 *
 * @returns {JSX.Element} The rendered Hero component.
 */
function Hero() {
  /* ---- Data ---- */
  // Roles displayed beneath the name as small badges
  const roles = [
    "Information Technology Student",
    "Full Stack Developer",
    "AI Enthusiast",
  ];

  /* ---- Render ---- */
  return (
    <section className="hero" id="hero">
      {/* ===== Animated Background Elements ===== */}
      {/* These are empty divs styled with CSS to create
          floating gradient orbs behind the content */}
      <div className="hero-bg-animation">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
      </div>

      {/* ===== Hero Content Container ===== */}
      <div className="hero-container">

        {/* ----- Left Side: Text Content ----- */}
        <div className="hero-content">
          {/* Small greeting text */}
          <p className="hero-greeting fade-in">Hello, I'm</p>

          {/* Name with gradient styling */}
          <h1 className="hero-name fade-in">
            Krish <span className="hero-name-highlight">Bhingradiya</span>
          </h1>

          {/* Role badges */}
          <div className="hero-roles fade-in">
            {roles.map((role) => (
              <span key={role} className="hero-role-badge">
                {role}
              </span>
            ))}
          </div>

          {/* Short introduction paragraph */}
          <p className="hero-intro fade-in">
            Passionate about building modern web applications and integrating
            AI to solve real-world problems. Currently pursuing B.Tech in
            Information Technology with hands-on experience in full-stack
            development.
          </p>

          {/* Call-to-action buttons */}
          <div className="hero-buttons fade-in">
            {/* View Resume button (opens resume.pdf in a new tab) */}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn hero-btn-primary"
              aria-label="View Resume"
            >
              <FiEye size={18} />
              <span>View Resume</span>
            </a>

            {/* View Projects button – navigates to /projects */}
            <Link
              to="/projects"
              className="hero-btn hero-btn-secondary"
              aria-label="View Projects"
            >
              <span>View Projects</span>
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* ----- Right Side: Profile Image ----- */}
        <div className="hero-image-wrapper fade-in">
          {/* Decorative glowing ring behind the image */}
          <div className="hero-image-glow"></div>

          <img
            src={profileImage}
            alt="Krish Bhingradiya – Profile Photo"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
