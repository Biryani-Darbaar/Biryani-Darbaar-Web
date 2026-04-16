import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail } from "@/utils/validation";
import { getErrorMessage, LoginModalProps } from "@/types";
import { loginFormFields } from "@/contents/FormFields";
import toast from "react-hot-toast";

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
}) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // On login we only check format — NOT password strength rules.
    // The user's stored password may have been created under different rules.
    const emailError = validateEmail(formData.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      await login({ email: formData.email, password: formData.password });
      toast.success("Welcome back! Successfully logged in.");
      onClose();
      // Reset form
      setFormData({ email: "", password: "" });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: "", password: "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginFormFields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {field.label}
                  </label>
                  {field.type === "password" ? (
                    <div className="relative">
                      <input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                        required={field.required}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Register link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-red-600 font-semibold hover:text-red-700 transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
