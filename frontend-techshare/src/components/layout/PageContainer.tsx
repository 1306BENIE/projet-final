import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main
      className={`relative min-h-screen pb-20 overflow-x-hidden box-border ${className}`}
    >
      {/* Fond dégradé dynamique */}
      <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 animate-gradient-x opacity-90" />
      {/* Overlay lumineux */}
      <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-t from-white/80 via-white/60 to-transparent" />
      {children}
    </main>
  );
}
