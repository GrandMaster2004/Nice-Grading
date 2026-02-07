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
import { DashboardPage } from "./pages/Dashboard.jsx";
import { AddCardsPage } from "./pages/AddCards.jsx";
import { SubmissionReviewPage } from "./pages/SubmissionReview.jsx";
import { PaymentPage } from "./pages/Payment.jsx";
import { ConfirmationPage } from "./pages/Confirmation.jsx";
import { AdminPage } from "./pages/Admin.jsx";
import "./index.css";

function App() {
  const { user, loading, logout, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="ng-loading-screen">
        <p className="ng-loading-screen__text">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<LandingLayout user={user} onLogout={logout} />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
