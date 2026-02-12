import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../components/UI.jsx";
import { useAuth } from "../hooks/useAuth.js";

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const { login, register, loading, error: authError } = useAuth();
  const [errors, setErrors] = useState({});
  const [isRegister, setIsRegister] = useState(mode === "register");
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

    if (!validateForm()) {
      return;
    }

    try {
      let user;
      if (isRegister) {
        user = await register(formData.name, formData.email, formData.password);
      } else {
        user = await login(formData.email, formData.password);
      }

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred.";

      if (errorMessage.toLowerCase().includes("email does not exist")) {
        setErrors({ email: "Email does not exist." });
      } else if (
        errorMessage.toLowerCase().includes("incorrect password") ||
        errorMessage.toLowerCase().includes("invalid password")
      ) {
        setErrors({ password: "Incorrect password." });
      } else {
        setErrors({ submit: errorMessage });
      }
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
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={loading}
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
            disabled={loading}
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
