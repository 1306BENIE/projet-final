import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toolService } from "@/services/toolService";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface FormData {
  name: string;
  brand: string;
  model: string;
  description: string;
  category: string;
  etat: string;
  dailyPrice: number;
  caution: number;
  isInsured: boolean;
  address: string;
  images: string[];
}

export default function EditTool() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    brand: "",
    model: "",
    description: "",
    category: "",
    etat: "",
    dailyPrice: 0,
    caution: 0,
    isInsured: false,
    address: "",
    images: [],
  });
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    async function fetchTool() {
      try {
        setLoading(true);
        const t = await toolService.getToolById(id as string);
        if (!t) throw new Error("Outil introuvable");
        const initialValues: FormData = {
          name: t.name,
          brand: t.brand,
          model: t.model,
          description: t.description,
          category: t.category,
          etat: t.etat,
          dailyPrice: t.dailyPrice,
          caution: t.caution,
          isInsured: t.isInsured,
          address: t.address,
          images: t.images,
        };
        setForm(initialValues);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erreur lors du chargement");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTool();
  }, [id]);

  // Validation simple
  const validate = (name: string, value: string) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Le nom est requis.";
        break;
      case "brand":
        if (!value.trim()) return "La marque est requise.";
        break;
      case "model":
        if (!value.trim()) return "Le modèle est requis.";
        break;
      case "description":
        if (!value.trim() || value.length < 20)
          return "Description trop courte.";
        break;
      case "price":
        if (!value || isNaN(Number(value)) || Number(value) <= 0)
          return "Prix invalide.";
        break;
      case "location":
        if (!value.trim()) return "La localisation est requise.";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    // Validation finale
    const errors: { [k: string]: string } = {};
    Object.entries(form).forEach(([k, v]) => {
      if (typeof v === "string") errors[k] = validate(k, v);
    });
    setFieldErrors(errors);
    if (Object.values(errors).some((err) => err)) {
      setSaving(false);
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      await toolService.updateTool(id as string, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/my-tools");
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la sauvegarde");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-50 to-white p-4 sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 animate-fade-in mt-16 sm:mt-0"
        style={{ boxShadow: "0 8px 32px 0 rgba(0, 200, 255, 0.15)" }}
      >
        <h1 className="text-2xl font-extrabold text-cyan-700 text-center drop-shadow">
          Modifier l'outil
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Nom", name: "name", type: "text", required: true },
            { label: "Marque", name: "brand", type: "text", required: true },
            { label: "Modèle", name: "model", type: "text", required: true },
            { label: "Catégorie", name: "category", type: "text" },
            { label: "État", name: "etat", type: "text", required: true },
            {
              label: "Prix (FCFA)",
              name: "price",
              type: "number",
              required: true,
            },
            { label: "Caution (FCFA)", name: "caution", type: "number" },
            {
              label: "Localisation",
              name: "location",
              type: "text",
              required: true,
            },
          ].map((field) => (
            <div key={field.name} className="relative group">
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form] as string}
                onChange={handleChange}
                onBlur={handleBlur}
                required={field.required}
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-500 bg-white peer text-gray-900 font-medium shadow-sm
                  ${
                    touched[field.name] && fieldErrors[field.name]
                      ? "border-red-400"
                      : "border-gray-200"
                  }
                  ${
                    touched[field.name] && !fieldErrors[field.name]
                      ? "border-emerald-400"
                      : ""
                  }
                `}
                placeholder=" "
                autoComplete="off"
              />
              <label
                className={`absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs font-semibold pointer-events-none transition-all duration-200
                  peer-focus:-top-2 peer-focus:text-cyan-600 peer-focus:text-xs
                  ${
                    form[field.name as keyof typeof form]
                      ? "-top-2 text-cyan-600 text-xs"
                      : ""
                  }
                `}
              >
                {field.label}
              </label>
              {touched[field.name] && fieldErrors[field.name] && (
                <span className="flex items-center text-danger text-xs mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {fieldErrors[field.name]}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="relative group">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-6 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-500 bg-white peer text-gray-900 font-medium shadow-sm
              ${
                touched.description && fieldErrors.description
                  ? "border-red-400"
                  : "border-gray-200"
              }
              ${
                touched.description && !fieldErrors.description
                  ? "border-emerald-400"
                  : ""
              }
            `}
            placeholder=" "
            rows={2}
            required
          />
          <label
            className={`absolute left-3 top-3 bg-white px-1 text-gray-500 text-xs font-semibold pointer-events-none transition-all duration-200
              peer-focus:-top-2 peer-focus:text-cyan-600 peer-focus:text-xs
              ${form.description ? "-top-2 text-cyan-600 text-xs" : ""}
            `}
          >
            Description
          </label>
          {touched.description && fieldErrors.description && (
            <span className="flex items-center text-danger text-xs mt-1">
              <AlertCircle className="w-4 h-4 mr-1" />
              {fieldErrors.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              name="isInsured"
              checked={form.isInsured}
              onChange={handleChange}
              className="rounded border-gray-300 focus:ring-cyan-500"
            />
            Assuré
          </label>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 rounded-lg px-4 py-2 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5" /> Modifications enregistrées !
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 text-base"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-all shadow flex items-center justify-center text-base"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
