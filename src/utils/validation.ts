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
 * Validates an Australian phone number.
 * Accepted formats (spaces allowed anywhere):
 *   04XX XXX XXX  — mobile local
 *   +61 4XX XXX XXX — mobile international
 *   02/03/07/08 XXXX XXXX — landline local
 *   +61 2/3/7/8 XXXX XXXX — landline international
 *
 * Regex (applied after stripping all spaces):
 *   /^(\+61[2-9]\d{8}|0[2-9]\d{8})$/
 */
export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return "Phone number is required";
  const stripped = phone.replace(/\s+/g, ""); // remove all spaces
  const auPhoneRegex = /^(\+61[2-9]\d{8}|0[2-9]\d{8})$/;
  if (!auPhoneRegex.test(stripped)) {
    return "Enter a valid Australian number (e.g. 0412 345 678 or +61 412 345 678)";
  }
  return null;
};

/**
 * Normalises any accepted Australian phone format to E.164 (+61XXXXXXXXX).
 * Safe to call only after validatePhoneNumber passes.
 */
export const normalizeAustralianPhone = (phone: string): string => {
  const stripped = phone.replace(/\s+/g, "");
  if (stripped.startsWith("+61")) return stripped;
  // local format: 0XXXXXXXXX → +61XXXXXXXXX
  return "+61" + stripped.slice(1);
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
