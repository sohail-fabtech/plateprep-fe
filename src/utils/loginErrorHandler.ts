// ----------------------------------------------------------------------

export interface LoginError {
  general?: string;
  email?: string;
  password?: string;
}

// ----------------------------------------------------------------------

/**
 * Parses login API error responses and returns structured error object
 * Handles different error formats:
 * - { detail: "message" } - General errors (401, 404)
 * - { email: ["error"], password: ["error"] } - Field-level validation errors (400)
 */
export function parseLoginError(error: any): LoginError {
  const result: LoginError = {};

  // Handle Axios error response structure
  const errorData = error?.response?.data || error?.data || error;

  // Check for general error message (detail field)
  if (errorData?.detail) {
    result.general = errorData.detail;
    return result;
  }

  // Handle field-level validation errors (400 Bad Request)
  if (errorData?.email) {
    // email field can be an array of error messages or a single string
    const emailErrors = Array.isArray(errorData.email) ? errorData.email : [errorData.email];
    result.email = emailErrors[0] || 'Invalid email';
  }

  if (errorData?.password) {
    // password field can be an array of error messages or a single string
    const passwordErrors = Array.isArray(errorData.password)
      ? errorData.password
      : [errorData.password];
    result.password = passwordErrors[0] || 'Invalid password';
  }

  // If we have field errors but no general error, set a general message
  if ((result.email || result.password) && !result.general) {
    result.general = 'Please correct the errors below';
  }

  // Fallback: if no structured error found, use error message
  if (!result.general && !result.email && !result.password) {
    result.general = error?.message || errorData?.message || 'An error occurred during login';
  }

  return result;
}

