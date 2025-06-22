import axios from "axios";

// Configuration de base d'axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important pour les cookies d'authentification
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Token présent:", !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Headers de la requête:", config.headers);
    }
    return config;
  },
  (error) => {
    console.error("Erreur dans l'intercepteur de requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erreur API:", error.response?.status, error.response?.data);
    const originalRequest = error.config;

    // Si l'erreur est 401 (non autorisé)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // On déconnecte l'utilisateur et on le redirige
      // C'est la solution la plus simple et sécurisée pour gérer les tokens invalides/expirés
      // qui ne sont pas gérés par un système de refresh token complexe.
      localStorage.removeItem("token");
      // Si vous utilisez un refresh token, supprimez-le aussi
      // localStorage.removeItem("refreshToken");

      // Dispatch un événement pour que l'app puisse réagir (par exemple, AuthContext)
      window.dispatchEvent(new Event("auth-error"));

      // On redirige vers la page de connexion
      // Utiliser window.location.href assure une redirection complète qui nettoie l'état de l'app.
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
