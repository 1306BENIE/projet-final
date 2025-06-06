import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Save,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { AddToolProps } from "@/interfaces/tools/add-tool";
import { useNavigate } from "react-router-dom";

const categories = ["Ordinateur", "Appareil photo", "Drone", "Tablette"];
const etats = ["Neuf", "Bon état", "Usagé"];

const steps = [
  {
    id: 1,
    title: "Informations de base",
    description: "Nom, marque et modèle",
  },
  {
    id: 2,
    title: "Détails techniques",
    description: "Catégorie, état et description",
  },
  {
    id: 3,
    title: "Prix et localisation",
    description: "Tarification et emplacement",
  },
  { id: 4, title: "Images", description: "Photos de l'outil" },
];

const inputVariants = {
  focus: { scale: 1.02 },
  blur: { scale: 1 },
};

export default function AddTool({ onSubmit, loading = false }: AddToolProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    description: "",
    price: "",
    location: "",
    category: "",
    images: [] as File[],
    etat: "",
    isInsured: false,
    caution: "",
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateStep = (step: number) => {
    const errs: { [k: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) errs.name = "Le nom est requis.";
        if (!formData.brand.trim()) errs.brand = "La marque est requise.";
        if (!formData.model.trim()) errs.model = "Le modèle est requis.";
        break;
      case 2:
        if (!formData.category) errs.category = "La catégorie est requise.";
        if (!formData.etat) errs.etat = "L'état de l'outil est requis.";
        if (!formData.description || formData.description.length < 30)
          errs.description = "Description trop courte (min 30 caractères).";
        break;
      case 3:
        if (
          !formData.price ||
          isNaN(Number(formData.price)) ||
          Number(formData.price) <= 0
        )
          errs.price = "Prix invalide.";
        if (!formData.location.trim())
          errs.location = "La localisation est requise.";
        if (
          formData.caution &&
          (isNaN(Number(formData.caution)) || Number(formData.caution) < 0)
        )
          errs.caution = "Caution invalide.";
        break;
      case 4:
        if (formData.images.length === 0)
          errs.images = "Au moins une image est requise.";
        break;
    }

    return errs;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors = validateStep(currentStep);
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      // Créer un objet FormData pour envoyer les fichiers
      const formDataToSend = new FormData();

      // Ajouter tous les champs du formulaire
      formDataToSend.append("name", formData.name);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("model", formData.model);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("etat", formData.etat);
      formDataToSend.append("isInsured", String(formData.isInsured));
      if (formData.caution) {
        formDataToSend.append("caution", formData.caution);
      }

      // Ajouter les images
      formData.images.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Appeler onSubmit avec le FormData
      onSubmit(formDataToSend);
      navigate("/tools");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));

      // Créer les URLs de prévisualisation
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreview((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
    // Révoquer l'URL de prévisualisation
    URL.revokeObjectURL(imagePreview[idx]);
    setImagePreview((prev) => prev.filter((_, i) => i !== idx));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <motion.div
              variants={inputVariants}
              animate={focusedField === "name" ? "focus" : "blur"}
              className="space-y-2"
            >
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700"
              >
                Nom de l'outil *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                placeholder="Ex: MacBook Pro 2023"
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center text-danger text-sm mt-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                variants={inputVariants}
                animate={focusedField === "brand" ? "focus" : "blur"}
                className="space-y-2"
              >
                <label
                  htmlFor="brand"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Marque *
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("brand")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                  placeholder="Ex: Apple"
                />
                <AnimatePresence>
                  {errors.brand && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center text-danger text-sm mt-1"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.brand}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={inputVariants}
                animate={focusedField === "model" ? "focus" : "blur"}
                className="space-y-2"
              >
                <label
                  htmlFor="model"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Modèle *
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("model")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                  placeholder="Ex: MacBook Pro M2"
                />
                <AnimatePresence>
                  {errors.model && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center text-danger text-sm mt-1"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.model}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                variants={inputVariants}
                animate={focusedField === "category" ? "focus" : "blur"}
                className="space-y-2"
              >
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Catégorie *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("category")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <AnimatePresence>
                  {errors.category && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center text-danger text-sm mt-1"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={inputVariants}
                animate={focusedField === "etat" ? "focus" : "blur"}
                className="space-y-2"
              >
                <label
                  htmlFor="etat"
                  className="block text-sm font-semibold text-gray-700"
                >
                  État de l'outil *
                </label>
                <select
                  id="etat"
                  name="etat"
                  value={formData.etat}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("etat")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                >
                  <option value="">Sélectionner l'état</option>
                  {etats.map((etat) => (
                    <option key={etat} value={etat}>
                      {etat}
                    </option>
                  ))}
                </select>
                <AnimatePresence>
                  {errors.etat && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center text-danger text-sm mt-1"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.etat}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <motion.div
              variants={inputVariants}
              animate={focusedField === "description" ? "focus" : "blur"}
              className="space-y-2"
            >
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700"
              >
                Description détaillée *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                placeholder="Décrivez votre outil en détail..."
              />
              <AnimatePresence>
                {errors.description && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center text-danger text-sm mt-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <motion.div
              variants={inputVariants}
              animate={focusedField === "price" ? "focus" : "blur"}
              className="space-y-2"
            >
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-gray-700"
              >
                Prix par jour (FCFA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("price")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                  placeholder="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  FCFA
                </span>
              </div>
              <AnimatePresence>
                {errors.price && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center text-danger text-sm mt-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.price}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              variants={inputVariants}
              animate={focusedField === "caution" ? "focus" : "blur"}
              className="space-y-2"
            >
              <label
                htmlFor="caution"
                className="block text-sm font-semibold text-gray-700"
              >
                Caution (FCFA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="caution"
                  name="caution"
                  value={formData.caution}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("caution")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                  placeholder="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  FCFA
                </span>
              </div>
              <AnimatePresence>
                {errors.caution && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center text-danger text-sm mt-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.caution}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              variants={inputVariants}
              animate={focusedField === "location" ? "focus" : "blur"}
              className="space-y-2"
            >
              <label
                htmlFor="location"
                className="block text-sm font-semibold text-gray-700"
              >
                Localisation *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onFocus={() => setFocusedField("location")}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200"
                placeholder="Ex: Cocody, Abidjan"
              />
              <AnimatePresence>
                {errors.location && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center text-danger text-sm mt-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.location}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <label className="block text-sm font-semibold text-gray-700">
                Images de l'outil *
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-all duration-200">
                  <Upload className="h-5 w-5" />
                  Sélectionner des images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {formData.images.length} image(s) sélectionnée(s)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence>
                {imagePreview.map((preview, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square"
                  >
                    <img
                      src={preview}
                      alt="outil"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                    <motion.button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {errors.images && (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center text-danger text-sm mt-1"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.images}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-start justify-center px-2 bg-gradient-to-b from-cyan-50 to-white min-h-screen">
      <div className="max-w-3xl w-full mx-auto mt-8 p-2 sm:p-4 bg-white rounded-3xl shadow-2xl shadow-cyan-200/40 flex flex-col justify-center">
        <div className="bg-cyan-50 rounded-2xl shadow-inner border border-cyan-100 p-4 sm:p-8 flex flex-col justify-center">
          {/* Stepper pro amélioré */}
          <div className="mb-12 w-full overflow-x-auto relative">
            {/* Ligne de progression grise */}
            <div
              className="absolute top-1/2 left-6 right-6 h-1 bg-gray-200 z-0"
              style={{ transform: "translateY(-50%)" }}
            >
              <div
                className="h-1 bg-cyan-500 rounded-full transition-all duration-500"
                style={{
                  width: `calc(${
                    ((currentStep - 1) / (steps.length - 1)) * 100
                  }% )`,
                }}
              />
            </div>
            <div className="flex items-center justify-between relative z-10">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center flex-1 min-w-[80px]"
                >
                  <div
                    className={`flex items-center justify-center transition-all duration-300 font-bold z-10
                      ${
                        currentStep > step.id
                          ? "w-10 h-10 rounded-full bg-cyan-500 border-2 border-cyan-500 text-white shadow-lg"
                          : currentStep === step.id
                          ? "w-12 h-12 rounded-full border-2 border-cyan-500 bg-white text-cyan-600 shadow-cyan-200 shadow-2xl scale-110"
                          : "w-10 h-10 rounded-full border-2 border-gray-300 bg-white text-gray-400"
                      }
                    `}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold text-center ${
                      currentStep >= step.id ? "text-cyan-700" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-8 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <motion.button
                type="button"
                onClick={handlePrevious}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                  bg-gray-100 shadow-md
                  ${
                    currentStep === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200"
                  }
                  transition-all duration-200`}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </motion.button>

              {currentStep < steps.length ? (
                <motion.button
                  type="button"
                  onClick={handleNext}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Suivant
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Ajouter l'outil
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
