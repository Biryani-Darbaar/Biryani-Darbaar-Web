import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhoneNumber,
  normalizeAustralianPhone,
} from "@/utils/validation";
import { getErrorMessage, RegisterModalProps } from "@/types";
import toast from "react-hot-toast";

// ─── Form persistence helpers ─────────────────────────────────────────────────

const PERSIST_KEY = "registerFormDraft";

/** Fields that are safe to persist. Password is intentionally excluded. */
type PersistedFields = Pick<
  FormData,
  "firstName" | "lastName" | "email" | "phoneNumber" | "address"
>;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  /** Local part of the AU phone number (without +61 prefix) */
  phoneNumber: string;
  address: string;
};

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  address: "",
};

// ─── Password strength rules ──────────────────────────────────────────────────

interface PasswordRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (pw) => pw.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: "numOrSpecial",
    label: "One number or special character",
    test: (pw) => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  },
];

type StrengthLevel = "empty" | "weak" | "fair" | "strong";

const getStrength = (pw: string, rules: PasswordRule[]): StrengthLevel => {
  if (!pw) return "empty";
  const passed = rules.filter((r) => r.test(pw)).length;
  if (passed === rules.length) return "strong";
  if (passed >= 2) return "fair";
  return "weak";
};

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  empty: "",
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
};

const STRENGTH_COLOURS: Record<StrengthLevel, string> = {
  empty: "bg-gray-200",
  weak: "bg-red-400",
  fair: "bg-yellow-400",
  strong: "bg-green-500",
};

const STRENGTH_TEXT: Record<StrengthLevel, string> = {
  empty: "text-gray-400",
  weak: "text-red-500",
  fair: "text-yellow-600",
  strong: "text-green-600",
};

/** Read persisted fields from localStorage. Returns partial data on error. */
const loadDraft = (): Partial<PersistedFields> => {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedFields>;
    // Only accept known string fields — reject anything unexpected
    const safe: Partial<PersistedFields> = {};
    const allowed: (keyof PersistedFields)[] = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "address",
    ];
    for (const key of allowed) {
      if (typeof parsed[key] === "string") safe[key] = parsed[key];
    }
    return safe;
  } catch {
    return {};
  }
};

const saveDraft = (data: FormData) => {
  try {
    const draft: PersistedFields = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(draft));
  } catch {
    // localStorage quota exceeded or unavailable — silently ignore
  }
};

const clearDraft = () => {
  try {
    localStorage.removeItem(PERSIST_KEY);
  } catch {
    // ignore
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const INPUT_CLASS =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-60";

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { register } = useAuth();

  // Initialise form with any persisted draft
  const [formData, setFormData] = useState<FormData>(() => ({
    ...EMPTY_FORM,
    ...loadDraft(),
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce timer ref — write to localStorage 400ms after last keystroke
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived password strength (computed inline — no useState needed)
  const pwStrength = getStrength(formData.password, PASSWORD_RULES);
  const strengthFilled =
    pwStrength === "empty"
      ? 0
      : pwStrength === "weak"
        ? 1
        : pwStrength === "fair"
          ? 2
          : 3;

  // ── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDraft(formData), 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [formData]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build the full phone number for validation (prefix + local)
    const fullPhone = `+61${formData.phoneNumber.replace(/\s+/g, "")}`;

    const firstNameError = validateName(formData.firstName, "First name");
    const lastNameError = validateName(formData.lastName, "Last name");
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const phoneError = validatePhoneNumber(fullPhone);

    if (firstNameError) {
      toast.error(firstNameError);
      return;
    }
    if (lastNameError) {
      toast.error(lastNameError);
      return;
    }
    if (emailError) {
      toast.error(emailError);
      return;
    }
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    const addressError =
      !formData.address || formData.address.trim().length < 10
        ? "Address must be at least 10 characters"
        : null;
    if (addressError) {
      toast.error(addressError);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        // Normalize to E.164 — backend also normalises as defence-in-depth
        phoneNumber: normalizeAustralianPhone(fullPhone),
        address: formData.address.trim(),
      });

      clearDraft();
      setFormData(EMPTY_FORM);
      toast.success(
        "Account created successfully! Welcome to Biryani Darbaar.",
      );
      onClose();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error) || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Closing the modal does NOT clear the draft — user can reopen and continue
  const handleClose = () => onClose();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-login flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm">
                Join Biryani Darbaar today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ── Name ── */}
              <div className="grid grid-cols-2 gap-3">
                {(["firstName", "lastName"] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field === "firstName" ? "First Name" : "Last Name"} *
                    </label>
                    <input
                      name={field}
                      type="text"
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder={field === "firstName" ? "Mohammed" : "Zaid"}
                      autoComplete={
                        field === "firstName" ? "given-name" : "family-name"
                      }
                      className={INPUT_CLASS}
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>

              {/* ── Email ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={INPUT_CLASS}
                  disabled={isLoading}
                />
              </div>

              {/* ── Task 4: AU Phone with fixed +61 prefix ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all">
                  {/* Fixed prefix — non-editable */}
                  <div className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border-r border-gray-300 select-none flex-shrink-0">
                    <span className="text-lg leading-none">🇦🇺</span>
                    <span className="text-sm font-semibold text-gray-700">
                      +61
                    </span>
                  </div>
                  {/* Local number input */}
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="412 345 678"
                    autoComplete="tel-national"
                    className="flex-1 px-3 py-3 bg-white outline-none text-gray-900 placeholder-gray-400 disabled:opacity-60"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Mobile: 4XX XXX XXX · Landline: 2/3/7/8 XXXX XXXX
                </p>
              </div>

              {/* ── Task 5: Single password field + strength meter ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    className={INPUT_CLASS}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Strength bar */}
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((segment) => (
                        <div
                          key={segment}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            segment <= strengthFilled
                              ? STRENGTH_COLOURS[pwStrength]
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                      <span
                        className={`text-xs font-semibold ml-2 leading-none self-center ${STRENGTH_TEXT[pwStrength]}`}
                      >
                        {STRENGTH_LABELS[pwStrength]}
                      </span>
                    </div>

                    {/* Rule checklist */}
                    <ul className="space-y-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(formData.password);
                        return (
                          <li
                            key={rule.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span
                              className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                                passed
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <Check size={10} strokeWidth={3} />
                            </span>
                            <span
                              className={
                                passed ? "text-green-700" : "text-gray-500"
                              }
                            >
                              {rule.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* ── Address ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your street address, suburb, state, postcode"
                  autoComplete="street-address"
                  rows={3}
                  className={INPUT_CLASS}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Minimum 10 characters required
                </p>
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? "Creating Account…" : "Create Account"}
              </button>
            </form>

            {/* Sign-in link */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <button
                  onClick={onSwitchToLogin}
                  className="text-red-600 font-semibold hover:text-red-700 transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal;
