/* ============================================================
   About Page
   ============================================================
   - Composed of multiple sections:
     1. About Me – personal introduction
     2. Achievements – key accomplishments
     3. Journey Timeline – education, internships, milestones
   ============================================================ */

import Timeline from "../components/Timeline/Timeline";
import { FiMapPin, FiBook, FiAward } from "react-icons/fi";

import "../css/About.css";

/**
 * About – The page containing personal info, skills,
 *         achievements, timeline, and contact form.
 *
 * @returns {JSX.Element} The rendered About page.
 */
function About() {
  /* ---- Achievements Data ---- */
  const achievements = [
    "Backend Development Internship",
    "Data Science Internship",
    "Hackathon Participations",
    "AI Workshop",
    "Machine Learning Workshop",
  ];

  /* ---- Timeline Data ---- */
  const timelineItems = [
    {
      year: "2024 – 2028",
      title: "B.Tech Information Technology – CHARUSAT University",
      description:
        "Pursuing Bachelor of Technology in Information Technology at Charotar University of Science and Technology, focusing on full-stack development, software engineering, database management systems, and AI integration.",
    },
    {
      year: "2026",
      title: "Backend Development Internship",
      description:
        "Worked as a Backend Development Intern at CodeAlpha, focusing on server-side architecture, RESTful APIs, JWT authentication, and database management.",
    },
    {
      year: "2026",
      title: "Data Science Internship",
      description:
        "Gained hands-on experience as a Data Science Intern at CodSoft, working with data analysis, machine learning models, and predictive analytics.",
    },
    {
      year: "2025 – 2026",
      title: "Hackathons & Workshops",
      description:
        "Participated in multiple hackathons including the Unstop Mind Sprint Hackathon and Solution Challenge 2026 (GenAI), and attended workshops on AI, Machine Learning, and Algorithm Design.",
    },
  ];

  /* ---- Render ---- */
  return (
    <main className="about-page">
      <div className="about-container">
        {/* ============================================================
            Section 1: About Me
            ============================================================ */}
        <section className="about-intro-section fade-in-section">
          <h1 className="about-page-title">
            About <span className="gradient-text">Me</span>
          </h1>

          {/* Info card with personal details */}
          <div className="about-info-card">
            <div className="about-info-details">
              <h2 className="about-info-name">Krish Bhingradiya</h2>

              {/* Quick info badges */}
              <div className="about-info-badges">
                <span className="about-info-badge">
                  <FiBook size={14} />
                  Information Technology Student
                </span>
                <span className="about-info-badge">
                  <FiMapPin size={14} />
                  Surat, Gujarat
                </span>
              </div>

              <p className="about-info-bio">
                I am a passionate Information Technology student with a strong
                interest in full-stack web development and artificial intelligence.
                I love building projects that solve real-world problems and
                constantly explore new technologies to expand my skill set.
                My goal is to create impactful software that makes a difference.
              </p>
            </div>
          </div>
        </section>



        {/* ============================================================
            Section 3: Achievements
            ============================================================ */}
        <section className="about-section fade-in-section">
          <h2 className="about-section-title">
            <FiAward size={24} />
            <span className="gradient-text">Achievements</span>
          </h2>

          <div className="about-achievements-grid">
            {achievements.map((item) => (
              <div key={item} className="about-achievement-card">
                <div className="about-achievement-icon">
                  <FiAward size={20} />
                </div>
                <span className="about-achievement-text">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            Section 4: Timeline
            ============================================================ */}
        <section className="about-section fade-in-section">
          <h2 className="about-section-title">
            My <span className="gradient-text">Journey</span>
          </h2>

          <Timeline items={timelineItems} />
        </section>
      </div>
    </main>
  );
}

export default About;
