import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/store/auth";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { config } from "@/lib/config";
import PublicLayout from "@/components/layout/PublicLayout";
import PrivateLayout from "@/components/layout/PrivateLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import DetailLayout from "@/components/layout/DetailLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import RedirectAfterAuth from "@/components/RedirectAfterAuth";
import Home from "@/pages/home/Home";
import ToolList from "@/pages/tools/ToolsList";
import ToolDetail from "@/pages/tools/ToolDetail";
import MyTools from "@/pages/tools/MyTools";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import HowItWorks from "@/pages/how-it-works/HowItWorks";
import Dashboard from "@/pages/dashboard/Dashboard";
import Profile from "@/pages/profile/Profile";
import AddTool from "@/pages/tools/AddTool";
import EditTool from "@/pages/tools/EditTool";
import BookingsPage from "@/pages/bookings/BookingsPage";
import MyListings from "@/pages/listing/MyListings";
import BookTool from "@/pages/tools/BookTool";
import { TestPage } from "@/pages/TestPage";
import { Toaster } from "react-hot-toast";
import ReceivedBookings from "@/pages/bookings/ReceivedBookings";
import PaymentPage from "@/pages/bookings/PaymentPage";

// Initialiser Stripe
const stripePromise = loadStripe(config.stripe.publicKey);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Elements stripe={stripePromise}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fff",
                color: "#333",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                padding: "16px",
              },
              success: {
                style: {
                  background: "#22c55e",
                  color: "#fff",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
              },
            }}
          />
          <Routes>
            {/* Routes publiques */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/tools" element={<ToolList />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
            </Route>

            {/* Route de détail sans navbar/footer */}
            <Route element={<DetailLayout />}>
              <Route path="/tools/:id" element={<ToolDetail />} />
            </Route>

            {/* Routes d'authentification */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
            </Route>

            {/* Routes protégées */}
            <Route element={<ProtectedRoute />}>
              <Route element={<PrivateLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-tools" element={<MyTools />} />
                <Route path="/tools/add" element={<AddTool />} />
                <Route path="/tools/:id/edit" element={<EditTool />} />
                <Route path="/tools/:id/book" element={<BookTool />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/my-bookings" element={<BookingsPage />} />
                <Route
                  path="/received-bookings"
                  element={<ReceivedBookings />}
                />
                <Route path="/payment/:bookingId" element={<PaymentPage />} />
              </Route>
            </Route>

            {/* Route de test */}
            <Route path="/test" element={<TestPage />} />

            {/* Redirection après authentification */}
            <Route path="/auth" element={<RedirectAfterAuth />} />
          </Routes>
        </Elements>
      </AuthProvider>
    </BrowserRouter>
  );
}
