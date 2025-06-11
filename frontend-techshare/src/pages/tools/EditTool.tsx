import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toolService } from "@/services/toolService";
import { toast } from "react-hot-toast";
import ToolForm from "@/components/forms/ToolForm";
import { AddToolFormData } from "@/interfaces/tools/add-tool";

export default function EditTool() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<AddToolFormData | null>(null);

  useEffect(() => {
    async function fetchTool() {
      try {
        setLoading(true);
        console.log("ID de l'outil à éditer:", id);
        console.log("Type de l'ID:", typeof id);
        console.log("Longueur de l'ID:", id?.length);
        const t = await toolService.getToolById(id as string);
        if (!t) throw new Error("Outil introuvable");

        const formData: AddToolFormData = {
          name: t.name,
          brand: t.brand,
          modelName: t.model,
          description: t.description,
          category: t.category as
            | "bricolage"
            | "jardinage"
            | "nettoyage"
            | "cuisine"
            | "informatique"
            | "autre",
          etat: t.etat as "neuf" | "bon_etat" | "usage",
          dailyPrice: t.dailyPrice,
          caution: t.caution,
          isInsured: t.isInsured,
          location: {
            type: "Point",
            coordinates: t.location.coordinates,
            address: t.address,
          },
          images: t.images || [],
        };

        setTool(formData);
      } catch (err) {
        console.error("Erreur lors du chargement de l'outil:", err);
        toast.error("Erreur lors du chargement de l'outil");
        navigate("/my-tools");
      } finally {
        setLoading(false);
      }
    }
    fetchTool();
  }, [id, navigate]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const data = new FormData();

      // Ajouter les champs de base
      for (const [key, value] of formData.entries()) {
        if (key !== "images" && key !== "location" && key !== "address") {
          data.append(key, value);
        }
      }

      // Gérer la localisation
      if (tool?.location) {
        const locationData = {
          type: "Point",
          coordinates: tool.location.coordinates,
        };
        data.append("location", JSON.stringify(locationData));
        // S'assurer que l'adresse est une chaîne de caractères
        const address = Array.isArray(tool.location.address)
          ? tool.location.address[0]
          : tool.location.address;
        data.append("address", address);
      }

      // Gérer les images
      const existingImages = tool?.images || [];
      const newImages = Array.from(formData.getAll("images")) as File[];

      // Ajouter les images existantes
      existingImages.forEach((imageUrl, index) => {
        data.append(`existingImages[${index}]`, imageUrl);
      });

      // Ajouter les nouvelles images
      newImages.forEach((file) => {
        data.append("newImages", file);
      });

      // Ajouter un flag pour indiquer qu'il y a des images existantes
      if (existingImages.length > 0) {
        data.append("hasExistingImages", "true");
      }

      await toolService.updateTool(id as string, data);
      toast.success("Outil modifié avec succès");
      navigate("/tools");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error("Erreur lors de la modification de l'outil");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tool) {
    return null;
  }

  return (
    <ToolForm
      initialData={tool}
      onSubmit={handleSubmit}
      submitLabel="Enregistrer les modifications"
      title="Modifier l'outil"
      description="Modifiez les informations de votre outil ci-dessous."
    />
  );
}
