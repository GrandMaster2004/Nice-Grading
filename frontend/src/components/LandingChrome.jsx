import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LandingNavbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="landing__nav">
      <div
        className="landing__logo"
        onClick={() => handleNavigate("/")}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            handleNavigate("/");
          }
        }}
      >
        NICE G.
      </div>

      <button
        className="landing__nav-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        aria-controls="landing-nav-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="landing__nav-toggle-bar"></span>
        <span className="landing__nav-toggle-bar"></span>
        <span className="landing__nav-toggle-bar"></span>
      </button>

      <div
        id="landing-nav-menu"
        className={`landing__nav-menu${menuOpen ? " landing__nav-menu--open" : ""}`}
      >
        <div className="landing__links">
          <a href="#" className="landing__link">
            PRICING
          </a>
          <a href="#" className="landing__link">
            HALL OF FLEX
          </a>
          <button className="landing__icon" type="button" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
        <div className="landing__actions">
          <button
            onClick={() => handleNavigate("/login")}
            className="landing__action"
            type="button"
          >
            LOGIN
          </button>
          <button
            onClick={() => handleNavigate("/register")}
            className="landing__action landing__action--primary"
            type="button"
          >
            Start
          </button>
        </div>
      </div>
    </nav>
  );
};

export const LandingFooter = () => {
  return (
    <footer className="landing__footer">
      <div className="landing__footer-inner">
        <div className="landing__footer-logo">NICE G.</div>
        <div className="landing__footer-scroll">
          <span>Murder Your Mid Collection</span>
          <span>Slay The Slab Game</span>
          <span>No Cap</span>
          <span>Aura Boost High Activity</span>
        </div>
        <div className="landing__footer-icons">
          <button type="button">♪</button>
          <button type="button">📷</button>
          <button type="button">🐦</button>
        </div>
      </div>
      <p>© 2026 NICE G. ALL RIGHTS RESERVED</p>
    </footer>
  );
};
