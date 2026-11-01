/* ============================================================
   SkillCard Component
   ============================================================
   - A small, reusable badge/card that displays a single skill.
   - Receives the skill name and an icon as props.
   - Used on the Home page (Skills Preview) and About page.
   ============================================================ */

import "./SkillCard.css";

/**
 * SkillCard – Displays a single skill as a styled badge.
 *
 * @param {Object}  props          - Component props.
 * @param {string}  props.name     - The name of the skill (e.g. "React").
 * @param {JSX.Element} props.icon - A React Icon element to show beside the name.
 * @returns {JSX.Element} The rendered SkillCard.
 */
function SkillCard({ name, icon }) {
  return (
    <div className="skill-card">
      {/* Icon on the left */}
      <span className="skill-card-icon">{icon}</span>

      {/* Skill name on the right */}
      <span className="skill-card-name">{name}</span>
    </div>
  );
}

export default SkillCard;
