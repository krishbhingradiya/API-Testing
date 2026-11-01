import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

/* ---- Import global styles (reset, fonts, base styles) ---- */
import "./css/index.css";

/* ---- Import the root App component ---- */
import App from "./App";

/* Get the <div id="root"> element from index.html */
const rootElement = document.getElementById("root");

/* Create a React root and render the App inside it */
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
