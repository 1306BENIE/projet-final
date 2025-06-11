import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivateLayout() {
  const location = useLocation();

  // Masquer la navbar et le footer sur /tools/add, /tools/:id/edit et leurs sous-routes
  const hideHeader =
    location.pathname.startsWith("/tools/add") ||
    (location.pathname.includes("/tools/") &&
      location.pathname.includes("/edit"));

  return (
    <div className="min-h-screen flex flex-col bg-light">
      {!hideHeader && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideHeader && <Footer />}
    </div>
  );
}
