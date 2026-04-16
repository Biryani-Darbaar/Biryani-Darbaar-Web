// Error type for API calls and error handling
export interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
      // Some error responses nest the message inside a data envelope
      data?: { message?: string };
    };
  };
}

// Type guard to check if error is ApiError (covers Axios errors too)
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
};

/**
 * Extract a human-readable message from any error type.
 *
 * Priority order:
 *  1. error.response.data.message   — direct backend message (most specific)
 *  2. error.response.data.data.message — nested envelope (legacy shape)
 *  3. error.message                  — Axios/JS Error message
 *  4. Fallback string
 */
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      error.message
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Export all type modules
export * from "./api.types";
export * from "./cart.types";
export * from "./common.types";
export * from "./component.types";
export * from "./hook.types";
export * from "./order.types";
