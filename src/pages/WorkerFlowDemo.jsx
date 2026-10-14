import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ProfileSetupStepper from "../components/worker-flow/ProfileSetupStepper";
import ProfileView from "../components/worker-flow/ProfileView";
import KYCStatusScreen from "../components/worker-flow/KYCStatusScreen";
import DashboardNoJobs from "../components/worker-flow/DashboardNoJobs";
import DashboardWithJobs from "../components/worker-flow/DashboardWithJobs";
import JobDetailsView from "../components/worker-flow/JobDetailsView";
import ServiceInProgress from "../components/worker-flow/ServiceInProgress";
import ServiceCompleted from "../components/worker-flow/ServiceCompleted";
import WalletEarnings from "../components/worker-flow/WalletEarnings";
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  ShieldCheck,
  User,
  Menu,
  X,
} from "lucide-react";

const SCREENS = [
  // { id: 1, name: "Profile Setup", component: ProfileSetupStepper, category: "profile", isSetup: true },
  {
    id: 9,
    name: "Profile",
    component: ProfileView,
    category: "profile",
    isSetup: false,
  },
  {
    id: 2,
    name: "KYC Status",
    component: KYCStatusScreen,
    category: "approvals",
  },
  {
    id: 3,
    name: "Dashboard (No Jobs)",
    component: DashboardNoJobs,
    category: "jobs",
  },
  {
    id: 4,
    name: "Dashboard (With Jobs)",
    component: DashboardWithJobs,
    category: "jobs",
  },
  { id: 5, name: "Job Details", component: JobDetailsView, category: "jobs" },
  {
    id: 6,
    name: "Service In Progress",
    component: ServiceInProgress,
    category: "jobs",
  },
  {
    id: 7,
    name: "Service Completed",
    component: ServiceCompleted,
    category: "jobs",
  },
  {
    id: 8,
    name: "Wallet & Earnings",
    component: WalletEarnings,
    category: "jobs",
  },
];

const STORAGE_KEY = "worker_current_screen";
const PROFILE_STORAGE_KEY = "worker_profile_data";
const CLEAR_KEYS = [
  STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  "worker_profile_completed",
];

const NAV_TABS = [
  { id: "jobs", label: "Jobs", icon: Briefcase, screens: [3, 4, 5, 6, 7, 8] },

  { id: "profile", label: "Profile", icon: User, screens: [9] },
];

