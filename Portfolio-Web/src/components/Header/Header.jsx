/* ============================================================
   Header Component
   ============================================================
   - Displays the site logo ("KB") and navigation links.
   - Uses React Router's <Link> for client-side navigation.
   - Includes a hamburger menu icon for mobile screens.
   - Uses a useState hook to toggle the mobile menu.
   - Incorporates a theme-toggling state that applies light/dark
     classes to document.documentElement and persists in localStorage.
   ============================================================ */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenuAlt3 as HiMenuIcon, HiX as HiXIcon } from "react-icons/hi";
import { FiSun, FiMoon } from "react-icons/fi";
import "./Header.css";

/**
 * Header – The top navigation bar visible on every page.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.theme - The current theme ("dark" or "light").
 * @param {Function} props.toggleTheme - Callback to switch themes.
 * @returns {JSX.Element} The rendered Header component.
 */
function Header({ theme, toggleTheme }) {
  /* ---- State ---- */
  // Controls whether the mobile menu is open or closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // useLocation gives us the current URL path so we can
  // highlight the active navigation link
  const location = useLocation();

  /* ---- Handlers ---- */
  /**
   * Toggles the mobile menu between open and closed states.
   */
  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  /**
   * Closes the mobile menu. Called when a nav link is clicked
   * so the menu doesn't stay open after navigation.
   */
  function closeMenu() {
    setIsMenuOpen(false);
  }

  /* ---- Navigation Links Data ---- */
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/skills", label: "Skills" },
    { path: "/projects", label: "Projects" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  /* ---- Render ---- */
  return (
    <header className="navbar" id="navbar">
      {/* Container keeps the navbar content centered and constrained */}
      <div className="navbar-container">

        {/* ===== Logo ===== */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          KB
        </Link>

        {/* ===== Right Section Controls ===== */}
        <div className="navbar-right">
          {/* Desktop Navigation Links */}
          <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
            {navLinks.map((link) => (
              <li key={link.path} className="navbar-item">
                <Link
                  to={link.path}
                  className={`navbar-link ${
                    location.pathname === link.path ? "navbar-link-active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            className="navbar-toggle"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            {/* Show X icon when menu is open, hamburger icon otherwise */}
            {isMenuOpen ? <HiXIcon size={28} /> : <HiMenuIcon size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
