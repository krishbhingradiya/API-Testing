/* ============================================================
   Footer Component
   ============================================================
   - Displayed at the bottom of every page.
   - Shows copyright, a "Made with React" note,
     and social media links (GitHub, LinkedIn, Email).
   ============================================================ */

import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import "./Footer.css";

/**
 * Footer – The site-wide footer with copyright and social links.
 *
 * @returns {JSX.Element} The rendered Footer component.
 */
function Footer() {
  /* ---- Social links data ---- */
  const socialLinks = [
    {
      label: "GitHub",
      icon: <FiGithub size={20} />,
      href: "https://github.com",
    },
    {
      label: "LinkedIn",
      icon: <FiLinkedin size={20} />,
      href: "https://linkedin.com",
    },
    {
      label: "Email",
      icon: <FiMail size={20} />,
      href: "mailto:krish@example.com",
    },
  ];

  /* ---- Get the current year dynamically ---- */
  const currentYear = new Date().getFullYear();

  /* ---- Render ---- */
  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        {/* Social icon links */}
        <div className="footer-socials">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Made with React note */}
        <p className="footer-tagline">
          Made with React ❤️
        </p>

        {/* Copyright */}
        <p className="footer-copyright">
          © {currentYear} Krish Bhingradiya. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
