import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth.js";
import { getToken } from "./utils/api.js";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { LandingLayout } from "./layouts/LandingLayout.jsx";
import { LandingPage } from "./pages/Landing.jsx";
import { LoginPage, RegisterPage } from "./pages/Auth.jsx";
import { ForgotPasswordPage } from "./pages/ForgotPassword.jsx";
import { ResetPasswordPage } from "./pages/ResetPassword.jsx";
import { NotFoundPage } from "./pages/NotFound.jsx";
import { DashboardPage } from "./pages/Dashboard.jsx";
import { AddCardsPage } from "./pages/AddCards.jsx";
import { SubmissionReviewPage } from "./pages/SubmissionReview.jsx";
import { PaymentPage } from "./pages/Payment.jsx";
import { ConfirmationPage } from "./pages/Confirmation.jsx";
import { AdminPage } from "./pages/Admin.jsx";
import "./index.css";

function LandingRouteGuard({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AuthRouteGuard({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { user, isInitializing, logout, isAdmin } = useAuth();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer;
    if (isInitializing) {
      // Show loader immediately for initial auth check
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timer);
  }, [isInitializing]);

  if (showLoader) {
    return (
      <div className="loading-screen">
        <div className="stacked-cards">
          <div className="stacked-cards__card stacked-cards__card--top"></div>
          <div className="stacked-cards__card stacked-cards__card--middle"></div>
          <div className="stacked-cards__card stacked-cards__card--bottom"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<LandingLayout user={user} onLogout={logout} />}>
          <Route
            path="/"
            element={
              <LandingRouteGuard>
                <LandingPage />
              </LandingRouteGuard>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRouteGuard>
                <LoginPage />
              </AuthRouteGuard>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRouteGuard>
                <RegisterPage />
              </AuthRouteGuard>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-cards"
          element={
            <ProtectedRoute>
              <AddCardsPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submission-review"
          element={
            <ProtectedRoute>
              <SubmissionReviewPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <ConfirmationPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
