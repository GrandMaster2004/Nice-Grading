import { useNavigate } from "react-router-dom";

export const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const showAuth = Boolean(user);
  const isAdmin = user?.role === "admin";

  const handleUserClick = () => {
    // Route admins to admin panel, customers to dashboard
    navigate(isAdmin ? "/admin" : "/dashboard");
  };

  return (
    <header className="ng-header">
      <div className="ng-header__content">
        <div
          className="ng-header__logo"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              navigate("/");
            }
          }}
        >
          NICE G.
        </div>

        <nav className="ng-header__nav" aria-label="Primary">
          <a className="ng-header__link" href="#pricing">
            PRICING
          </a>
          <a className="ng-header__link" href="#hall-of-flex">
            HALL OF FLEX
          </a>
          <button className="ng-header__icon" type="button" aria-label="Search">
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
        </nav>

        <div className="ng-header__actions">
          {showAuth ? (
            <>
              <button
                className="ng-header__user"
                type="button"
                onClick={handleUserClick}
              >
                {user.name}
              </button>
              <button
                onClick={onLogout}
                className="ng-header__action"
                type="button"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="ng-header__action"
                type="button"
              >
                LOGIN
              </button>
              <button
                onClick={() => navigate("/register")}
                className="ng-header__action ng-header__action--primary"
                type="button"
              >
                START
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export const Container = ({ children }) => {
  return <div className="ng-layout-container">{children}</div>;
};

export const Footer = () => {
  return (
    <footer className="ng-footer">
      <div className="ng-footer__content">
        <span className="ng-footer__brand">NICE G.</span>
        <span>© 2026 NICE G. ALL RIGHTS RESERVED</span>
      </div>
    </footer>
  );
};
