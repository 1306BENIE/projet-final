import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Settings, MapPin, ImageIcon, XCircle } from "lucide-react";
import { AddToolFormData } from "@/interfaces/tools/add-tool";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: 1, title: "Informations de base", icon: Info },
  { id: 2, title: "Détails techniques", icon: Settings },
  { id: 3, title: "Prix et localisation", icon: MapPin },
  { id: 4, title: "Images", icon: ImageIcon },
];

interface ToolFormProps {
  initialData?: AddToolFormData;
  onSubmit: (data: FormData) => Promise<void>;
  submitLabel?: string;
  title?: string;
  description?: string;
}

const ToolForm: React.FC<ToolFormProps> = ({
  onSubmit,
  initialData,
  submitLabel = "Enregistrer",
  title,
  description,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [validation, setValidation] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<AddToolFormData>({
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    modelName: initialData?.modelName || "",
    description: initialData?.description || "",
    category: initialData?.category || "bricolage",
    etat: initialData?.etat || "neuf",
    dailyPrice: initialData?.dailyPrice || 0,
    caution: initialData?.caution || 0,
    isInsured: initialData?.isInsured || false,
    images: initialData?.images || [],
    location: initialData?.location || {
      type: "Point",
      coordinates: [0, 0],
      address: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.brand || !formData.modelName) {
          setValidation({
            brand: !!formData.brand,
            modelName: !!formData.modelName,
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.category || !formData.etat) {
          setValidation({
            category: !!formData.category,
            etat: !!formData.etat,
          });
          return false;
        }
        return true;
      case 3:
        if (!formData.dailyPrice || !formData.caution) {
          setValidation({
            dailyPrice: !!formData.dailyPrice,
            caution: !!formData.caution,
          });
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateStep(currentStep)) {
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Ajout des champs de base
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images" && key !== "location") {
          formDataToSend.append(key, value);
        }
      });

      // Gestion de la localisation
      if (formData.location) {
        const locationData = {
          type: "Point",
          coordinates: formData.location.coordinates,
        };
        formDataToSend.append("location", JSON.stringify(locationData));
        formDataToSend.append("address", formData.location.address);
      }

      // Gestion des images
      const existingImages = formData.images.filter(
        (img): img is string => typeof img === "string"
      );
      const newImages = formData.images.filter(
        (img): img is File => img instanceof File
      );

      existingImages.forEach((image) => {
        formDataToSend.append("existingImages", image);
      });

      newImages.forEach((image) => {
        formDataToSend.append("newImages", image);
      });

      await onSubmit(formDataToSend);
      navigate("/my-tools");
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      setError("Une erreur est survenue lors de la modification de l'outil");
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
    e.preventDefault();
    e.stopPropagation();

    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = formData.images.length + newFiles.length;

    if (totalImages > 5) {
      setError("Vous ne pouvez pas ajouter plus de 5 images");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
    setValidation((prev) => ({ ...prev, images: true }));
    setError("");
  };

  const removeImage = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/my-tools");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cyan-50 to-cyan-100 py-8">
      <motion.h1
        className="text-4xl font-extrabold text-center mb-2 tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {title || "Modifier l'outil"}
      </motion.h1>
      <motion.p
        className="text-center text-gray-500 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {description || "Modifiez les informations de l'outil ci-dessous."}
      </motion.p>
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl border border-cyan-100"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="space-y-6"
          noValidate
        >
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
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
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
                        <option value="">Sélectionnez une catégorie</option>
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
                        <option value="">Sélectionnez un état</option>
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
                <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images (max 5) *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      id="images"
                    />
                    <label
                      htmlFor="images"
                      className="w-full px-4 py-3 border border-cyan-100 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-gray-600">
                        Sélectionner des images
                      </span>
                    </label>
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={
                          image instanceof File
                            ? URL.createObjectURL(image)
                            : image
                        }
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 hover:text-gray-700 transition"
              >
                Annuler
              </button>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 text-cyan-600 hover:text-cyan-700 transition"
                >
                  Précédent
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={currentStep === 4 ? handleSubmit : handleNext}
              className="ml-auto px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
            >
              {currentStep === 4 ? submitLabel : "Suivant"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ToolForm;
