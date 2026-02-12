import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LandingNavbar = ({ pricingRef, hallOfFlexRef }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const scrollToSection = (ref) => {
    setMenuOpen(false);
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
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
          <button
            className="landing__link"
            type="button"
            onClick={() => scrollToSection(pricingRef)}
          >
            PRICING
          </button>
          <button
            className="landing__link"
            type="button"
            onClick={() => scrollToSection(hallOfFlexRef)}
          >
            HALL OF FLEX
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
