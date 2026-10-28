// Validation utility functions

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return null;
};

export const validateName = (
  name: string,
  fieldName: string = "Name"
): string | null => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters`;
  return null;
};

/**
 * Normalises an Australian mobile to 04XXXXXXXX — the format stored on the
 * account and sent to the POS. Strips spaces/dashes and converts +61 4… → 04….
 */
export const normalizeAustralianPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("614") && digits.length === 11 ? "0" + digits.slice(2) : digits;
};

/** Australian mobile, format 04XX XXX XXX (spaces allowed). */
export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone || !phone.trim()) return "Phone number is required";
  if (!/^04\d{8}$/.test(normalizeAustralianPhone(phone))) {
    return "Enter a valid Australian mobile number in the format 04XX XXX XXX";
  }
  return null;
};

export const validateAddress = (address: string): string | null => {
  if (!address) return "Address is required";
  if (address.length < 10) return "Address must be at least 10 characters";
  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};

export const validateMessage = (message: string): string | null => {
  if (!message || !message.trim()) return "Message is required";
  if (message.trim().length < 10)
    return "Message must be at least 10 characters long";
  return null;
};
