import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function RedirectAfterAuth() {
  const { isAuthenticated } = useAuth();
  console.log("RedirectAfterAuth - isAuthenticated:", isAuthenticated);

  if (isAuthenticated) {
    console.log("Redirecting to /home");
    return <Navigate to="/home" replace />;
  }

  console.log("Redirecting to /home");
  return <Navigate to="/home" replace />;
}
