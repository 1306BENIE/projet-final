import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  if (
    location.pathname.startsWith("/tools/add") ||
    location.pathname.startsWith("/tools/edit")
  ) {
    return null;
  }

  return (
    <footer className="relative bg-gradient-to-b from-white via-gray-50/50 to-gray-100/70 overflow-hidden">
      {/* Effet de particules */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg">
                  <span className="font-['Poppins'] font-bold text-2xl text-[#000]">
                    TechShare
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                La plateforme de location d'outils informatiques <br /> entre
                particuliers en Côte d'Ivoire.
              </p>
              <div className="flex gap-4">
                {/* Socials */}
                <a
                  href="#"
                  className="bg-white p-2 rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 text-gray-400 hover:text-primary"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 2.1v3.2h-1.5c-.4 0-.5.2-.5.6v1.6h2.1l-.3 2.3h-1.8V22h-3.1V9.8h-1.6V7.5h1.6V6c0-1.7 1-2.7 2.7-2.7.8 0 1.5.1 1.7.1z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-white p-2 rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 text-gray-400 hover:text-primary"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3.2" />
                    <path d="M16.8 2H7.2A5.2 5.2 0 0 0 2 7.2v9.6A5.2 5.2 0 0 0 7.2 22h9.6A5.2 5.2 0 0 0 22 16.8V7.2A5.2 5.2 0 0 0 16.8 2zm-4.8 15.2A4.2 4.2 0 1 1 16.2 13a4.2 4.2 0 0 1-4.2 4.2zm5.4-7.7a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-white p-2 rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 text-gray-400 hover:text-primary"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 5.8c-.8.4-1.6.6-2.5.8.9-.5 1.6-1.4 2-2.3-.8.5-1.7.9-2.6 1.1C17.8 4.5 16.7 4 15.5 4c-2.3 0-4.1 1.9-4.1 4.1 0 .3 0 .6.1.8C7.7 8.7 4.1 6.9 1.7 4.2c-.3.6-.5 1.3-.5 2 0 1.4.7 2.6 1.8 3.3-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4.1-.3.1-.7.2-1.1.2-.3 0-.5 0-.7-.1.5 1.6 2 2.8 3.7 2.8-1.4 1.1-3.1 1.7-4.9 1.7-.3 0-.6 0-.8-.1C2.9 20.1 6.3 21.5 10 21.5c6.2 0 9.6-5.1 9.6-9.6v-.4c.7-.5 1.3-1.2 1.8-2z" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Links */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-['Poppins'] font-semibold text-primary mb-6 text-lg">
                  Navigation
                </h4>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/home"
                      className="text-gray-600 hover:text-primary text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tools"
                      className="text-gray-600 hover:text-primary text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      Outils disponibles
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/how-it-works"
                      className="text-gray-600 hover:text-primary text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      Comment ça marche
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-['Poppins'] font-semibold text-primary mb-6 text-lg">
                  Support
                </h4>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/contact"
                      className="text-gray-600 hover:text-primary text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="text-gray-600 hover:text-primary text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="text-gray-600 hover:text-primary text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      Conditions d'utilisation
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Contact */}
            <div>
              <h4 className="font-['Poppins'] font-semibold text-primary mb-6 text-lg">
                Contact
              </h4>
              <ul className="space-y-4">
                <li className="text-gray-600 text-sm flex items-center gap-2 hover:text-primary transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  contact@techshare.ci
                </li>
                <li className="text-gray-600 text-sm flex items-center gap-2 hover:text-primary transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +225 01 523 431 11
                </li>
                <li className="text-gray-600 text-sm flex items-center gap-2 hover:text-primary transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Abidjan, Côte d'Ivoire
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-100/50">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-['Poppins'] font-semibold text-primary">
              TechShare
            </span>
            . Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
