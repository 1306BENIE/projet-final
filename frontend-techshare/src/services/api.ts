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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 (non autorisé) et que nous n'avons pas déjà essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentative de rafraîchir le token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await api.post("/auth/refresh", { refreshToken });
          const { token } = response.data;

          // Mise à jour du token
          localStorage.setItem("token", token);

          // Mise à jour de l'en-tête de la requête originale
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // Réessayer la requête originale
          return api(originalRequest);
        }
      } catch (error) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        console.error("Erreur lors du rafraîchissement du token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
