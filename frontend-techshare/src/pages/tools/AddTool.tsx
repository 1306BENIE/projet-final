import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toolService } from "@/services/toolService";
import { AddToolFormData } from "@/interfaces/tools/add-tool";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Info,
  Settings,
  MapPin,
  ImageIcon,
  XCircle,
} from "lucide-react";

const steps = [
  { id: 1, title: "Informations de base", icon: Info },
  { id: 2, title: "Détails techniques", icon: Settings },
  { id: 3, title: "Prix et localisation", icon: MapPin },
  { id: 4, title: "Images", icon: ImageIcon },
];

export default function AddTool() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<AddToolFormData>({
    name: "",
    brand: "",
    modelName: "",
    description: "",
    category: "informatique",
    etat: "neuf",
    dailyPrice: 0,
    caution: 0,
    isInsured: false,
    location: {
      type: "Point",
      address: "",
      coordinates: [0, 0],
    },
    images: [],
  });

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const validateStep = (step: number): boolean => {
    const newValidation: Record<string, boolean> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newValidation.name = false;
        }
        if (!formData.brand.trim()) {
          newValidation.brand = false;
        }
        if (!formData.modelName.trim()) {
          newValidation.modelName = false;
        }
        break;
      case 2:
        if (!formData.description.trim()) {
          newValidation.description = false;
        }
        if (!formData.category) {
          newValidation.category = false;
        }
        if (!formData.etat) {
          newValidation.etat = false;
        }
        break;
      case 3:
        if (!formData.dailyPrice || formData.dailyPrice <= 0) {
          newValidation.dailyPrice = false;
        }
        if (!formData.caution || formData.caution <= 0) {
          newValidation.caution = false;
        }
        if (!formData.location.address.trim()) {
          newValidation.location = false;
        }
        break;
      case 4:
        if (!formData.images || formData.images.length === 0) {
          newValidation.images = false;
        }
        break;
    }

    setValidation(newValidation);

    return Object.keys(newValidation).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      return;
    }
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "location") {
          formDataToSend.append(
            "location",
            JSON.stringify({
              type: "Point",
              coordinates: value.coordinates,
            })
          );
          formDataToSend.append("address", value.address);
        } else if (key === "images") {
          value.forEach((file: File) => {
            formDataToSend.append("images", file);
          });
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      await toolService.createTool(formDataToSend);
      toast.success("Outil ajouté avec succès");
      navigate("/tools");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'outil:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ajout de l'outil"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidation((prev) => ({ ...prev, [name]: true }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
    setValidation((prev) => ({ ...prev, location: true }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        images: Array.from(e.target.files || []),
      }));
      setValidation((prev) => ({ ...prev, images: true }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cyan-50 to-cyan-100 py-8">
      <motion.h1
        className="text-4xl font-extrabold text-center mb-2 tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Ajouter un nouvel outil
      </motion.h1>
      <motion.p
        className="text-center text-gray-500 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Remplissez le formulaire ci-dessous pour ajouter un nouvel outil à la
        plateforme.
      </motion.p>
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl border border-cyan-100"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex justify-end mb-6">
          <motion.button
            type="button"
            onClick={() => navigate("/tools")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Retour à la liste
          </motion.button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;

                return (
                  <div
                    key={step.id}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    <motion.div
                      className={`w-12 h-12 flex items-center justify-center rounded-full border-2 shadow-md transition-all duration-300
                        ${
                          isActive
                            ? "border-cyan-500 bg-white text-cyan-500 scale-110"
                            : "border-gray-200 bg-gray-50 text-gray-300"
                        }
                      `}
                      animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                    <span
                      className={`text-xs font-semibold mt-2 ${
                        isActive ? "text-cyan-600" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                    {idx < steps.length - 1 && (
                      <div className="absolute right-0 top-1/2 w-full h-1 bg-gradient-to-r from-cyan-200 to-gray-200 -z-10" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute h-full bg-cyan-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ minWidth: 16 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom de l'outil *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.name === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                    />
                    {validation.name === false && (
                      <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="brand"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Marque *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                          validation.brand === false
                            ? "border-red-400"
                            : "border-cyan-100"
                        }`}
                      />
                      {validation.brand === false && (
                        <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="modelName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Modèle *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="modelName"
                        name="modelName"
                        value={formData.modelName}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                          validation.modelName === false
                            ? "border-red-400"
                            : "border-cyan-100"
                        }`}
                      />
                      {validation.modelName === false && (
                        <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description *
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.description === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                    />
                    {validation.description === false && (
                      <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Catégorie *
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                          validation.category === false
                            ? "border-red-400"
                            : "border-cyan-100"
                        }`}
                      >
                        <option value="bricolage">Bricolage</option>
                        <option value="jardinage">Jardinage</option>
                        <option value="nettoyage">Nettoyage</option>
                        <option value="cuisine">Cuisine</option>
                        <option value="informatique">Informatique</option>
                        <option value="autre">Autre</option>
                      </select>
                      {validation.category === false && (
                        <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="etat"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      État *
                    </label>
                    <div className="relative">
                      <select
                        id="etat"
                        name="etat"
                        value={formData.etat}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                          validation.etat === false
                            ? "border-red-400"
                            : "border-cyan-100"
                        }`}
                      >
                        <option value="neuf">Neuf</option>
                        <option value="bon_etat">Bon état</option>
                        <option value="usage">Usage</option>
                      </select>
                      {validation.etat === false && (
                        <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="dailyPrice"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prix journalier (FCFA) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="dailyPrice"
                      name="dailyPrice"
                      value={formData.dailyPrice}
                      onChange={handleInputChange}
                      required
                      min={0}
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.dailyPrice === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                    />
                    {validation.dailyPrice === false && (
                      <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="caution"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Caution (FCFA) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="caution"
                      name="caution"
                      value={formData.caution}
                      onChange={handleInputChange}
                      required
                      min={0}
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.caution === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                    />
                    {validation.caution === false && (
                      <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Adresse *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.location.address}
                      onChange={handleLocationChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.location === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                    />
                    {validation.location === false && (
                      <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isInsured"
                    name="isInsured"
                    checked={formData.isInsured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isInsured: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label
                    htmlFor="isInsured"
                    className="text-sm font-medium text-gray-700"
                  >
                    L'outil est assuré
                  </label>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="images"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Images *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="images"
                      name="images"
                      onChange={handleImageChange}
                      multiple
                      accept="image/*"
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition ${
                        validation.images === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                    />
                    {validation.images === false && (
                      <XCircle className="w-5 h-5 text-red-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <motion.button
                type="button"
                onClick={handlePrevious}
                className="px-7 py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold flex items-center gap-2 shadow-sm hover:bg-gray-200 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Précédent
              </motion.button>
            )}

            {currentStep < steps.length ? (
              <motion.button
                type="button"
                onClick={handleNext}
                className="ml-auto px-7 py-3 rounded-xl bg-cyan-500 text-white font-semibold flex items-center gap-2 shadow-md hover:bg-cyan-600 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Suivant
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={loading}
                className="ml-auto px-7 py-3 rounded-xl bg-cyan-500 text-white font-semibold flex items-center gap-2 shadow-md hover:bg-cyan-600 transition disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  "Ajouter l'outil"
                )}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
