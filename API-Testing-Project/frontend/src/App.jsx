import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/Toast';
import TaskList from './components/TaskList';
import './index.css';

const TaskForm = lazy(() => import('./components/TaskForm'));

const RouteFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
    <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--color-primary)' }} />
  </div>
);

/**
 * Navbar — Top navigation bar with app branding and current page indicator.
 */
function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">📋</span>
          <span className="navbar__title">TaskFlow</span>
          <span className="navbar__badge">PR6</span>
        </Link>

        <div className="navbar__links">
          <Link
            to="/"
            className={`navbar__link ${isHome ? 'navbar__link--active' : ''}`}
            id="nav-home"
          >
            Tasks
          </Link>
          <Link
            to="/create"
            className={`navbar__link ${location.pathname === '/create' ? 'navbar__link--active' : ''}`}
            id="nav-create"
          >
            + New
          </Link>
        </div>
      </div>
    </nav>
  );
}

/**
 * App — Root component with routing.
 * Routes:
 *   /         → TaskList (home)
 *   /create   → TaskForm (create mode)
 *   /edit/:id → TaskForm (edit mode)
 */
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main className="app__main">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<TaskList />} />
                <Route path="/create" element={<TaskForm />} />
                <Route path="/edit/:id" element={<TaskForm />} />
              </Routes>
            </Suspense>
          </main>
          <ToastContainer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
