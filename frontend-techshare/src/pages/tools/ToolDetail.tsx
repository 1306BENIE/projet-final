import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tool } from "@/interfaces/tools/tool";
import { toolService } from "@/services/toolService";
import { Spinner } from "@/components/common/Spinner";
import {
  FaStar,
  FaMapMarkerAlt,
  FaTools,
  FaShieldAlt,
  FaCalendarAlt,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { BookingModal } from "@/components/features/booking/BookingModal";
import { useBookingModal } from "@/hooks/useBookingModal";

const ToolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isModalOpen, openModal, closeModal, bookedPeriods } =
    useBookingModal();

  const fetchTool = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("ID de l'outil manquant");
      }

      const data = await toolService.getToolById(id);
      setTool(data);
    } catch (err) {
      console.error("Error fetching tool:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors du chargement de l'outil");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTool();
  }, [fetchTool]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/tools")}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            Retour à la liste des outils
          </button>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Outil non trouvé
          </h2>
          <button
            onClick={() => navigate("/tools")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux outils
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 relative"
        >
          <motion.button
            onClick={() => navigate("/my-tools")}
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-gray-100 text-gray-600 rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes className="w-5 h-5" />
          </motion.button>

          <motion.div
            className="relative h-72"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={tool.images?.[0] || "https://via.placeholder.com/800x400"}
              alt={tool.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-2 hover:text-blue-200 transition-colors duration-300 tracking-tight">
                {tool.name}
              </h1>
              <div className="flex items-center space-x-4">
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaStar className="text-yellow-400 mr-1 animate-pulse" />
                  <span className="font-semibold tracking-wide">
                    {tool.rating || 0}
                  </span>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCalendarAlt className="mr-1" />
                  <span className="font-medium tracking-wide">
                    {tool.rentalCount || 0} locations
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors duration-300 tracking-tight">
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-sm font-light tracking-wide">
                    {tool.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center text-gray-600 mb-1">
                      <FaTools className="mr-2 text-blue-500" />
                      <span className="font-medium text-sm tracking-wide">
                        Catégorie
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm font-light tracking-wide">
                      {tool.category}
                    </p>
                  </motion.div>
                  <motion.div
                    className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center text-gray-600 mb-1">
                      <FaShieldAlt className="mr-2 text-green-500" />
                      <span className="font-medium text-sm tracking-wide">
                        Assurance
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm font-light tracking-wide">
                      {tool.isInsured ? "Inclus" : "Non inclus"}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-300 tracking-tight">
                    Détails de location
                  </h3>
                  <div className="space-y-3">
                    <motion.div
                      className="flex justify-between items-center"
                      whileHover={{ scale: 1.01 }}
                    >
                      <span className="text-gray-600 text-sm font-light tracking-wide">
                        Prix journalier
                      </span>
                      <span className="text-xl font-bold text-blue-600 tracking-tight">
                        {tool.dailyPrice} FCFA
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center text-gray-600 text-sm"
                      whileHover={{ scale: 1.01 }}
                    >
                      <FaMapMarkerAlt className="mr-2 text-red-500" />
                      <span className="font-light tracking-wide">
                        {tool.address}
                      </span>
                    </motion.div>
                    <div className="flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full mt-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                        onClick={() => openModal(tool)}
                      >
                        Réserver maintenant
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && tool && (
          <BookingModal
            isOpen={isModalOpen}
            onClose={closeModal}
            tool={tool}
            bookedPeriods={bookedPeriods}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolDetail;
