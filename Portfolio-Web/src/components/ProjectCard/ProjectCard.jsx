/* ============================================================
   ProjectCard Component
   ============================================================
   - Displays a single project with image, title, description,
     technology badges, and feature list.
   - Receives all data as props, making it fully reusable.
   ============================================================ */

import "./ProjectCard.css";


/**
 * ProjectCard – A glassmorphism card showcasing one project.
 *
 * @param {Object}   props              - Component props.
 * @param {string}   props.title        - Project name.
 * @param {string}   props.description  - Short project summary.
 * @param {string[]} props.features     - List of key features.
 * @param {string[]} props.technologies - Tech stack badges.

 * @param {string}   props.image        - Path to the project image.
 * @returns {JSX.Element} The rendered ProjectCard.
 */
function ProjectCard({
  title,
  description,
  features,
  technologies,
  image,
}) {
  return (
    <div className="project-card">
      {/* ===== Project Image ===== */}
      <div className="project-card-image-wrapper">
        <img
          src={image}
          alt={`${title} – Project Screenshot`}
          className="project-card-image"
        />

        {/* Gradient overlay at the bottom of the image */}
        <div className="project-card-image-overlay"></div>
      </div>

      {/* ===== Card Body ===== */}
      <div className="project-card-body">
        {/* Title */}
        <h3 className="project-card-title">{title}</h3>

        {/* Description */}
        <p className="project-card-description">{description}</p>

        {/* Technology badges */}
        <div className="project-card-tech">
          {technologies.map((tech) => (
            <span key={tech} className="project-card-tech-badge">
              {tech}
            </span>
          ))}
        </div>

        {/* Features list */}
        <div className="project-card-features">
          <h4 className="project-card-features-title">Key Features</h4>
          <ul className="project-card-features-list">
            {features.map((feature) => (
              <li key={feature} className="project-card-feature-item">
                {feature}
              </li>
            ))}
          </ul>
        </div>


      </div>
    </div>
  );
}

export default ProjectCard;
