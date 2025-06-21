import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  CalendarCheck,
  Wrench,
  Phone,
  Mail,
  DollarSign,
  Tag,
} from "lucide-react";
import { ReceivedBooking } from "@/interfaces/booking/received-booking.interface";
import { ReceivedBookingStatus } from "./ReceivedBookingStatus";

interface InfoWidgetProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const InfoWidget = ({ icon, title, children }: InfoWidgetProps) => (
  <section>
    <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-4">
      {icon}
      {title}
    </h4>
    <div className="space-y-4">{children}</div>
  </section>
);

interface ReceivedBookingModalProps {
  booking: ReceivedBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.98, y: 10, transition: { duration: 0.2 } },
};

export const ReceivedBookingModal = ({
  booking,
  isOpen,
  onClose,
}: ReceivedBookingModalProps) => {
  if (!booking) return null;

  const memberSince = new Date(booking.renter.createdAt).toLocaleDateString(
    "fr-FR",
    {
      year: "numeric",
      month: "long",
    }
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 pl-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-800">
                  {booking.tool.name}
                </h2>
                <ReceivedBookingStatus
                  status={booking.status}
                  paymentStatus={booking.paymentStatus}
                  type="booking"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Contenu principal */}
            <main className="p-6 overflow-y-auto grid grid-cols-12 gap-x-12">
              {/* Colonne de Gauche */}
              <div className="col-span-12 md:col-span-7 space-y-6">
                <InfoWidget icon={<Wrench className="w-5 h-5" />} title="Outil">
                  <div className="flex gap-4 group">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:shadow-blue-500/20 group-hover:scale-105">
                      <img
                        src={booking.tool.image}
                        alt={booking.tool.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-800">
                        {booking.tool.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {booking.tool.category}
                      </p>
                      <p className="text-sm text-gray-600 pt-1">
                        {booking.tool.description}
                      </p>
                    </div>
                  </div>
                </InfoWidget>

                <hr className="border-gray-200/80" />

                <InfoWidget
                  icon={<User className="w-5 h-5" />}
                  title="Locataire"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {booking.renter.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Membre depuis {memberSince}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`mailto:${booking.renter.email}`}
                      className="flex items-center gap-4 text-gray-700 hover:text-blue-600 transition-all duration-300 group hover:-translate-y-px"
                    >
                      <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {booking.renter.email}
                      </span>
                    </a>
                    <a
                      href={`tel:${booking.renter.phone}`}
                      className="flex items-center gap-4 text-gray-700 hover:text-blue-600 transition-all duration-300 group hover:-translate-y-px"
                    >
                      <Phone className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-sm">
                        {booking.renter.phone}
                      </span>
                    </a>
                  </div>
                </InfoWidget>
              </div>

              {/* Colonne de Droite */}
              <div className="col-span-12 md:col-span-5 space-y-6">
                <InfoWidget
                  icon={<CalendarCheck className="w-5 h-5" />}
                  title="Période de location"
                >
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Du</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {new Date(booking.startDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Au</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {new Date(booking.endDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </InfoWidget>

                <hr className="border-gray-200/80" />

                <InfoWidget
                  icon={<DollarSign className="w-5 h-5" />}
                  title="Détails Financiers"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-green-50/60 p-3 rounded-lg border border-green-200 transition-all duration-300 ease-in-out hover:-translate-y-px hover:shadow-lg hover:shadow-green-500/15">
                      <p className="font-medium text-green-800 text-sm">
                        Prix Total
                      </p>
                      <p className="font-bold text-green-800 text-base">
                        {booking.totalPrice.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-300 transition-all duration-300 ease-in-out hover:-translate-y-px hover:shadow-lg hover:shadow-gray-400/15">
                      <p className="font-medium text-gray-700 text-sm">
                        Caution
                      </p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {booking.depositAmount.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </InfoWidget>

                <hr className="border-gray-200/80" />

                <InfoWidget icon={<Tag className="w-5 h-5" />} title="Statuts">
                  <div className="flex flex-wrap gap-2">
                    <ReceivedBookingStatus
                      status={booking.status}
                      paymentStatus={booking.paymentStatus}
                      type="booking"
                    />
                    <ReceivedBookingStatus
                      status={booking.status}
                      paymentStatus={booking.paymentStatus}
                      type="payment"
                    />
                  </div>
                </InfoWidget>
              </div>
            </main>

            {/* Footer */}
            <footer className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              <p className="text-xs text-gray-400">
                ID Réservation:{" "}
                <span className="text-gray-500">{booking.id}</span>
              </p>
              <button
                onClick={onClose}
                className="group flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
              >
                <span>Fermer</span>
                <X className="w-0 h-4 opacity-0 transition-all duration-300 ease-in-out group-hover:w-4 group-hover:opacity-100" />
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
