import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, PlusCircle, Search, ChevronDown } from "lucide-react";
import { Tool } from "@/interfaces/tools/tool";
import { toolService } from "@/services/toolService";
import { useNavigate } from "react-router-dom";
import ToolCard from "@/components/features/tools/ToolCard";
import SkeletonToolCard from "@/components/home/SkeletonToolCard";

export default function MyTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      const userTools = await toolService.getUserTools();
      setTools(userTools);
    } catch (err) {
      setError("Erreur lors du chargement de vos outils");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await toolService.deleteTool(id);
      setTools(tools.filter((tool) => String(tool.id) !== id));
    } catch (err) {
      setError("Erreur lors de la suppression de l'outil");
      console.error(err);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/tools/${id}/edit`);
  };

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || tool.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50/50 to-violet-50/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonToolCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50/50 to-violet-50/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-3 text-red-500 bg-red-50 px-6 py-4 rounded-xl shadow-lg">
              <AlertCircle className="w-6 h-6" />
              <span className="text-lg font-medium">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50/50 to-violet-50/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Vous n'avez pas encore d'outils
              </h2>
              <p className="text-gray-600 mb-8">
                Commencez à partager vos outils technologiques avec la
                communauté
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/tools/add")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 text-white rounded-xl hover:from-cyan-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusCircle className="w-5 h-5" />
                Ajouter un outil
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/50 to-violet-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Mes outils
              </h1>
              <p className="text-gray-600">
                Gérez vos outils technologiques partagés
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/tools/add")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 text-white rounded-xl hover:from-cyan-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <PlusCircle className="w-5 h-5" />
              Ajouter un outil
            </motion.button>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-500" />
              <input
                type="text"
                placeholder="Rechercher un outil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="available">Disponible</option>
                <option value="rented">En location</option>
                <option value="maintenance">En maintenance</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={index}
              onEdit={() => handleEdit(String(tool.id))}
              onDelete={() => handleDelete(String(tool.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
