import {
  Search,
  ShieldCheck,
  Clock,
  CreditCard,
  Star,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import StepCard from "@/components/features/how-it-works/StepCard";
import FeatureCard from "@/components/features/how-it-works/FeatureCard";

// Composant WaveDivider amélioré
const WaveDivider = ({ className = "", flip = false, color = "white" }) => (
  <div className={`relative w-full h-16 overflow-hidden ${className}`}>
    <svg
      className={`absolute w-full h-full ${flip ? "rotate-180" : ""}`}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        fill={color}
        fillOpacity="1"
        d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
      />
    </svg>
  </div>
);

const steps = [
  {
    icon: Search,
    title: "Trouvez l'outil idéal",
    description:
      "Parcourez notre catalogue d'outils technologiques et trouvez celui qui correspond à vos besoins.",
  },
  {
    icon: Clock,
    title: "Réservez en quelques clics",
    description:
      "Choisissez vos dates de location et réservez instantanément l'outil de votre choix.",
  },
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    description:
      "Effectuez votre paiement en toute sécurité via notre plateforme de paiement intégrée.",
  },
  {
    icon: Users,
    title: "Récupérez l'outil",
    description:
      "Récupérez l'outil auprès du propriétaire aux dates convenues.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Assurance incluse",
    description:
      "Tous nos outils sont assurés pour une tranquillité d'esprit totale.",
  },
  {
    icon: Star,
    title: "Qualité garantie",
    description:
      "Nous vérifions chaque outil pour garantir son bon fonctionnement.",
  },
  {
    icon: Users,
    title: "Communauté fiable",
    description:
      "Notre système de notation permet de s'assurer de la fiabilité des utilisateurs.",
  },
  {
    icon: Clock,
    title: "Flexibilité",
    description:
      "Choisissez la durée de location qui vous convient, de quelques heures à plusieurs semaines.",
  },
];

export default function HowItWorks() {
  const containerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-white to-gray-50"
    >
      {/* Hero Section avec animation au scroll */}
      <motion.section
        initial={{ opacity: 1 }}
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-cyan-50/50 to-violet-50/50"
      >
        {/* Effets de fond animés */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-100/20 via-transparent to-violet-100/20"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-50/30 via-transparent to-transparent"
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center px-6 py-3 rounded-full bg-white/90 backdrop-blur-sm text-cyan-600 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100"
              >
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Découvrez notre plateforme
              </motion.span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-violet-600 to-cyan-600 bg-size-200 animate-gradient">
                Comment ça marche ?
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-1 bg-gradient-to-r from-cyan-500 to-violet-500 mx-auto rounded-full max-w-xs"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mt-8 leading-relaxed font-light"
            >
              TechShare simplifie la location d'outils technologiques. Découvrez
              comment notre plateforme peut vous aider à accéder aux équipements
              dont vous avez besoin.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Wave Divider */}
      <WaveDivider color="#f8fafc" />

      {/* Steps Section avec animation au scroll */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white"
      >
        {/* Effet de bordure supérieure */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-2 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-4"
            >
              Notre Processus
            </motion.span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Le processus en 4 étapes
            </h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-1 bg-gradient-to-r from-cyan-500 to-violet-500 mx-auto rounded-full max-w-xs"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Ligne de connexion entre les étapes */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <StepCard {...step} index={index} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Chaque étape est conçue pour vous offrir une expérience fluide et
              sécurisée dans la location de vos outils technologiques.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Wave Divider */}
      <WaveDivider color="#ffffff" flip />

      {/* Features Section avec animation au scroll */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-violet-50/50 to-cyan-50/50"
      >
        {/* Effet de bordure supérieure */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-violet-500/20" />

        {/* Effets de fond animés */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-violet-100/20 via-transparent to-cyan-100/20"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-50/30 via-transparent to-transparent"
        />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-2 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-4"
            >
              Nos Avantages
            </motion.span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir TechShare ?
            </h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-1 bg-gradient-to-r from-cyan-500 to-violet-500 mx-auto rounded-full max-w-xs"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-600 text-lg max-w-2xl mx-auto mt-6"
            >
              Découvrez les avantages qui font de TechShare la plateforme idéale
              pour vos besoins en location d'outils technologiques.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Ligne de connexion entre les cartes */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20" />

            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <FeatureCard {...feature} index={index} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Rejoignez notre communauté et profitez d'une expérience de
              location d'outils technologiques simple, sécurisée et économique.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Wave Divider */}
      <WaveDivider color="#f8fafc" />

      {/* CTA Section avec animation au scroll */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-cyan-50/50 to-violet-50/50"
      >
        {/* Effet de bordure supérieure */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20" />

        {/* Effets de fond animés */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-100/20 via-transparent to-violet-100/20"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-50/30 via-transparent to-transparent"
        />

        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-2 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-4"
            >
              Commencez maintenant
            </motion.span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Prêt à commencer ?
            </h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-1 bg-gradient-to-r from-cyan-500 to-violet-500 mx-auto rounded-full max-w-xs mb-8"
            />
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Rejoignez notre communauté et commencez à louer ou à partager vos
              outils technologiques dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/tools"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Explorer les outils
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Créer un compte
                <Sparkles className="ml-2 w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
