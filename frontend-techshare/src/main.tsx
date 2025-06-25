import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/App.css";
import App from "./App.tsx";
import { validateConfiguration } from "@/lib/config";

// Valider la configuration au démarrage
validateConfiguration();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
