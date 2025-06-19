import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/store/useAuth";
import { Booking, BookingStatus } from "@/interfaces/booking/booking.interface";
import { Tool } from "@/interfaces/tools/tool";
import { BookingCard } from "@/components/booking/BookingCard";
import { BookingDetailsModal } from "@/components/booking/BookingDetailsModal";
import {
  Calendar,
  Filter,
  Search,
  ArrowUpDown,
  Banknote,
  CheckCircle2,
  ChevronDown,
  Plus,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bookingService } from "@/services/bookingService";
import { toolService } from "@/services/toolService";
import { toast } from "react-hot-toast";

type SortField = "date" | "price" | "status";
type SortOrder = "asc" | "desc";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Palette de couleurs
const MAIN_COLOR = "#2563eb";
const MENU_BG = "bg-[#f6faff]";

const STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "En attente",
  [BookingStatus.CONFIRMED]: "Confirmée",
  [BookingStatus.CANCELLED]: "Annulée",
  [BookingStatus.COMPLETED]: "Terminée",
};

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const [selectedBooking, setSelectedBooking] = useState<{
    booking: Booking;
    tool: Tool;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(
    "ALL"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const loadBookings = useCallback(async () => {
    if (user) {
      try {
        console.log("Loading bookings for user:", user);
        const data = await bookingService.getBookings();
        console.log("Received bookings:", data);
        setBookings(data);

        // Récupérer les outils de manière séquentielle pour éviter les problèmes de race condition
        const toolMap: Record<string, Tool> = {};
        for (const booking of data) {
          if (!booking.toolId) {
            console.error("Booking without toolId:", booking);
            continue;
          }

          try {
            console.log("Fetching tool:", booking.toolId);
            const tool = await toolService.getToolById(booking.toolId);
            console.log("Received tool:", tool);
            toolMap[booking.toolId] = tool;
          } catch (error) {
            console.error(`Error fetching tool ${booking.toolId}:`, error);
            // Créer un outil par défaut pour les outils non trouvés
            toolMap[booking.toolId] = {
              id: booking.toolId,
              name: "Outil non disponible",
              brand: "N/A",
              model: "N/A",
              description: "Cet outil n'est plus disponible",
              category: "N/A",
              etat: "N/A",
              dailyPrice: booking.totalPrice,
              caution: 0,
              isInsured: false,
              owner: {
                id: "deleted",
                firstName: "Compte",
                lastName: "supprimé",
              },
              images: ["/img/fallback-tool.png"],
              status: "maintenance",
              location: { type: "Point", coordinates: [0, 0] },
              address: "N/A",
              rating: 0,
              rentalCount: 0,
              createdAt: booking.createdAt,
              updatedAt: booking.createdAt,
            };
          }
        }
        console.log("Final toolMap:", toolMap);
        setTools(toolMap);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error(
          "Une erreur est survenue lors du chargement des réservations"
        );
      }
    }
  }, [user]);

  useEffect(() => {
    console.log("BookingsPage mounted, loading bookings...");
    loadBookings();
  }, [loadBookings]);

  const handleFilterChange = (status: BookingStatus | "ALL") => {
    setStatusFilter(status);
    if (status !== "ALL" && !activeFilters.includes(status)) {
      setActiveFilters([...activeFilters, status]);
    } else if (status === "ALL") {
      setActiveFilters([]);
    }
  };

  const removeFilter = (status: BookingStatus) => {
    setActiveFilters(activeFilters.filter((f) => f !== status));
    if (statusFilter === status) {
      setStatusFilter("ALL");
    }
  };

  console.log("Current bookings:", bookings);
  console.log("Current tools:", tools);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
        >
          <div className="flex flex-col space-y-6">
            {/* Titre et description */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Mes Réservations
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Gérez vos réservations d'outils en toute simplicité
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-6 h-12 rounded-xl font-semibold text-white text-base shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ background: MAIN_COLOR }}
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                  <Plus className="w-5 h-5" />
                </span>
                Nouvelle réservation
              </button>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
              {/* Recherche */}
              <div className="relative flex-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Rechercher une réservation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full h-12 pl-12 pr-4 rounded-xl border-2 ${
                    isSearchFocused
                      ? `border-[${MAIN_COLOR}]`
                      : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm`}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Filtres actifs */}
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((status) => (
                  <div
                    key={status}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-sm font-medium`}
                  >
                    <span>{STATUS_LABELS[status as BookingStatus]}</span>
                    <button
                      onClick={() => removeFilter(status as BookingStatus)}
                      className="hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {/* Trier par */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsSortOpen(!isSortOpen);
                      setIsFilterOpen(false);
                    }}
                    className={`flex items-center gap-2 min-w-[140px] h-12 rounded-xl border-2 font-medium text-gray-900 bg-white hover:bg-blue-50 transition-all duration-200 shadow-sm ${
                      isSortOpen ? `border-[${MAIN_COLOR}]` : "border-gray-300"
                    }`}
                  >
                    <ArrowUpDown className="w-5 h-5" />
                    <span>Trier par</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isSortOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isSortOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-44 ${MENU_BG} rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in`}
                    >
                      <div className="p-1.5">
                        <button
                          onClick={() => {
                            setSortField("date");
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                            sortField === "date"
                              ? "bg-blue-100 text-blue-900 font-semibold"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span>Par date</span>
                          {sortField === "date" && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSortField("price");
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                            sortField === "price"
                              ? "bg-blue-100 text-blue-900 font-semibold"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <Banknote className="w-4 h-4" />
                          </div>
                          <span>Par prix</span>
                          {sortField === "price" && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSortField("status");
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                            sortField === "status"
                              ? "bg-blue-100 text-blue-900 font-semibold"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span>Par statut</span>
                          {sortField === "status" && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Filtrer */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsFilterOpen(!isFilterOpen);
                      setIsSortOpen(false);
                    }}
                    className={`flex items-center gap-2 min-w-[140px] h-12 rounded-xl border-2 font-medium text-gray-900 bg-white hover:bg-blue-50 transition-all duration-200 shadow-sm ${
                      isFilterOpen
                        ? `border-[${MAIN_COLOR}]`
                        : "border-gray-300"
                    }`}
                  >
                    <Filter className="w-5 h-5" />
                    <span>Filtrer</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isFilterOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isFilterOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-44 ${MENU_BG} rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in`}
                    >
                      <div className="p-1.5">
                        <button
                          onClick={() => {
                            handleFilterChange("ALL");
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                            statusFilter === "ALL"
                              ? "bg-blue-100 text-blue-900 font-semibold"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span>Tous les statuts</span>
                          {statusFilter === "ALL" && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleFilterChange(BookingStatus.PENDING);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                            statusFilter === BookingStatus.PENDING
                              ? "bg-blue-100 text-blue-900 font-semibold"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span>En attente</span>
                          {statusFilter === BookingStatus.PENDING && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleFilterChange(BookingStatus.CONFIRMED);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                            statusFilter === BookingStatus.CONFIRMED
                              ? "bg-blue-100 text-blue-900 font-semibold"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span>Confirmée</span>
                          {statusFilter === BookingStatus.CONFIRMED && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleFilterChange(BookingStatus.CANCELLED);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                            statusFilter === BookingStatus.CANCELLED
                              ? "bg-blue-100 text-blue-900 font-semibold"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <span>Annulée</span>
                          {statusFilter === BookingStatus.CANCELLED && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleFilterChange(BookingStatus.COMPLETED);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left ${
                            statusFilter === BookingStatus.COMPLETED
                              ? "bg-blue-100 text-blue-900 font-semibold"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span>Terminée</span>
                          {statusFilter === BookingStatus.COMPLETED && (
                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des réservations moderne */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            {bookings.map((booking) => {
              if (!booking.toolId) return null;

              const tool = tools[booking.toolId];
              if (!tool) return null;

              return (
                <BookingCard
                  key={
                    booking.id + "-" + booking.toolId + "-" + booking.startDate
                  }
                  booking={{
                    toolName: tool.name,
                    reservedAt: booking.createdAt,
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                    price: booking.totalPrice.toLocaleString(),
                    status: booking.status.toLowerCase(),
                    paymentStatus: booking.paymentStatus.toLowerCase(),
                    owner: tool.owner
                      ? `${tool.owner.firstName} ${tool.owner.lastName}`.trim()
                      : "Propriétaire inconnu",
                    image: tool.images?.[0] || "/img/fallback-tool.png",
                  }}
                  onDetails={() => setSelectedBooking({ booking, tool })}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Modale de détails moderne */}
        <AnimatePresence>
          {selectedBooking && (
            <BookingDetailsModal
              isOpen={!!selectedBooking}
              onClose={() => setSelectedBooking(null)}
              booking={selectedBooking.booking}
              tool={selectedBooking.tool}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
