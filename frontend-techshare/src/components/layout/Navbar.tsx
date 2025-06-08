import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, User, Wrench, Calendar } from "lucide-react";
import { useAuth } from "@/store/useAuth";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!user?.firstName || !user?.lastName) return "U";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Gestion du menu déroulant avec délai
  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setUserMenuOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 300); // Délai de 300ms avant la fermeture
  };

  // Nettoyage du timeout lors du démontage
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  if (
    location.pathname.startsWith("/tools/add") ||
    location.pathname.startsWith("/tools/edit")
  ) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur shadow-md">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 py-3 md:py-4">
        <div className="flex items-center gap-2">
          <span className="font-['Poppins'] font-extrabold text-2xl text-primary tracking-tight">
            TechShare
          </span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <Link
            to="/home"
            className="text-primary font-semibold hover:text-accent transition-colors"
          >
            Accueil
          </Link>
          <Link
            to="/tools"
            className="text-primary font-semibold hover:text-accent transition-colors"
          >
            Outils
          </Link>
          <Link
            to="/how-it-works"
            className="text-primary font-semibold hover:text-accent transition-colors"
          >
            Comment ça marche
          </Link>
          {isAuthenticated ? (
            <div className="relative">
              <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="w-10 h-10 rounded-full bg-primary text-black font-semibold flex items-center justify-center border-1 hover:bg-primary-dark transition-colors"
              >
                {getUserInitials()}
              </button>
              {userMenuOpen && (
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100"
                >
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mon Profil
                  </Link>
                  <Link
                    to="/my-tools"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    Mes Outils
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Mes Réservations
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-4 py-2 rounded-md font-semibold bg-[#c4e9ff1c] text-primary border border-primary shadow-sm hover:bg-primary hover:text-primary hover:shadow-md transition-all duration-200 max-w-xs mx-auto sm:mx-0 sm:w-auto"
              >
                Se connecter
              </Link>
              <Link
                to="/auth/register"
                className="px-4 py-2 rounded-md font-semibold bg-[#7c3aed] text-white border border-primary shadow-sm hover:bg-primary-dark hover:shadow-lg transition-all duration-200 max-w-xs mx-auto sm:mx-0 sm:w-auto"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
        <button
          className="md:hidden p-2 rounded-lg hover:bg-primary/10"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="w-7 h-7 text-primary" />
        </button>
      </nav>
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="flex flex-col gap-2 px-2 py-3">
            <Link
              to="/home"
              className="text-primary font-semibold hover:text-accent"
              onClick={() => setMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/tools"
              className="text-primary font-semibold hover:text-accent"
              onClick={() => setMenuOpen(false)}
            >
              Outils
            </Link>
            <Link
              to="/how-it-works"
              className="text-primary font-semibold hover:text-accent"
              onClick={() => setMenuOpen(false)}
            >
              Comment ça marche
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-primary font-semibold hover:text-accent"
                  onClick={() => setMenuOpen(false)}
                >
                  Mon Profil
                </Link>
                <Link
                  to="/my-tools"
                  className="text-primary font-semibold hover:text-accent"
                  onClick={() => setMenuOpen(false)}
                >
                  Mes Outils
                </Link>
                <Link
                  to="/my-bookings"
                  className="text-primary font-semibold hover:text-accent"
                  onClick={() => setMenuOpen(false)}
                >
                  Mes Réservations
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="font-semibold bg-white text-red-600 border border-red-200 rounded-xl px-4 py-2 mt-1 shadow-sm hover:bg-red-100 hover:text-red-800 hover:shadow-lg transition-all duration-200 max-w-xs self-start"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="font-semibold bg-white text-primary border border-primary rounded-xl px-4 py-2 mt-1 shadow-sm hover:bg-primary hover:text-white hover:shadow-lg transition-all duration-200 max-w-xs self-start"
                  onClick={() => setMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/register"
                  className="font-semibold bg-primary text-white border border-primary rounded-xl px-4 py-2 mt-1 shadow-sm hover:bg-primary-dark hover:shadow-lg transition-all duration-200 max-w-xs self-start"
                  onClick={() => setMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
