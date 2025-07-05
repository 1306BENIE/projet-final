export const ReceivedBookingCardSkeleton = () => {
  return (
    <div className="group bg-white rounded-2xl shadow-[0_2px_8px_0_rgba(0,0,0,0.06),0_8px_32px_0_rgba(16,38,73,0.10)] transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col transform-gpu">
      <div className="animate-pulse">
        {/* Header avec image et statut */}
        <div className="relative">
          <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 w-full overflow-hidden">
            <div className="w-full h-full bg-gray-300"></div>
          </div>
          {/* Badges placeholders */}
          <div className="absolute top-3 right-3">
            <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
          </div>
          <div className="absolute top-3 left-3">
            <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Contenu principal - Divulgation Progressive */}
        <div className="p-4 flex-grow flex flex-col border-t border-gray-50/80 bg-gradient-to-b from-white via-white to-gray-50/60">
          {/* En-tête de la carte : Titre et bouton Détails */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="w-12 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Locataire - Information essentielle */}
          <div className="mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="flex-grow">
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          {/* Dates - Information essentielle */}
          <div className="mb-3">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100/60 shadow-sm">
              <div className="w-4 h-4 bg-gray-300 rounded flex-shrink-0"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>

          {/* Prix Total - Information essentielle (mise en avant) */}
          <div className="mb-3">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center shadow-md relative">
              <div className="h-3 bg-gray-300 rounded w-20 mx-auto mb-1"></div>
              <div className="h-6 bg-gray-300 rounded w-24 mx-auto"></div>
              <div className="mt-1.5 w-10 h-0.5 bg-gray-300 rounded-full mx-auto"></div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-3 border-t border-gray-100/80">
            <div className="flex gap-2 justify-center">
              <div className="h-8 bg-gray-300 rounded-lg flex-1"></div>
              <div className="h-8 bg-gray-300 rounded-lg flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
