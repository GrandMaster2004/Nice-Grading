import { Outlet } from "react-router-dom";
import { Header } from "./MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";

export const LandingLayout = ({ user, onLogout }) => {
  return (
    <div className="landing landing--shell">
      <Header user={user} onLogout={onLogout} />
      <div className="landing__page-content">
        <Outlet />
      </div>
      <LandingFooter />
    </div>
  );
};
