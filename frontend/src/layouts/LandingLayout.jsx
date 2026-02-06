import { Outlet } from "react-router-dom";
import { Footer, Header } from "./MainLayout.jsx";

export const LandingLayout = ({ user, onLogout }) => {
  return (
    <div className="landing landing--shell">
      <Header user={user} onLogout={onLogout} />
      <div className="landing__page-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
