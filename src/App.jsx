import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ScrollToTop from "./components/ScrollToTop";
import { BookingProvider, useBooking } from "./context/BookingContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

// Auth Pages
const Login = lazy(() => import("./pages/Auth/Login"));

// Booking Pages
const SelectService = lazy(() => import("./pages/booking/SelectService"));
const HomeType = lazy(() => import("./pages/booking/HomeType"));
const DateTime = lazy(() => import("./pages/booking/DateTime"));
const Summary = lazy(() => import("./pages/booking/Summary"));
const Address = lazy(() => import("./pages/booking/Address"));
const Payment = lazy(() => import("./pages/booking/Payment"));
const Confirmation = lazy(() => import("./pages/booking/Confirmation"));

// Dashboard & Profile
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WorkerFlowDemo = lazy(() => import("./pages/WorkerFlowDemo"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Mission = lazy(() => import("./pages/Mission"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount"));
const Careers = lazy(() => import("./pages/Careers"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 rounded-full border-4 border-[#3d8bff]/20 border-t-[#3d8bff] animate-spin" />
    </div>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const location = useLocation();

  if (!token || !user) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Component (for login/register - prevents access if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      // If already logged in, redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, location, navigate]);

  if (token && user) {
    // Return null while redirecting
    return null;
  }

  return children;
};

// Protected Booking Route Component
const ProtectedBookingRoute = ({ children }) => {
  const { canAccessStep } = useBooking();
  const location = useLocation();

  if (!canAccessStep(location.pathname)) {
    return <Navigate to="/book/service" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const isDemoPage = location.pathname === "/worker";

  return (
    <div
      className={`relative min-h-screen bg-white text-slate-900 ${!isDemoPage ? "pt-[132px] sm:pt-[148px]" : ""
        }`}
    >
      {!isDemoPage && (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#fef3c7,#ffffff)] animate-pulse" />
      )}
      {!isDemoPage && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/careers" element={<Careers />} />

          {/* Demo */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute>
                <WorkerFlowDemo />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
          {/* <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          /> */}

          {/* Booking */}
          <Route path="/book" element={<Navigate to="/book/service" replace />} />
          <Route
            path="/book/service"
            element={
              <ProtectedBookingRoute>
                <SelectService />
              </ProtectedBookingRoute>
            }
          />
          <Route
            path="/book/home-type"
            element={
              <ProtectedBookingRoute>
                <HomeType />
              </ProtectedBookingRoute>
            }
          />

          {/* <Route
            path="/book/date-time"
            element={
              <ProtectedBookingRoute>
                <DateTime />
              </ProtectedBookingRoute>
            }
          /> */}
          <Route
            path="/book/summary"
            element={
              <ProtectedBookingRoute>
                <Summary />
              </ProtectedBookingRoute>
            }
          />
          <Route
            path="/book/address"
            element={
              <ProtectedBookingRoute>
                <Address />
              </ProtectedBookingRoute>
            }
          />
          <Route
            path="/book/payment"
            element={
              <ProtectedBookingRoute>
                <Payment />
              </ProtectedBookingRoute>
            }
          />
          <Route
            path="/book/confirmation"
            element={
              <ProtectedBookingRoute>
                <Confirmation />
              </ProtectedBookingRoute>
            }
          />

          {/* Dashboard & Profile */}
          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </Suspense>
      {!isDemoPage && <Footer />}
      {!isDemoPage && <WhatsAppFloat />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <BookingProvider>
          <ScrollToTop />
          {/* <SmoothScroll> */}
          <AppContent />
          {/* </SmoothScroll> */}
        </BookingProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
