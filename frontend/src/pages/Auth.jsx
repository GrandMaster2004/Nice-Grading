import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../components/UI.jsx";
import { useAuth } from "../hooks/useAuth.js";

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const { login, register, loading, error: authError } = useAuth();
  const [errors, setErrors] = useState({});
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    setIsRegister(mode === "register");
  }, [mode]);

  useEffect(() => {
    // Simulate page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      let user;
      if (isRegister) {
        user = await register(data.name, data.email, data.password);
      } else {
        user = await login(data.email, data.password);
      }

      // Route based on user role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  return (
    <main
      className={`auth-section ${isPageLoading ? "is-loading" : "is-loaded"}`}
    >
      {isPageLoading && (
        <div className="loading-screen">
          <div className="stacked-cards">
            <div className="stacked-cards__card stacked-cards__card--top"></div>
            <div className="stacked-cards__card stacked-cards__card--middle"></div>
            <div className="stacked-cards__card stacked-cards__card--bottom"></div>
          </div>
        </div>
      )}
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
              error={errors.name}
              disabled={loading}
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
            error={errors.email}
            disabled={loading}
          />

          <Input
            type="password"
            name="password"
            label={isRegister ? "PASSWORD" : ""}
            placeholder="Password"
            required
            error={errors.password}
            disabled={loading}
          />

          {isRegister && (
            <Input
              type="password"
              name="confirmPassword"
              label="CONFIRM PASSWORD"
              placeholder="Confirm password"
              required
              error={errors.confirmPassword}
              disabled={loading}
            />
          )}

          <Button
            variant="primary"
            className="ng-button--block auth-card__cta"
            type="submit"
            disabled={loading}
          >
            {isRegister ? "CREATE ACCOUNT" : "LOGIN"}
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