export default function WorkerFlowDemo() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Check if profile is completed
  const isProfileCompleted = () => {
    // Check explicit completion flag first
    const completedFlag = localStorage.getItem("worker_profile_completed");
    if (completedFlag === "true") return true;

    // Fallback: check if all required fields are filled
    const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!profileData) return false;
    const data = JSON.parse(profileData);
    return (
      data.fullName &&
      data.phoneNumber &&
      data.email &&
      data.services &&
      data.services.length > 0
    );
  };

  const [profileCompleted, setProfileCompleted] =
    useState(isProfileCompleted());
  const [currentScreen, setCurrentScreen] = useState(() => {
    // Load saved screen or default to profile setup if not completed
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isProfileCompleted()) {
      const screenIndex = parseInt(saved);
      return screenIndex >= 0 && screenIndex < SCREENS.length ? screenIndex : 0;
    }
    return 0; // Start with Profile Setup
  });
  const [activeTab, setActiveTab] = useState(() => {
    const currentCategory = SCREENS[currentScreen]?.category || "profile";
    return NAV_TABS.find((tab) => tab.id === currentCategory)?.id || "profile";
  });

  const handleGoHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    CLEAR_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("logout"));
    toast.success("Logged out successfully");
    setProfileCompleted(false);
    setCurrentScreen(0);
    setActiveTab("profile");
    setMobileNavOpen(false);
    navigate("/");
  };

  // Save current screen to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentScreen.toString());
    // Update active tab based on current screen
    const currentCategory = SCREENS[currentScreen]?.category || "profile";
    const tab = NAV_TABS.find((tab) => tab.id === currentCategory);
    if (tab) {
      setActiveTab(tab.id);
    }
  }, [currentScreen]);

  // Check profile completion status
  useEffect(() => {
    const checkProfile = () => {
      const completed = isProfileCompleted();
      setProfileCompleted(completed);
      if (!completed && currentScreen !== 0) {
        // If profile not completed, go back to profile setup
        setCurrentScreen(0);
      } else if (completed && currentScreen === 0) {
        // If profile completed and on profile screen, optionally restore saved screen
        const savedScreen = localStorage.getItem(STORAGE_KEY);
        if (savedScreen) {
          const screenIndex = parseInt(savedScreen);
          if (screenIndex >= 0 && screenIndex < SCREENS.length) {
            setCurrentScreen(screenIndex);
          }
        }
        // Do not force-redirect away from Profile when user clicks Profile
      }
    };

    // Check on mount
    checkProfile();

    // Listen for profile completion event
    const handleProfileCompleted = () => {
      checkProfile();
    };

    window.addEventListener("profileCompleted", handleProfileCompleted);

    // Also check periodically for localStorage changes
    const interval = setInterval(checkProfile, 500);

    return () => {
      window.removeEventListener("profileCompleted", handleProfileCompleted);
      clearInterval(interval);
    };
  }, [currentScreen]);

  // Auto-move past approvals after 10s for demo
  useEffect(() => {
    const isApprovalScreen = SCREENS[currentScreen]?.category === "approvals";
    if (!profileCompleted || !isApprovalScreen) return;

    const timer = setTimeout(() => {
      // Jump to first jobs screen for a quick demo flow
      setCurrentScreen(3);
    }, 10000);

    return () => clearTimeout(timer);
  }, [profileCompleted, currentScreen]);

  const nextScreen = () => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileNavOpen(false);
    if (tabId === "jobs") {
      const preferredIndex = SCREENS.findIndex((s) => s.id === 4);
      if (preferredIndex !== -1) {
        setCurrentScreen(preferredIndex);
        return;
      }
    }
    const tab = NAV_TABS.find((t) => t.id === tabId);
    if (tab && tab.screens.length > 0) {
      const screenIndex = SCREENS.findIndex((s) => tab.screens.includes(s.id));
      if (screenIndex !== -1) {
        setCurrentScreen(screenIndex);
      }
    }
  };

  const CurrentComponent = SCREENS[currentScreen].component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header - Show only if profile is completed */}
      {profileCompleted ? (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <h1 className="text-base font-semibold text-gray-900">
                Worker Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <nav className="hidden md:flex items-center gap-2">
                  <button
                    onClick={handleGoHome}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-100"
                  >
                    Home
                  </button>
                  {NAV_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          isActive
                            ? "bg-[#3d8bff] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </nav>
                <button
                  onClick={() => setMobileNavOpen((o) => !o)}
                  className="md:hidden flex items-center justify-center p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
                  aria-label="Toggle menu"
                >
                  {mobileNavOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          {mobileNavOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleGoHome}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    Home
                  </button>
                  {NAV_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? "bg-[#3d8bff] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Simple header when profile not completed
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">
                Complete Your Profile
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{SCREENS[currentScreen].name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Screen */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {!profileCompleted && (
        <>
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevScreen}
                  disabled={currentScreen === 0}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                    currentScreen === 0
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {SCREENS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentScreen(index)}
                      className={`h-1.5 rounded-full transition-colors ${
                        index === currentScreen
                          ? "bg-[#3d8bff] w-8"
                          : "bg-gray-300 hover:bg-gray-400 w-1.5"
                      }`}
                      aria-label={`Go to ${SCREENS[index].name}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextScreen}
                  disabled={currentScreen === SCREENS.length - 1}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                    currentScreen === SCREENS.length - 1
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-[#3d8bff] text-white hover:bg-[#4060EE]"
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Spacer for fixed navigation */}
          <div className="h-16" />
        </>
      )}
    </div>
  );
}
