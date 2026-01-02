// ----------------------------------------------------------------------

export interface ForgotPasswordConfirmError {
  general?: string;
  id?: string;
  token?: string;
  new_password?: string;
}

// ----------------------------------------------------------------------

/**
 * Parses forgot password confirm API error responses and returns structured error object
 * Handles different error formats:
 * - { error: "message" } - General errors (400)
 * - { id: ["error"], token: ["error"], new_password: ["error"] } - Field-level validation errors (400)
 * - { detail: "message" } - Server errors (500)
 */
export function parseForgotPasswordConfirmError(error: any): ForgotPasswordConfirmError {
  const result: ForgotPasswordConfirmError = {};

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
  if (errorData?.id) {
    const idErrors = Array.isArray(errorData.id) ? errorData.id : [errorData.id];
    result.id = idErrors[0] || 'Invalid ID';
  }

  if (errorData?.token) {
    const tokenErrors = Array.isArray(errorData.token) ? errorData.token : [errorData.token];
    result.token = tokenErrors[0] || 'Invalid token';
  }

  if (errorData?.new_password) {
    const passwordErrors = Array.isArray(errorData.new_password)
      ? errorData.new_password
      : [errorData.new_password];
    result.new_password = passwordErrors[0] || 'Invalid password';
  }

  // If we have field errors but no general error, set a general message
  if ((result.id || result.token || result.new_password) && !result.general) {
    result.general = 'Please correct the errors below';
  }

  // Fallback: if no structured error found, use error message
  if (!result.general && !result.id && !result.token && !result.new_password) {
    result.general = error?.message || errorData?.message || 'An error occurred. Please try again.';
  }

  return result;
}

