import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Order from "@/pages/Order";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import OrderHistory from "@/pages/OrderHistory";
import OrderDetail from "@/pages/OrderDetail";
import About from "@/pages/About";
import SpecialOffer from "@/pages/SpecialOffers";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import NotFound from "@/pages/NotFound";

import Navbar from "@/components/bars/Navbar";
import Footer from "@/components/bars/Footer";
import Contact from "@/pages/Contact";
import LoginModal from "@/components/modals/LoginModal";
import RegisterModal from "@/components/modals/RegisterModal";

import { CartProvider } from "@/providers/CartProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ActiveOrderProvider } from "@/contexts/ActiveOrderContext";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import ActiveOrderWidget from "@/components/ActiveOrderWidget";
import SpinWheel from "@/components/SpinWheel";

import "./styles/global.css";
import "./styles/components.css";
import "./styles/sections.css";

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <WalletProvider>
          <ActiveOrderProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen relative">
                <Navbar />
                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/About" element={<About />} />
                    <Route path="/Menu" element={<Menu />} />
                    <Route path="/SpecialOffer" element={<SpecialOffer />} />
                    <Route path="/Contact" element={<Contact />} />
                    <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                    <Route path="/TC" element={<TermsAndConditions />} />
                    <Route
                      path="/Order"
                      element={
                        <ProtectedRoute>
                          <Order />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/Checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-success"
                      element={
                        <ProtectedRoute>
                          <OrderSuccess />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-history"
                      element={
                        <ProtectedRoute>
                          <OrderHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-history/:id"
                      element={
                        <ProtectedRoute>
                          <OrderDetail />
                        </ProtectedRoute>
                      }
                    />
                    {/* 404 Route - Must be last */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Footer />
              </div>
              {/* Persistent active order tracking widget */}
              <ActiveOrderWidget />
              {/* Daily spin-wheel popup */}
              <SpinWheelWrapper />
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#fff",
                    color: "#363636",
                    padding: "16px",
                    borderRadius: "8px",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </CartProvider>
          </ActiveOrderProvider>
          </WalletProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

// Spin-wheel wrapper — reads WalletContext, which lives inside WalletProvider
function SpinWheelWrapper() {
  const { showSpinWheel, setShowSpinWheel } = useWallet();
  return (
    <SpinWheel
      isOpen={showSpinWheel}
      onClose={() => setShowSpinWheel(false)}
    />
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Show login modal when user tries to access protected route
      setShowLoginModal(true);
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    // If user successfully logs in, they should see the protected content
    if (isAuthenticated && (showLoginModal || showRegisterModal)) {
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShouldRedirect(false);
    }
  }, [isAuthenticated, showLoginModal, showRegisterModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Handle modal close - redirect to home
  const handleModalClose = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShouldRedirect(true);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // If user closed modal without logging in, redirect to home
  if (shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, show the login modal
  if (!isAuthenticated) {
    return (
      <>
        <LoginModal
          isOpen={showLoginModal}
          onClose={handleModalClose}
          onSwitchToRegister={handleSwitchToRegister}
        />
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={handleModalClose}
          onSwitchToLogin={handleSwitchToLogin}
        />
        {/* Show a placeholder or the home page content while modal is open */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to continue</p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

export default App;
