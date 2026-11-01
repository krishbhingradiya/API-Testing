/* ============================================================
   Timeline Component
   ============================================================
   - Displays events (education, internships, achievements)
     in a vertical timeline layout.
   - Receives an array of timeline items as a prop.
   - Each item has a year, title, and description.
   ============================================================ */

import { FiCalendar } from "react-icons/fi";
import "./Timeline.css";

/**
 * Timeline – A vertical timeline showing milestones.
 *
 * @param {Object}   props           - Component props.
 * @param {Object[]} props.items     - Array of timeline items.
 * @param {string}   props.items[].year        - The year / date.
 * @param {string}   props.items[].title       - Event title.
 * @param {string}   props.items[].description - Event description.
 * @returns {JSX.Element} The rendered Timeline.
 */
function Timeline({ items }) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <div key={index} className="timeline-item">
          {/* Vertical line connector + dot */}
          <div className="timeline-marker">
            <div className="timeline-dot"></div>
            {/* Show connecting line except after the last item */}
            {index < items.length - 1 && (
              <div className="timeline-line"></div>
            )}
          </div>

          {/* Card content */}
          <div className="timeline-card">
            {/* Year badge */}
            <span className="timeline-year">
              <FiCalendar size={13} />
              {item.year}
            </span>

            {/* Title */}
            <h4 className="timeline-title">{item.title}</h4>

            {/* Description */}
            <p className="timeline-description">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
