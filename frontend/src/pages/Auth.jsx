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

    if (errors[name]) {
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
        // Small delay to show success state before navigation
        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 100);
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

      // Check for specific error types
      if (
        errorMessage.includes("email") &&
        (errorMessage.includes("not found") ||
          errorMessage.includes("does not exist") ||
          errorMessage.includes("not exist"))
      ) {
        setErrors({
          submit:
            "❌ Email not found. Please check your email or create a new account.",
        });
      } else if (
        errorMessage.includes("password") &&
        (errorMessage.includes("incorrect") ||
          errorMessage.includes("invalid") ||
          errorMessage.includes("wrong"))
      ) {
        setErrors({ submit: "❌ Incorrect password. Please try again." });
      } else if (
        errorMessage.includes("credentials") ||
        errorMessage.includes("unauthorized")
      ) {
        setErrors({
          submit:
            "❌ Invalid email or password. Please check your credentials.",
        });
      } else if (
        errorMessage.includes("email") &&
        errorMessage.includes("exists")
      ) {
        setErrors({
          submit: "❌ Email already registered. Please login instead.",
        });
      } else if (
        errorMessage.includes("fetch") ||
        errorMessage.includes("network")
      ) {
        setErrors({
          submit:
            "❌ Network error. Please check your connection and try again.",
        });
      } else if (
        errorMessage.includes("500") ||
        errorMessage.includes("server")
      ) {
        setErrors({
          submit: "❌ Server error. Please try again later.",
        });
      } else {
        // Always show some error message with the actual backend message
        setErrors({
          submit: `❌ ${err.message || "Authentication failed. Please try again."}`,
        });
      }

      console.error("[Auth] Error displayed to user:", errors.submit);

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

        {errors.submit && (
          <div className="auth-card__alert">{errors.submit}</div>
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
