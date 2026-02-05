export const Header = ({ user, onLogout }) => {
  return (
    <header className="ng-header">
      <div className="ng-header__content">
        <div className="ng-header__logo">NG</div>
        <div className="ng-header__actions">
          <input
            type="search"
            placeholder="Search Grading"
            className="ng-header__search"
          />
          <div className="ng-header__meta">
            {user && <span className="ng-header__user">{user.name}</span>}
            <button onClick={onLogout} className="ng-header__logout">
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Container = ({ children }) => {
  return <div className="ng-layout-container">{children}</div>;
};
