// ----------------------------------------------------------------------

export interface ForgotPasswordError {
  general?: string;
  email?: string;
}

// ----------------------------------------------------------------------

/**
 * Parses forgot password API error responses and returns structured error object
 * Handles different error formats:
 * - { error: "message" } - General errors (400)
 * - { email: ["error"] } - Field-level validation errors (400)
 * - { detail: "message" } - Server errors (500)
 */
export function parseForgotPasswordError(error: any): ForgotPasswordError {
  const result: ForgotPasswordError = {};

  // Handle Axios error response structure
  const errorData = error?.response?.data || error?.data || error;

  // Check for general error message (error field)
  if (errorData?.error) {
    result.general = errorData.error;
    return result;
  }

  // Check for detail field (server errors)
  if (errorData?.detail) {
    result.general = errorData.detail;
    return result;
  }

  // Handle field-level validation errors (400 Bad Request)
  if (errorData?.email) {
    const emailErrors = Array.isArray(errorData.email) ? errorData.email : [errorData.email];
    result.email = emailErrors[0] || 'Invalid email';
  }

  // If we have field errors but no general error, set a general message
  if (result.email && !result.general) {
    result.general = 'Please correct the errors below';
  }

  // Fallback: if no structured error found, use error message
  if (!result.general && !result.email) {
    result.general = error?.message || errorData?.message || 'An error occurred. Please try again.';
  }

  return result;
}

