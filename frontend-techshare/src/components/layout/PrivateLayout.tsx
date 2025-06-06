import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivateLayout() {
  const location = useLocation();

  // Masquer la navbar sur /tools/add et /tools/edit et leurs sous-routes
  const hideHeader =
    location.pathname.startsWith("/tools/add") ||
    location.pathname.startsWith("/tools/edit");

  return (
    <div className="min-h-screen flex flex-col bg-light">
      {!hideHeader && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
