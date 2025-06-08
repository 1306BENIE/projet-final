import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Info,
  Settings,
  MapPin,
  XCircle,
} from "lucide-react";
import { toolService } from "@/services/toolService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type {
  FormDataState,
  ValidationState,
} from "@/interfaces/tools/add-tool";

const steps = [
  { id: 1, title: "Informations de base", icon: Info },
  { id: 2, title: "Détails techniques", icon: Settings },
  { id: 3, title: "Prix et localisation", icon: MapPin },
  { id: 4, title: "Images", icon: ImageIcon },
];

const initialShake: Record<keyof FormDataState, boolean> = {
  name: false,
  brand: false,
  modelName: false,
  category: false,
  etat: false,
  description: false,
  dailyPrice: false,
  caution: false,
  location: false,
  isInsured: false,
  images: false,
};

export default function AddTool() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataState>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [validation, setValidation] = useState<ValidationState>({
    name: null,
    brand: null,
    modelName: null,
    category: null,
    etat: null,
    description: null,
    dailyPrice: null,
    caution: null,
    location: null,
    isInsured: null,
    images: null,
  });
  const [shake, setShake] =
    useState<Record<keyof FormDataState, boolean>>(initialShake);

  // Validation logic for each field
  const validateField = (
    name: keyof FormDataState,
    value: unknown
  ): boolean | null => {
    switch (name) {
      case "name":
      case "brand":
      case "modelName":
        return typeof value === "string" && value.length >= 2;
      case "category":
      case "etat":
      case "isInsured":
        return !!value;
      case "description":
        return typeof value === "string" && value.length >= 10;
      case "dailyPrice":
      case "caution":
        return (
          typeof value === "string" &&
          !isNaN(Number(value)) &&
          Number(value) > 0
        );
      case "location":
        return typeof value === "string" && value.length >= 2;
      case "images":
        return value instanceof FileList && value.length > 0;
      default:
        return null;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files) {
      e.preventDefault();
      console.log("[handleInputChange] images sélectionnées:", files);
      setFormData((prev: FormDataState) => ({ ...prev, [name]: files }));
      // Preview images
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setImagePreviews(urls);
      // On ne fait aucune validation pour les images ici
      setValidation((prev: ValidationState) => ({
        ...prev,
        [name]: null,
      }));
    } else {
      setFormData((prev: FormDataState) => ({ ...prev, [name]: value }));
      setValidation((prev: ValidationState) => ({
        ...prev,
        [name]: validateField(name as keyof FormDataState, value),
      }));
    }
  };

  // Remove image preview
  const removeImage = (idx: number) => {
    setImagePreviews((prev: string[]) => prev.filter((_, i) => i !== idx));
    if (formData.images) {
      const dt = new DataTransfer();
      Array.from(formData.images as FileList).forEach((file, i) => {
        if (i !== idx) dt.items.add(file);
      });
      setFormData((prev: FormDataState) => ({ ...prev, images: dt.files }));
      setValidation((prev: ValidationState) => ({
        ...prev,
        images: dt.files.length > 0,
      }));
    }
  };

  const nextStep = () => {
    console.log(
      `[nextStep] Passage à l'étape suivante depuis l'étape ${currentStep}`
    );
    // Check all fields of the current step
    let valid = true;
    let fields: (keyof FormDataState)[] = [];
    if (currentStep === 1) fields = ["name", "brand", "modelName"];
    if (currentStep === 2) fields = ["category", "etat", "description"];
    if (currentStep === 3)
      fields = ["dailyPrice", "caution", "location", "isInsured"];
    if (currentStep === 4) {
      // On passe simplement à l'étape suivante sans validation
      setCurrentStep((s) => Math.min(s + 1, steps.length));
      return;
    }

    fields.forEach((f) => {
      const isValid = validateField(f, formData[f]);
      setValidation((prev: ValidationState) => ({ ...prev, [f]: isValid }));
      if (!isValid) {
        setShake((prev: Record<keyof FormDataState, boolean>) => ({
          ...prev,
          [f]: true,
        }));
        valid = false;
      }
    });
    if (valid) setCurrentStep((s) => Math.min(s + 1, steps.length));
    setTimeout(() => setShake(initialShake), 500);
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[handleSubmit] Soumission du formulaire déclenchée");

    // Vérifier si des images ont été sélectionnées
    if (
      !formData.images ||
      (formData.images instanceof FileList && formData.images.length === 0)
    ) {
      setError("Veuillez sélectionner au moins une image");
      setValidation((prev) => ({ ...prev, images: false }));
      setShake((prev) => ({ ...prev, images: true }));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData();

      // Ajouter tous les champs sauf location et address
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images" && value instanceof FileList) {
          Array.from(value).forEach((file) => data.append("images", file));
        } else if (
          key !== "location" &&
          key !== "address" &&
          value !== undefined &&
          value !== null
        ) {
          // S'assurer que la catégorie est en minuscules
          if (key === "category") {
            data.append(key, (value as string).toLowerCase());
          } else {
            data.append(key, value as string);
          }
        }
      });

      // Construire l'objet GeoJSON strict pour location
      const geoJsonLocation = {
        type: "Point",
        coordinates: [-3.999, 5.333],
      };
      data.append("location", JSON.stringify(geoJsonLocation));

      // Ajouter l'adresse séparément
      const address =
        formData.location &&
        typeof formData.location === "string" &&
        formData.location.length >= 5
          ? formData.location
          : "Abidjan, Côte d'Ivoire";
      data.append("address", address);

      // Log pour déboguer
      console.log("FormData avant envoi:", {
        category: data.get("category"),
        location: data.get("location"),
        address: data.get("address"),
        formData: Object.fromEntries(data.entries()),
      });

      await toolService.createTool(data);
      navigate("/tools");
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const stepVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
  };

  // Progress bar
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

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
        {/* Steps + Progress bar */}
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
        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {error}
          </motion.div>
        )}
        <form onSubmit={handleSubmit} autoComplete="off">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                {...stepVariants}
                className="grid grid-cols-1 gap-6"
              >
                <div className="relative">
                  <label className="block font-semibold mb-1">
                    Nom de l'outil *
                  </label>
                  <motion.input
                    type="text"
                    name="name"
                    required
                    placeholder="Ex: MacBook Pro 2023"
                    className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                      validation.name === false
                        ? "border-red-400"
                        : "border-cyan-100"
                    }`}
                    onChange={handleInputChange}
                    animate={shake.name ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block font-semibold mb-1">Marque *</label>
                    <motion.input
                      type="text"
                      name="brand"
                      required
                      placeholder="Ex: Apple"
                      className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.brand === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                      onChange={handleInputChange}
                      animate={shake.brand ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                    />
                  </div>
                  <div className="relative">
                    <label className="block font-semibold mb-1">Modèle *</label>
                    <motion.input
                      type="text"
                      name="modelName"
                      required
                      placeholder="Ex: MacBook Pro M2"
                      className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.modelName === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                      onChange={handleInputChange}
                      animate={
                        shake.modelName ? { x: [0, -8, 8, -8, 8, 0] } : {}
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                {...stepVariants}
                className="grid grid-cols-1 gap-6"
              >
                <div className="relative">
                  <label className="block font-semibold mb-1">
                    Catégorie *
                  </label>
                  <motion.select
                    name="category"
                    required
                    className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                      validation.category === false
                        ? "border-red-400"
                        : "border-cyan-100"
                    }`}
                    onChange={handleInputChange}
                    animate={shake.category ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  >
                    <option value="">Sélectionner</option>
                    <option value="bricolage">Bricolage</option>
                    <option value="jardinage">Jardinage</option>
                    <option value="nettoyage">Nettoyage</option>
                    <option value="cuisine">Cuisine</option>
                    <option value="informatique">Informatique</option>
                    <option value="autre">Autre</option>
                  </motion.select>
                </div>
                <div className="relative">
                  <label className="block font-semibold mb-1">État *</label>
                  <motion.select
                    name="etat"
                    required
                    className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                      validation.etat === false
                        ? "border-red-400"
                        : "border-cyan-100"
                    }`}
                    onChange={handleInputChange}
                    animate={shake.etat ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  >
                    <option value="">Sélectionner</option>
                    <option value="neuf">Neuf</option>
                    <option value="bon_etat">Bon état</option>
                    <option value="usage">Usage</option>
                  </motion.select>
                </div>
                <div className="relative">
                  <label className="block font-semibold mb-1">
                    Description *
                  </label>
                  <motion.textarea
                    name="description"
                    required
                    placeholder="Décrivez l'outil, ses fonctionnalités, etc."
                    className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                      validation.description === false
                        ? "border-red-400"
                        : "border-cyan-100"
                    }`}
                    rows={4}
                    onChange={handleInputChange}
                    animate={
                      shake.description ? { x: [0, -8, 8, -8, 8, 0] } : {}
                    }
                  />
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                {...stepVariants}
                className="grid grid-cols-1 gap-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block font-semibold mb-1">
                      Prix journalier (FCFA) *
                    </label>
                    <motion.input
                      type="number"
                      name="dailyPrice"
                      required
                      min="0"
                      placeholder="Ex: 5000"
                      className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.dailyPrice === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                      onChange={handleInputChange}
                      animate={
                        shake.dailyPrice ? { x: [0, -8, 8, -8, 8, 0] } : {}
                      }
                    />
                  </div>
                  <div className="relative">
                    <label className="block font-semibold mb-1">
                      Caution (FCFA) *
                    </label>
                    <motion.input
                      type="number"
                      name="caution"
                      required
                      min="0"
                      placeholder="Ex: 20000"
                      className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                        validation.caution === false
                          ? "border-red-400"
                          : "border-cyan-100"
                      }`}
                      onChange={handleInputChange}
                      animate={shake.caution ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block font-semibold mb-1">
                    Localisation *
                  </label>
                  <motion.input
                    type="text"
                    name="location"
                    required
                    placeholder="Ex: Abidjan, Cocody"
                    className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                      validation.location === false
                        ? "border-red-400"
                        : "border-cyan-100"
                    }`}
                    onChange={handleInputChange}
                    animate={shake.location ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  />
                </div>
                <div className="relative">
                  <label className="block font-semibold mb-1">
                    Assurance *
                  </label>
                  <motion.select
                    name="isInsured"
                    required
                    className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition pr-10 ${
                      validation.isInsured === false
                        ? "border-red-400"
                        : "border-cyan-100"
                    }`}
                    onChange={handleInputChange}
                    animate={shake.isInsured ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  >
                    <option value="">Sélectionner</option>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </motion.select>
                </div>
              </motion.div>
            )}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                {...stepVariants}
                className="grid grid-cols-1 gap-6"
              >
                <div className="relative">
                  <label className="block font-semibold mb-1">Images *</label>
                  <motion.input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    required
                    className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-300 transition ${
                      validation.images === false && error
                        ? "border-red-400"
                        : "border-cyan-100"
                    }`}
                    onChange={handleInputChange}
                    onClick={(e) => e.stopPropagation()}
                    animate={shake.images ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  />
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={src}
                            alt={`Aperçu ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-xl border border-cyan-100 shadow"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow group-hover:scale-110 transition"
                            title="Supprimer"
                          >
                            <XCircle className="w-5 h-5 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-between mt-10">
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-7 py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 hover:scale-105 transition"
              whileTap={{ scale: 0.97 }}
            >
              <ChevronLeft className="w-5 h-5" /> Précédent
            </motion.button>
            {currentStep < steps.length ? (
              <motion.button
                type="button"
                onClick={nextStep}
                className="px-7 py-3 rounded-xl bg-cyan-500 text-white font-semibold flex items-center gap-2 shadow-md hover:bg-cyan-600 hover:scale-105 transition"
                whileTap={{ scale: 0.97 }}
              >
                Suivant <ChevronRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={isLoading}
                className="px-7 py-3 rounded-xl bg-cyan-500 text-white font-semibold flex items-center gap-2 shadow-md hover:bg-cyan-600 hover:scale-105 transition disabled:opacity-50"
                whileTap={{ scale: 0.97 }}
              >
                {isLoading ? "Ajout en cours..." : "Ajouter l'outil"}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
