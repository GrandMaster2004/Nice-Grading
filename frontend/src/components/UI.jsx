const combine = (...classes) => classes.filter(Boolean).join(" ");

export const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const variants = {
    primary: "ng-button--primary",
    secondary: "ng-button--secondary",
    ghost: "ng-button--ghost",
    danger: "ng-button--danger",
  };

  const variantClass = variants[variant] || variants.primary;

  return (
    <button
      className={combine("ng-button", variantClass, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className={combine("ng-field", className)}>
      {label && <label className="ng-field__label">{label}</label>}
      <input
        className={combine(
          "ng-field__control",
          error ? "ng-field__control--error" : "",
        )}
        {...props}
      />
      {error && <p className="ng-field__error">{error}</p>}
    </div>
  );
};

export const Select = ({ label, error, options, className = "", ...props }) => {
  return (
    <div className={combine("ng-field", className)}>
      {label && <label className="ng-field__label">{label}</label>}
      <select
        className={combine(
          "ng-field__control",
          "ng-field__control--select",
          error ? "ng-field__control--error" : "",
        )}
        {...props}
      >
        <option value="">Select...</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="ng-field__error">{error}</p>}
    </div>
  );
};

export const Card = ({ children, className = "" }) => {
  return <div className={combine("ng-card", className)}>{children}</div>;
};

export const LoadingSkeleton = ({ lines = 3 }) => {
  return (
    <div className="ng-skeleton">
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="ng-skeleton__line"></div>
        ))}
    </div>
  );
};

export const Toast = ({ message, type = "info", onClose }) => {
  const typeClass = {
    success: "ng-toast--success",
    error: "ng-toast--error",
    info: "ng-toast--info",
  }[type];

  return (
    <div className={combine("ng-toast", typeClass)}>
      <span>{message}</span>
      <button onClick={onClose} className="ng-toast__close" aria-label="Close">
        ×
      </button>
    </div>
  );
};
