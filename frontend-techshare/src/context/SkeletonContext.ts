import { createContext } from "react";

export interface SkeletonContextType {
  showSkeleton: boolean;
  setShowSkeleton: (v: boolean) => void;
}

export const SkeletonContext = createContext<SkeletonContextType>({
  showSkeleton: false,
  setShowSkeleton: () => {},
});
