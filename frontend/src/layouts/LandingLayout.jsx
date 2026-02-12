import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";

export const LandingLayout = ({ user, onLogout }) => {
  const pricingRef = useRef(null);
  const hallOfFlexRef = useRef(null);

  return (
    <div className="landing landing--shell">
      <Header
        user={user}
        onLogout={onLogout}
        pricingRef={pricingRef}
        hallOfFlexRef={hallOfFlexRef}
      />
      <div className="landing__page-content">
        <Outlet context={{ pricingRef, hallOfFlexRef }} />
      </div>
      <LandingFooter />
    </div>
  );
};
