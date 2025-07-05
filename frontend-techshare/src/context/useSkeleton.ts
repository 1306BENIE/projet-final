import { useContext } from "react";
import { SkeletonContext } from "./SkeletonContext";

export const useSkeleton = () => useContext(SkeletonContext);
