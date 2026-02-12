import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../components/UI.jsx";
import { useAuth } from "../hooks/useAuth.js";

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [errors, setErrors] = useState({});
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setIsRegister(mode === "register");
    setErrors({});
  }, [mode]);

  const validateForm = () => {
    const newErrors = {};

    if (isRegister && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      console.warn("[Auth] Validation failed:", newErrors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Only clear field-specific errors, not the submit error
    if (errors[name] && name !== "submit") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Start loading state
    setIsSubmitting(true);

    try {
      console.log(
        `[Auth] Attempting ${isRegister ? "registration" : "login"}...`,
      );
      let user;
      if (isRegister) {
        user = await register(formData.name, formData.email, formData.password);
      } else {
        user = await login(formData.email, formData.password);
      }

      console.log("[Auth] Success:", user);
      // Only navigate on successful authentication
      if (user && user.role) {
        // Navigate immediately - auth state is now updated
        // ProtectedRoute will check isInitializing to prevent flicker
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      // Stop loading immediately on error
      setIsSubmitting(false);

      // Stay on page and show error - do NOT navigate
      console.error(
        `[Auth] ${isRegister ? "Registration" : "Login"} failed:`,
        err,
      );
      console.error("[Auth] Error message:", err.message);
      console.error("[Auth] Error details:", err);

      const errorMessage = (
        err.message || "Authentication failed"
      ).toLowerCase();

      // Determine the error message to display
      let displayError = "";

      // Check for specific error types
      if (
        errorMessage.includes("email") &&
        (errorMessage.includes("not found") ||
          errorMessage.includes("does not exist") ||
          errorMessage.includes("not exist"))
      ) {
        displayError =
          "❌ Email not found. Please check your email or create a new account.";
      } else if (
        errorMessage.includes("password") &&
        (errorMessage.includes("incorrect") ||
          errorMessage.includes("invalid") ||
          errorMessage.includes("wrong"))
      ) {
        displayError = "❌ Incorrect password. Please try again.";
      } else if (
        errorMessage.includes("credentials") ||
        errorMessage.includes("unauthorized")
      ) {
        displayError =
          "❌ Invalid email or password. Please check your credentials.";
      } else if (
        errorMessage.includes("email") &&
        errorMessage.includes("exists")
      ) {
        displayError = "❌ Email already registered. Please login instead.";
      } else if (
        errorMessage.includes("fetch") ||
        errorMessage.includes("network")
      ) {
        displayError =
          "❌ Network error. Please check your connection and try again.";
      } else if (
        errorMessage.includes("500") ||
        errorMessage.includes("server")
      ) {
        displayError = "❌ Server error. Please try again later.";
      } else {
        // Always show some error message with the actual backend message
        displayError = `❌ ${err.message || "Authentication failed. Please try again."}`;
      }

      console.error("[Auth] Displaying error to user:", displayError);

      // Set the error in state to display in UI
      setErrors({ submit: displayError });

      // Ensure we stop loading and don't proceed
      return;
    }
  };

  return (
    <main className="auth-section">
      <div className="auth-card">
        <h1 className="auth-card__title">
          {isRegister ? "CREATE ACCOUNT" : "LOGIN"}
        </h1>

        {/* Debug: Show if we have any errors */}
        {console.log("[Auth] Current errors state:", errors)}

        {/* Error display - Multiple methods to ensure visibility */}
        {errors.submit && (
          <>
            <div
              className="auth-card__alert"
              role="alert"
              style={{
                background: "rgba(239, 68, 68, 0.4)",
                border: "3px solid #ef4444",
                color: "#ffffff",
                padding: "1rem",
                borderRadius: "0.85rem",
                marginBottom: "1.5rem",
                fontSize: "0.95rem",
                fontWeight: "600",
                textAlign: "center",
                display: "block",
                zIndex: 1000,
              }}
            >
              {errors.submit}
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <Input
              name="name"
              label="NAME"
              placeholder="Your name"
              required
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              disabled={isSubmitting}
            />
          )}

          <Input
            type="email"
            name="email"
            label={isRegister ? "EMAIL" : "EMAIL & PASSWORD"}
            placeholder={
              isRegister ? "your@email.com" : "Email & password fields"
            }
            required
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={isSubmitting}
          />

          <Input
            type="password"
            name="password"
            label={isRegister ? "PASSWORD" : ""}
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            disabled={isSubmitting}
          />

          {isRegister && (
            <Input
              type="password"
              name="confirmPassword"
              label="CONFIRM PASSWORD"
              placeholder="Confirm password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              disabled={isSubmitting}
            />
          )}

          <Button
            variant="primary"
            className="ng-button--block auth-card__cta"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "PLEASE WAIT..."
              : isRegister
                ? "CREATE ACCOUNT"
                : "LOGIN"}
          </Button>
        </form>

        <div className="auth-card__footer">
          <button
            type="button"
            onClick={() => navigate(isRegister ? "/login" : "/register")}
          >
            {isRegister
              ? "Already have an account? Login"
              : "New here? Create account"}
          </button>
        </div>

        {!isRegister && (
          <a href="/forgot-password" className="auth-card__link">
            Forgot password?
          </a>
        )}
      </div>
    </main>
  );
};

export const LoginPage = () => <AuthPage mode="login" />;
export const RegisterPage = () => <AuthPage mode="register" />;
