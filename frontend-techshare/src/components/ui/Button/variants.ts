export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "ghost"
  | "outline";

export const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-waouh hover:bg-primary-dark focus:ring-primary-light disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed",
  secondary:
    "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary-light",
  accent: "bg-accent text-white hover:bg-accent/80 focus:ring-accent",
  danger: "bg-danger text-white hover:bg-danger/80 focus:ring-danger",
  ghost:
    "bg-transparent text-primary border border-primary hover:bg-primary/10",
  outline:
    "bg-transparent text-primary border border-primary hover:bg-primary/5",
};

export { variantClasses as buttonVariants };
