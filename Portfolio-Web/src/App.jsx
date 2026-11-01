/* ============================================================
   App Component
   ============================================================
   - The root component of the application.
   - Sets up React Router for page navigation.
   - Renders the Navbar and Footer on every page.
   - Each <Route> maps a URL path to a page component.
   ============================================================ */

import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

/* ---- Layout Components (shown on every page) ---- */
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

/* ---- Page Components ---- */
import Home from "./pages/Home";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

/* ---- Global Styles ---- */
import "./css/App.css";

/**
 * App – The root component that renders the layout and routing structure.
 *
 * @returns {JSX.Element} The rendered App.
 */
function App() {
  // Lifted theme state (light vs dark), defaulting to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Apply the theme class to the document root element
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  /**
   * Toggles the active theme.
   */
  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <div className="app">
      {/* Header is visible on every page, receiving theme props */}
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* Main content area – switches based on the URL */}
      <div className="app-main page-transition">
        <Routes>
          {/* Home page – displayed at the root "/" */}
          <Route path="/" element={<Home />} />

          {/* Skills page – displayed at "/skills" */}
          <Route path="/skills" element={<Skills />} />

          {/* Projects page – displayed at "/projects" */}
          <Route path="/projects" element={<Projects />} />

          {/* About page – displayed at "/about" */}
          <Route path="/about" element={<About />} />

          {/* Contact page – displayed at "/contact" */}
          <Route path="/contact" element={<Contact />} />

          {/* NotFound page – fallback for unknown paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Footer is visible on every page */}
      <Footer />
    </div>
  );
}

export default App;
