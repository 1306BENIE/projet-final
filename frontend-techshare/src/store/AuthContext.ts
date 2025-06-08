import { createContext } from "react";
import type { AuthContextType } from "@/interfaces/auth";
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
