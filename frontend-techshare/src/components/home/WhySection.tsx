import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Users, CheckCircle } from "lucide-react";

export default function WhySection() {
  return (
    <section
      id="why"
      className="py-24 px-2 sm:px-4 bg-gradient-to-b from-[#f7fafd] to-white"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-['Poppins'] font-bold text-primary mb-4">
            Pourquoi choisir TechShare ?
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            La solution la plus simple, sécurisée et rentable pour louer ou
            partager du matériel tech en Côte d'Ivoire.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring" }}
            className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-8 shadow-lg hover:shadow-xl flex flex-col items-center border border-blue-100/50 backdrop-blur-sm"
          >
            <div className="bg-blue-100/80 p-4 rounded-2xl mb-6">
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-['Poppins'] font-semibold text-primary mb-3">
              Rentabilité
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Rentabilisez vos équipements tech inutilisés en toute simplicité.
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-gradient-to-br from-white to-violet-50/50 rounded-2xl p-8 shadow-lg hover:shadow-xl flex flex-col items-center border border-violet-100/50 backdrop-blur-sm"
          >
            <div className="bg-violet-100/80 p-4 rounded-2xl mb-6">
              <ShieldCheck className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-['Poppins'] font-semibold text-primary mb-3">
              Sécurité
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Utilisateurs vérifiés, paiement sécurisé, assurance sur chaque
              location.
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring" }}
            className="bg-gradient-to-br from-white to-cyan-50/50 rounded-2xl p-8 shadow-lg hover:shadow-xl flex flex-col items-center border border-cyan-100/50 backdrop-blur-sm"
          >
            <div className="bg-cyan-100/80 p-4 rounded-2xl mb-6">
              <Users className="w-10 h-10 text-cyan-600" />
            </div>
            <h3 className="text-xl font-['Poppins'] font-semibold text-primary mb-3">
              Communauté
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Rejoignez une communauté tech active et bienveillante.
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring" }}
            className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl p-8 shadow-lg hover:shadow-xl flex flex-col items-center border border-emerald-100/50 backdrop-blur-sm"
          >
            <div className="bg-emerald-100/80 p-4 rounded-2xl mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-['Poppins'] font-semibold text-primary mb-3">
              Éco-responsable
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Réduisez le gaspillage électronique, adoptez la tech circulaire.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
