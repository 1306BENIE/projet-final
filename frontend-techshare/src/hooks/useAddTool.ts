import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toolService } from "@/services/toolService";

/**
 * Hook personnalisé pour gérer l'ajout d'un outil
 */
export const useAddTool = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const addTool = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);

      // Appeler le service pour créer l'outil
      const newTool = await toolService.createTool(formData);

      if (!newTool) {
        throw new Error("Erreur lors de la création de l'outil");
      }

      // Rediriger vers la liste des outils après création
      navigate("/tools");
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'outil:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addTool,
    loading,
    error,
  };
};
