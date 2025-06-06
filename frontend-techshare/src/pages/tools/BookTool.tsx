import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useBooking } from "@/hooks/useBooking";
import BookingForm from "@/components/forms/BookingForm";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Tool {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface BookingFormData {
  startDate: Date | null;
  endDate: Date | null;
  notes?: string;
}

export default function BookTool() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking, loadingStates } = useBooking();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données de l'outil
    const loadTool = async () => {
      try {
        // TODO: Remplacer par un appel API réel
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTool({
          id: id || "",
          name: "Outil de test",
          price: 5000,
          image: "https://via.placeholder.com/300",
        });
      } catch (error) {
        console.error("Error loading tool:", error);
        toast.error("Erreur lors du chargement de l'outil");
      } finally {
        setLoading(false);
      }
    };

    loadTool();
  }, [id]);

  const handleSubmit = async (data: BookingFormData) => {
    if (!user || !tool || !data.startDate || !data.endDate) return;

    try {
      const booking = await createBooking({
        toolId: tool.id,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
      });

      if (booking) {
        toast.success("Réservation effectuée avec succès !");
        navigate("/my-bookings");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Erreur lors de la réservation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-500">Chargement de l'outil...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Outil non trouvé
          </h2>
          <p className="text-gray-500 mb-4">
            L'outil que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => navigate("/tools")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retour aux outils
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Réserver {tool.name}
            </h1>
            <BookingForm
              onSubmit={handleSubmit}
              isLoading={loadingStates.create}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
