/* ============================================================
   Contact Page
   ============================================================
   - Allows users to contact the portfolio owner.
   - Renders direct contact details and the ContactForm.
   - Utilises useState to toggle the visibility of contact tips.
   ============================================================ */

import { useState } from "react";
import ContactForm from "../components/ContactForm/ContactForm";
import { FiMail, FiPhone, FiMapPin, FiHelpCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import "../css/Contact.css";

/**
 * Contact – Page component rendering contact details, form, and help utility.
 *
 * @returns {JSX.Element} The rendered Contact page.
 */
function Contact() {
  /* ---- State ---- */
  // Meaningful state variable to toggle visibility of the contact guide/tooltip box
  const [showHelp, setShowHelp] = useState(false);

  /* ---- Render ---- */
  return (
    <main className="contact-page">
      <div className="contact-container">
        {/* Page title */}
        <h1 className="contact-title fade-in-section">
          Get In <span className="gradient-text">Touch</span>
        </h1>
        <p className="contact-subtitle fade-in-section">
          Have a question, a project idea, or just want to say hello? Drop me a line!
        </p>

        {/* Grid layout containing info and form columns */}
        <div className="contact-grid">
          {/* Left Column: Direct Info Card & Guidelines toggler */}
          <div className="contact-info-card fade-in-section">
            <h2 className="contact-info-title">Contact Information</h2>
            <p className="contact-info-desc">
              Feel free to reach out directly. I am always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>

            <div className="contact-details-list">
              {/* Email Detail */}
              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <FiMail size={18} />
                </div>
                <div className="contact-detail-text">
                  <span className="contact-detail-label">Email</span>
                  <a href="mailto:krishbhingradiya05@gmail.com" className="contact-detail-val link-hover">
                    krishbhingradiya05@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone Detail */}
              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <FiPhone size={18} />
                </div>
                <div className="contact-detail-text">
                  <span className="contact-detail-label">Phone</span>
                  <a href="tel:+917861079164" className="contact-detail-val link-hover">
                    +91 7861079164
                  </a>
                </div>
              </div>

              {/* Location Detail */}
              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  <FiMapPin size={18} />
                </div>
                <div className="contact-detail-text">
                  <span className="contact-detail-label">Location</span>
                  <span className="contact-detail-val">Surat, Gujarat, India</span>
                </div>
              </div>
            </div>

            {/* Help/Tips Section - Meaningful UI toggle using useState */}
            <div className="help-toggle-container">
              <button
                className="help-toggle-btn"
                onClick={() => setShowHelp(!showHelp)}
                aria-expanded={showHelp}
              >
                <FiHelpCircle size={18} />
                <span>{showHelp ? "Hide Contact Tips" : "Show Contact Tips"}</span>
                {showHelp ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>

              {showHelp && (
                <div className="help-tooltip-box fade-in">
                  <p className="help-tooltip-heading">💡 Quick Guidelines:</p>
                  <ul className="help-tooltip-list">
                    <li>Provide a clear subject in your message.</li>
                    <li>Double-check your email so I can respond.</li>
                    <li>For opportunities, include scope/timeline if possible.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Controlled Contact Form */}
          <div className="contact-form-card fade-in-section">
            <h2 className="contact-info-title">Send a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Contact;
