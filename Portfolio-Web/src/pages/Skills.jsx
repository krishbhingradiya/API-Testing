/* ============================================================
   Skills Page
   ============================================================
   - Displays categorised list of skills.
   - Leverages the reusable SkillCard component.
   ============================================================ */

import SkillCard from "../components/SkillCard/SkillCard";
import { FaJava, FaReact, FaNodeJs, FaGitAlt, FaGithub } from "react-icons/fa";
import { SiJavascript, SiExpress, SiMongodb, SiSupabase, SiCplusplus, SiC } from "react-icons/si";
import { FiGlobe } from "react-icons/fi";
import "../css/Skills.css";

/**
 * Skills – Page component rendering grouped list of skills.
 *
 * @returns {JSX.Element} The rendered Skills page.
 */
function Skills() {
  /* ---- Skills Data ---- */
  const skillsCategories = [
    {
      title: "Languages",
      skills: [
        { name: "C", icon: <SiC size={18} /> },
        { name: "C++", icon: <SiCplusplus size={18} /> },
        { name: "Java", icon: <FaJava size={18} /> },
        { name: "JavaScript", icon: <SiJavascript size={18} /> },
      ],
    },
    {
      title: "Frontend Frameworks",
      skills: [
        { name: "React", icon: <FaReact size={18} /> },
      ],
    },
    {
      title: "Backend & Databases",
      skills: [
        { name: "Node.js", icon: <FaNodeJs size={18} /> },
        { name: "Express.js", icon: <SiExpress size={18} /> },
        { name: "MongoDB", icon: <SiMongodb size={18} /> },
        { name: "Supabase", icon: <SiSupabase size={18} /> },
        { name: "REST APIs", icon: <FiGlobe size={18} /> },
      ],
    },
    {
      title: "Tools & Platforms",
      skills: [
        { name: "Git", icon: <FaGitAlt size={18} /> },
        { name: "GitHub", icon: <FaGithub size={18} /> },
      ],
    },
  ];

  /* ---- Render ---- */
  return (
    <main className="skills-page">
      <div className="skills-container">
        {/* Page Title */}
        <h1 className="skills-title fade-in-section">
          Technical <span className="gradient-text">Skills</span>
        </h1>
        <p className="skills-subtitle fade-in-section">
          A comprehensive list of programming languages, frameworks, databases, and development tools I work with.
        </p>

        {/* Categories Grid */}
        <div className="skills-categories-grid">
          {skillsCategories.map((category) => (
            <div key={category.title} className="skills-category-card fade-in-section">
              <h2 className="skills-category-title">{category.title}</h2>
              <div className="skills-grid">
                {category.skills.map((skill) => (
                  <SkillCard
                    key={skill.name}
                    name={skill.name}
                    icon={skill.icon}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Skills;
