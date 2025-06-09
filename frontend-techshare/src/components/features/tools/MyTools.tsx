import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash2,
  AlertCircle,
  PlusCircle,
  Search,
  MapPin,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Tool } from "@/interfaces/tools/tool";
import { toolService } from "@/services/toolService";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function MyTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalDescription, setModalDescription] = useState<Tool | null>(null);
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet outil ?")) {
      try {
        await toolService.deleteTool(id);
        setTools(tools.filter((tool) => String(tool.id) !== id));
      } catch (err) {
        setError("Erreur lors de la suppression de l'outil");
        console.error(err);
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/tools/edit/${id}`);
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
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
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

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

          {/* Search and Filter Bar */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          <AnimatePresence>
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-cyan-200 h-[380px] flex flex-col"
              >
                <div className="relative h-48 group flex-shrink-0">
                  <img
                    className="w-full h-48 object-cover rounded-t-lg"
                    src={tool.images[0]}
                    alt={tool.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Badge de statut et bouton voir détails en bas à gauche */}
                  <div className="absolute w-[250px] bottom-4 left-4 flex items-center gap-2 justify-between ">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                        tool.status === "available"
                          ? "bg-emerald-100/90 text-emerald-700"
                          : tool.status === "rented"
                          ? "bg-blue-100/90 text-blue-700"
                          : "bg-amber-100/90 text-amber-700"
                      }`}
                    >
                      {tool.status === "available"
                        ? "Disponible"
                        : tool.status === "rented"
                        ? "En location"
                        : "En maintenance"}
                    </span>
                    <button
                      className="bg-white/80 hover:bg-cyan-100 rounded-full p-2 shadow transition-all"
                      onClick={() => {
                        setModalDescription(tool);
                        setShowModal(true);
                      }}
                      title="Voir les détails"
                    >
                      <Eye className="w-5 h-5 text-cyan-600" />
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(String(tool.id))}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-cyan-50 transition-colors"
                    >
                      <Edit className="w-5 h-5 text-cyan-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(String(tool.id))}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300">
                    {tool.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-1" />
                    {tool.address}
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-600 font-semibold text-sm">
                        {tool.price} FCFA /jour
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {tool.address}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">
              Aucun outil ne correspond à votre recherche
            </p>
          </motion.div>
        )}
      </div>

      {/* Modale description complète */}
      <AnimatePresence>
        {showModal && modalDescription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl py-4 px-4 sm:px-6 max-w-xl w-full relative flex flex-col my-auto"
            >
              <button
                className="absolute top-2 right-2 text-3xl text-gray-400 hover:text-cyan-600 transition"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                ×
              </button>
              {/* Image principale ou carrousel */}
              {modalDescription.images && modalDescription.images.length > 1 ? (
                <div className="flex gap-3 mb-2 overflow-x-auto justify-center">
                  {modalDescription.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      className="w-full h-48 object-cover rounded-t-lg"
                      src={img}
                      alt={modalDescription.name}
                    />
                  ))}
                </div>
              ) : (
                <img
                  className="w-full h-64 object-cover rounded-t-lg"
                  src={modalDescription.images[0]}
                  alt={modalDescription.name}
                />
              )}
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow ${
                      modalDescription.status === "available"
                        ? "bg-emerald-100 text-emerald-700"
                        : modalDescription.status === "rented"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {modalDescription.status === "available"
                      ? "Disponible"
                      : modalDescription.status === "rented"
                      ? "En location"
                      : "En maintenance"}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-1 text-gray-900 text-center">
                  {modalDescription.name}
                </h2>
                <div className="flex flex-wrap gap-2 mb-1 text-gray-700 text-sm justify-center">
                  {modalDescription.brand && (
                    <span>
                      Marque : <b>{modalDescription.brand}</b>
                    </span>
                  )}
                  {modalDescription.model && (
                    <span>
                      Modèle : <b>{modalDescription.model}</b>
                    </span>
                  )}
                  {modalDescription.category && (
                    <span>
                      Catégorie : <b>{modalDescription.category}</b>
                    </span>
                  )}
                  {modalDescription.etat && (
                    <span>
                      État : <b>{modalDescription.etat}</b>
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-2 whitespace-pre-line text-center text-sm">
                  {modalDescription.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-2 text-gray-700 text-sm justify-center">
                  <span className="bg-cyan-50 rounded px-2 py-1">
                    Prix : <b>{modalDescription.price}</b>
                  </span>
                  <span className="bg-cyan-50 rounded px-2 py-1">
                    Localisation : <b>{modalDescription.address}</b>
                  </span>
                  {modalDescription.caution && (
                    <span className="bg-cyan-50 rounded px-2 py-1">
                      Caution : <b>{modalDescription.caution} FCFA</b>
                    </span>
                  )}
                  {modalDescription.isInsured !== undefined && (
                    <span className="bg-cyan-50 rounded px-2 py-1">
                      Assuré :{" "}
                      <b>{modalDescription.isInsured ? "Oui" : "Non"}</b>
                    </span>
                  )}
                  {modalDescription.rentalCount !== undefined && (
                    <span className="bg-cyan-50 rounded px-2 py-1">
                      Locations : <b>{modalDescription.rentalCount}</b>
                    </span>
                  )}
                  {modalDescription.rating !== undefined && (
                    <span className="bg-cyan-50 rounded px-2 py-1">
                      Note : <b>{modalDescription.rating} / 5</b>
                    </span>
                  )}
                  {modalDescription.reviewsCount !== undefined && (
                    <span className="bg-cyan-50 rounded px-2 py-1">
                      Avis : <b>{modalDescription.reviewsCount}</b>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <img
                    src={modalDescription.owner.avatar || "/default-avatar.png"}
                    alt={`${modalDescription.owner.firstName} ${modalDescription.owner.lastName}`}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium">
                    {modalDescription.owner.firstName}{" "}
                    {modalDescription.owner.lastName}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaMapMarkerAlt className="mr-1" />
                  {modalDescription.address}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full items-center">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                    <button
                      onClick={() => handleEdit(String(modalDescription.id))}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold shadow text-sm w-[140px] sm:w-[180px]"
                    >
                      <Edit className="w-4 h-4" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(String(modalDescription.id))}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow text-sm w-[140px] sm:w-[180px]"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
