import React from "react";

const SkeletonOverlay: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 transition-opacity duration-300">
    <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white flex flex-col gap-4 items-center">
      {/* Skeleton shimmer blocks */}
      <div className="relative w-2/3 h-6 bg-gray-200 rounded overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="relative w-1/2 h-4 bg-gray-200 rounded overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="relative w-full h-10 bg-gray-200 rounded overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="relative w-1/3 h-4 bg-gray-200 rounded overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="relative w-1/2 h-8 bg-gray-200 rounded overflow-hidden mt-4">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="text-blue-700 text-sm font-medium mt-6 text-center">
        Votre réservation est validée !<br />
        Redirection vers le paiement sécurisé...
      </div>
      <div aria-live="polite" className="sr-only">
        Redirection vers la page de paiement en cours...
      </div>
    </div>
  </div>
);

export default SkeletonOverlay;
