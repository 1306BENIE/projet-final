import { useState } from "react";
import api from "../../services/api";
import { Button } from "../ui/Button/Button";
import { AxiosError } from "axios";

export const ConnectionTest = () => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const testConnection = async () => {
    try {
      setStatus("loading");
      setError("");
      const response = await api.get("/test/ping");
      setMessage(response.data.message);
      setStatus("success");
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message || "Une erreur est survenue");
      setStatus("error");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Test de connexion</h2>

      <Button
        variant="primary"
        onClick={testConnection}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Test en cours..." : "Tester la connexion"}
      </Button>

      {status === "success" && (
        <div className="p-4 bg-green-100 text-green-800 rounded-md">
          {message}
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          Erreur : {error}
        </div>
      )}
    </div>
  );
};
