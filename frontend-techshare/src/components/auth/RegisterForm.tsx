import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, Phone, MapPin, Building, Hash } from "lucide-react";
import { motion } from "framer-motion";
import type { RegisterFormValues } from "@/interfaces/auth";
import { useAuth } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Format d'email invalide")
    .required("L'email est requis"),
  password: yup
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    .required("Le mot de passe est requis"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("La confirmation du mot de passe est requise"),
  firstName: yup
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .required("Le prénom est requis"),
  lastName: yup
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .required("Le nom est requis"),
  phone: yup
    .string()
    .matches(/^\+?[\d\s-]{10,}$/, "Format de numéro de téléphone invalide")
    .required("Le numéro de téléphone est requis"),
  address: yup.object().shape({
    street: yup
      .string()
      .min(5, "L'adresse doit contenir au moins 5 caractères")
      .required("La rue est requise"),
    city: yup
      .string()
      .min(2, "La ville doit contenir au moins 2 caractères")
      .required("La ville est requise"),
    postalCode: yup
      .string()
      .matches(/^\d{5}$/, "Le code postal doit contenir 5 chiffres")
      .required("Le code postal est requis"),
    country: yup
      .string()
      .min(2, "Le pays doit contenir au moins 2 caractères")
      .required("Le pays est requis"),
  }),
});

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [registerSuccess, setRegisterSuccess] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});

  const onSubmit = async (data: RegisterFormValues) => {
    setRegisterSuccess(false);
    setValidationErrors({});

    try {
      const success = await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
      });

      if (success) {
        setRegisterSuccess(true);
        toast.success(
          "Inscription réussie ! Redirection vers la page de connexion..."
        );
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      }
    } catch (error) {
      let errorMessage =
        "Une erreur inattendue est survenue. Veuillez réessayer.";
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response?.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl px-8 py-10 space-y-7"
      autoComplete="off"
    >
      <a
        href="/"
        className="flex items-center justify-center gap-2 mb-4 text-primary font-semibold hover:underline text-base"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Retour à l'accueil
      </a>

      <h2 className="text-3xl font-extrabold font-poppins text-primary mb-2 text-center tracking-tight">
        Créer un compte TechShare
      </h2>
      <p className="text-center text-gray-500 mb-6 text-base font-inter">
        Rejoignez notre communauté et partagez vos connaissances
      </p>

      <div className="space-y-6">
        {/* Informations personnelles */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Informations personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Input
              type="text"
              label="Prénom(s)"
              placeholder="Votre prénom"
              {...register("firstName")}
              error={errors.firstName?.message || validationErrors.firstName}
              icon={User}
              className="input-premium"
            />
            <Input
              type="text"
              label="Nom"
              placeholder="Votre nom"
              {...register("lastName")}
              error={errors.lastName?.message || validationErrors.lastName}
              icon={User}
              className="input-premium"
            />
            <Input
              type="email"
              label="Email"
              placeholder="Votre email"
              {...register("email")}
              error={errors.email?.message || validationErrors.email}
              icon={Mail}
              className="input-premium"
            />
            <Input
              type="tel"
              label="Téléphone"
              placeholder="Votre numéro"
              {...register("phone")}
              error={errors.phone?.message || validationErrors.phone}
              icon={Phone}
              className="input-premium"
            />
          </div>
        </div>

        {/* Adresse */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Adresse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Input
              type="text"
              label="Rue"
              placeholder="Votre rue"
              {...register("address.street")}
              error={
                errors.address?.street?.message ||
                validationErrors["address.street"]
              }
              icon={MapPin}
              className="input-premium"
            />
            <Input
              type="text"
              label="Ville"
              placeholder="Votre ville"
              {...register("address.city")}
              error={
                errors.address?.city?.message ||
                validationErrors["address.city"]
              }
              icon={Building}
              className="input-premium"
            />
            <Input
              type="text"
              label="Code postal"
              placeholder="Votre code postal"
              {...register("address.postalCode")}
              error={
                errors.address?.postalCode?.message ||
                validationErrors["address.postalCode"]
              }
              icon={Hash}
              className="input-premium"
            />
            <Input
              type="text"
              label="Pays"
              placeholder="Votre pays"
              {...register("address.country")}
              error={
                errors.address?.country?.message ||
                validationErrors["address.country"]
              }
              icon={MapPin}
              className="input-premium"
            />
          </div>
        </div>

        {/* Sécurité */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sécurité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Input
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message || validationErrors.password}
              icon={Lock}
              showPasswordToggle
              className="input-premium"
            />
            <Input
              type="password"
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              icon={Lock}
              showPasswordToggle
              className="input-premium"
            />
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            variant="ghost"
            size="lg"
            className="text-lg font-semibold rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.03] focus:ring-2 focus:ring-primary/40 bg-gray-100 text-black w-[220px]"
            isLoading={isSubmitting}
            disabled={isSubmitting || registerSuccess}
          >
            {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </div>

        <div className="flex flex-col items-center gap-2 mt-4">
          <span className="text-xs text-gray-500">
            Vous avez déjà un compte ?{" "}
            <a
              href="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Se connecter
            </a>
          </span>
        </div>
      </div>
    </motion.form>
  );
}
