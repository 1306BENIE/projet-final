import React from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      className,
      type = "text",
      showPasswordToggle = false,
      ...props
    },
    ref
  ) => {
    const [show, setShow] = React.useState(false);
    const isPassword = type === "password" && showPasswordToggle;
    return (
      <div className="w-full mb-4">
        {label && (
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
          </label>
        )}
        <div
          className={clsx(
            "relative flex items-center",
            error ? "animate-shake" : ""
          )}
        >
          {Icon && (
            <span className="absolute left-3 text-gray-400 pointer-events-none">
              <Icon size={18} />
            </span>
          )}
          <input
            ref={ref}
            type={isPassword ? (show ? "text" : "password") : type}
            className={clsx(
              "w-full py-2 px-3 pl-10 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary-light bg-white dark:bg-dark text-gray-900 dark:text-white transition-all duration-200 outline-none shadow-soft",
              error && "border-danger focus:border-danger focus:ring-danger/30",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 text-gray-400 hover:text-primary focus:outline-none"
              onClick={() => setShow((v) => !v)}
              aria-label={
                show ? "Masquer le mot de passe" : "Afficher le mot de passe"
              }
            >
              {show ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7-2c0 5.523-4.477 10-10 10S2 15.523 2 10 6.477 0 12 0s10 4.477 10 10z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <span
            id={label ? `${label}-error` : undefined}
            className="text-danger text-xs mt-1 block"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
