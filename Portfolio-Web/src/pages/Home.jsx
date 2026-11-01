/* ============================================================
   Home Page
   ============================================================
   - The landing page of the portfolio website.
   - Composed of three sections:
     1. Hero (imported component)
     2. "Why Choose Me" – four feature cards
     3. "Skills Preview" – skill badges using SkillCard component
   ============================================================ */

import Hero from "../components/Hero/Hero";
import SkillCard from "../components/SkillCard/SkillCard";

/* ---- React Icons used for the feature cards and skill badges ---- */
import {
  FaCode,
  FaServer,
  FaRobot,
  FaLightbulb,
  FaReact,
  FaNodeJs,
  FaGitAlt,
  FaGithub,
} from "react-icons/fa";
import {
  SiJavascript,
  SiExpress,
  SiMongodb,
  SiSupabase,
} from "react-icons/si";

import "../css/Home.css";

/**
 * Home – The main landing page component.
 *
 * @returns {JSX.Element} The rendered Home page.
 */
function Home() {
  /* ---- "Why Choose Me" card data ----
     Each object contains an icon, title, and description.
     We map over this array to render the cards. */
  const featureCards = [
    {
      id: 1,
      icon: <FaCode size={28} />,
      title: "Full Stack Development",
      description:
        "Building complete web applications from frontend interfaces to backend APIs using modern technologies.",
    },
    {
      id: 2,
      icon: <FaServer size={28} />,
      title: "Backend Development",
      description:
        "Designing robust server-side architectures, RESTful APIs, and database systems for scalable applications.",
    },
    {
      id: 3,
      icon: <FaRobot size={28} />,
      title: "AI Integration",
      description:
        "Integrating artificial intelligence and machine learning capabilities into web applications.",
    },
    {
      id: 4,
      icon: <FaLightbulb size={28} />,
      title: "Problem Solving",
      description:
        "Analysing complex challenges and crafting efficient, elegant solutions with clean code practices.",
    },
  ];

  /* ---- Skills data ----
     Each object has an icon and a name.
     Passed to the reusable SkillCard component. */
  const skills = [
    { name: "React", icon: <FaReact size={18} /> },
    { name: "JavaScript", icon: <SiJavascript size={18} /> },
    { name: "Node.js", icon: <FaNodeJs size={18} /> },
    { name: "Express", icon: <SiExpress size={18} /> },
    { name: "MongoDB", icon: <SiMongodb size={18} /> },
    { name: "Supabase", icon: <SiSupabase size={18} /> },
    { name: "Git", icon: <FaGitAlt size={18} /> },
    { name: "GitHub", icon: <FaGithub size={18} /> },
  ];

  /* ---- Render ---- */
  return (
    <main className="home-page">
      {/* ===== Section 1: Hero ===== */}
      <Hero />

      {/* ===== Section 2: Why Choose Me ===== */}
      <section className="home-features" id="why-choose-me">
        <div className="home-section-container">
          {/* Section heading */}
          <h2 className="home-section-title fade-in-section">
            Why <span className="gradient-text">Choose Me</span>
          </h2>

          <p className="home-section-subtitle fade-in-section">
            I bring a unique combination of skills and passion to every project.
          </p>

          {/* Feature cards grid */}
          <div className="home-features-grid">
            {featureCards.map((card) => (
              <div key={card.id} className="home-feature-card fade-in-section">
                {/* Icon with gradient background circle */}
                <div className="feature-card-icon">{card.icon}</div>

                {/* Card title */}
                <h3 className="feature-card-title">{card.title}</h3>

                {/* Card description */}
                <p className="feature-card-description">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Section 3: Skills Preview ===== */}
      <section className="home-skills" id="skills-preview">
        <div className="home-section-container">
          {/* Section heading */}
          <h2 className="home-section-title fade-in-section">
            Skills <span className="gradient-text">Preview</span>
          </h2>

          <p className="home-section-subtitle fade-in-section">
            Technologies and tools I work with on a daily basis.
          </p>

          {/* Skill badges laid out in a wrapping row */}
          <div className="home-skills-grid fade-in-section">
            {skills.map((skill) => (
              <SkillCard
                key={skill.name}
                name={skill.name}
                icon={skill.icon}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
