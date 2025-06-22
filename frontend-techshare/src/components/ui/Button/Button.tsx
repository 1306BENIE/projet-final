import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";
import clsx from "clsx";
import { ButtonVariant, variantClasses } from "./variants";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-2.5 text-base rounded-2xl",
  lg: "px-8 py-3 text-lg rounded-full",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.04 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={clsx(
        "relative font-semibold flex items-center justify-center gap-2 transition-all duration-200 outline-none focus:ring-2",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        <>
          {leftIcon && (
            <span className="mr-1 flex items-center">{leftIcon}</span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span className="ml-1 flex items-center">{rightIcon}</span>
          )}
        </>
      )}
    </motion.button>
  );
};
