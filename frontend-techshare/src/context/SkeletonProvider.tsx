import { useState, ReactNode } from "react";
import { SkeletonContext } from "./SkeletonContext";

export const SkeletonProvider = ({ children }: { children: ReactNode }) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  return (
    <SkeletonContext.Provider value={{ showSkeleton, setShowSkeleton }}>
      {children}
    </SkeletonContext.Provider>
  );
};
