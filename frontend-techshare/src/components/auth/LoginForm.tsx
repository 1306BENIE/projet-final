import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button/Button";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { LoginFormValues } from "@/interfaces/auth";
import { useAuth } from "@/store/auth";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

const schema = yup.object({
  email: yup.string().email("Email invalide").required("L'email est requis"),
  password: yup.string().required("Le mot de passe est requis"),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    mode: "onTouched",
  });
  const { login } = useAuth();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success("Connexion réussie ! Bienvenue sur TechShare");
        // Récupérer l'URL de redirection
        const redirectPath =
          localStorage.getItem("redirectAfterLogin") || "/home";
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        const errorMessage = "Email ou mot de passe incorrect";
        toast.error(errorMessage);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
        } else if (error.response?.status === 401) {
          const errorMessage = "Email ou mot de passe incorrect";
          toast.error(errorMessage);
        } else if (error.response?.status === 404) {
          const errorMessage = "Aucun compte trouvé avec cet email";
          toast.error(errorMessage);
        } else {
          const errorMessage =
            "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
          toast.error(errorMessage);
        }
      } else {
        const errorMessage =
          "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl px-8 py-10 space-y-7"
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
        Connexion à TechShare
      </h2>
      <p className="text-center text-gray-500 mb-6 text-base font-inter">
        Accédez à votre espace en toute sécurité
      </p>
      <div className="space-y-4">
        <div className="relative">
          <Input
            label="Email"
            placeholder="Votre email"
            icon={Mail}
            type="email"
            {...register("email")}
            error={errors.email?.message}
            className="input-premium"
          />
        </div>
        <div className="relative">
          <Input
            label="Mot de passe"
            placeholder="••••••••"
            icon={Lock}
            type="password"
            showPasswordToggle
            {...register("password")}
            error={errors.password?.message}
            className="input-premium"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          type="submit"
          variant="ghost"
          size="lg"
          className="text-lg font-semibold rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.03] focus:ring-2 focus:ring-primary/40 bg-gray-100 text-black w-[180px]"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </div>
      <div className="flex flex-col items-center gap-2 mt-4">
        <a
          href="#"
          className="text-xs text-primary hover:underline font-medium"
        >
          Mot de passe oublié ?
        </a>
        <span className="text-xs text-gray-500">
          Pas encore de compte ?{" "}
          <a
            href="/auth/register"
            className="text-primary font-semibold hover:underline"
          >
            S'inscrire
          </a>
        </span>
      </div>
    </motion.form>
  );
}
