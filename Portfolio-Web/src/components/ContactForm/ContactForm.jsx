/* ============================================================
   ContactForm Component
   ============================================================
   - A simple contact form with Name, Email, and Message fields.
   - Uses useState to manage form field values.
   - On submit, shows a browser alert and resets the form.
   - No backend or API integration required.
   ============================================================ */

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import "./ContactForm.css";

/**
 * ContactForm – A simple form for visitors to send a message.
 *
 * @returns {JSX.Element} The rendered ContactForm.
 */
function ContactForm() {
  /* ---- State ----
     Each field has its own state variable.
     We keep it simple instead of using a single object. */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  /**
   * Handles form submission.
   * Shows an alert and resets the form fields.
   *
   * @param {Event} event - The form submit event.
   */
  function handleSubmit(event) {
    // Prevent the browser from reloading the page
    event.preventDefault();

    // Show a thank-you alert to the user
    alert("Thank you for contacting me! I will get back to you soon.");

    // Reset all fields to empty strings
    setName("");
    setEmail("");
    setMessage("");
  }

  /* ---- Render ---- */
  return (
    <form className="contact-form" onSubmit={handleSubmit} id="contact-form">
      {/* Name field */}
      <div className="contact-form-group">
        <label htmlFor="contact-name" className="contact-form-label">
          Name
        </label>
        <input
          type="text"
          id="contact-name"
          className="contact-form-input"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      {/* Email field */}
      <div className="contact-form-group">
        <label htmlFor="contact-email" className="contact-form-label">
          Email
        </label>
        <input
          type="email"
          id="contact-email"
          className="contact-form-input"
          placeholder="your.email@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      {/* Message field */}
      <div className="contact-form-group">
        <div className="contact-form-header-row">
          <label htmlFor="contact-message" className="contact-form-label">
            Message
          </label>
          <span className={`contact-form-char-count ${message.length > 400 ? "warning" : ""}`}>
            {message.length} characters
          </span>
        </div>
        <textarea
          id="contact-message"
          className="contact-form-input contact-form-textarea"
          placeholder="Write your message here..."
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </div>

      {/* Live Preview Card */}
      {(name || email || message) && (
        <div className="contact-live-preview fade-in">
          <span className="preview-tag">Live Preview</span>
          <div className="preview-card">
            <div className="preview-header">
              <span className="preview-name">{name || "Your Name"}</span>
              <span className="preview-email">{email || "your.email@example.com"}</span>
            </div>
            <div className="preview-body">
              <p className="preview-message">
                {message || "Your message will appear here in real time as you type..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <button type="submit" className="contact-form-btn">
        <FiSend size={16} />
        <span>Send Message</span>
      </button>
    </form>
  );
}

export default ContactForm;
