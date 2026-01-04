// ----------------------------------------------------------------------
// User Error Handler - Enterprise-level error parsing
// ----------------------------------------------------------------------

export interface UserError {
  general?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  date_of_birth?: string;
  street_address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  branch_id?: string;
  user_role_id?: string;
  role?: string;
  profile_image_url?: string;
}

/**
 * Maps API field names to form field names
 */
const FIELD_MAP: Record<string, string> = {
  first_name: 'firstName',
  last_name: 'lastName',
  phone_number: 'phoneNumber',
  date_of_birth: 'dateOfBirth',
  street_address: 'streetAddress',
  state_province: 'stateProvince',
  postal_code: 'postalCode',
  user_role_id: 'userRoleId',
  branch_id: 'branchId',
  profile_image_url: 'profileImage',
};

/**
 * Parses user API error responses and returns structured error object
 * Handles different error formats:
 * - { detail: "message" } - General errors (401, 403, 404)
 * - { first_name: ["error"], email: ["error"] } - Field-level validation errors (400)
 * - Network errors, server errors, etc.
 */
export function parseUserError(error: any): UserError {
  const result: UserError = {};

  // Handle Axios error response structure
  const errorData = error?.response?.data || error?.data || error;
  const status = error?.response?.status;

  // Handle network errors (no response)
  if (!error?.response && error?.request) {
    result.general = 'No response from server. Please check your internet connection and try again.';
    return result;
  }

  // Handle server errors (500, 502, 503, 504)
  if (status >= 500) {
    result.general =
      'Server error occurred. Please try again later. If the problem persists, contact support.';
    return result;
  }

  // Handle authentication/authorization errors
  if (status === 401) {
    result.general = errorData?.detail || 'Authentication required. Please log in again.';
    return result;
  }

  if (status === 403) {
    result.general =
      errorData?.detail ||
      'You do not have permission to perform this action. Please contact your administrator.';
    return result;
  }

  // Handle not found errors
  if (status === 404) {
    result.general = errorData?.detail || 'User not found.';
    return result;
  }

  // Handle validation errors (400 Bad Request)
  if (status === 400 && errorData && typeof errorData === 'object') {
    // Check for general error message (detail field)
    if (errorData.detail) {
      result.general = errorData.detail;
    }

    // Check for non_field_errors (general validation errors)
    if (errorData.non_field_errors) {
      const nonFieldErrors = Array.isArray(errorData.non_field_errors)
        ? errorData.non_field_errors
        : [errorData.non_field_errors];
      result.general = nonFieldErrors[0] || result.general;
    }

    // Handle field-specific validation errors
    Object.keys(errorData).forEach((field) => {
      // Skip generic error fields
      if (field === 'detail' || field === 'error' || field === 'message' || field === 'non_field_errors') {
        return;
      }

      // Get error message(s) for this field
      const fieldErrors = errorData[field];
      let errorMessage: string;

      if (Array.isArray(fieldErrors)) {
        // Multiple error messages - take the first one and trim whitespace
        errorMessage = (fieldErrors[0] || '').trim();
      } else if (typeof fieldErrors === 'string') {
        // Single error message - trim whitespace
        errorMessage = fieldErrors.trim();
      } else if (typeof fieldErrors === 'object' && fieldErrors !== null) {
        // Nested error object - try to extract meaningful message
        if (Array.isArray(Object.values(fieldErrors))) {
          const nestedArray = Object.values(fieldErrors)[0] as any;
          errorMessage = Array.isArray(nestedArray) ? nestedArray[0] : String(nestedArray);
        } else {
          errorMessage = JSON.stringify(fieldErrors);
        }
      } else {
        return; // Skip invalid error formats
      }

      if (!errorMessage) return;

      // Map API field name to form field name
      const formFieldName = FIELD_MAP[field] || field;

      // Store error in both API field name and form field name for flexibility
      (result as any)[field] = errorMessage;
      if (formFieldName !== field) {
        (result as any)[formFieldName] = errorMessage;
      }
    });

    // If we have field errors but no general error, set a general message
    if (Object.keys(result).length > 0 && !result.general) {
      result.general = 'Please correct the errors below and try again.';
    }
  }

  // Fallback: if no structured error found, use error message
  if (!result.general && Object.keys(result).length === 0) {
    result.general =
      error?.message || errorData?.message || errorData?.detail || 'An error occurred. Please try again.';
  }

  return result;
}

/**
 * Gets user-friendly error message for a specific field
 */
export function getFieldError(error: any, fieldName: string): string | undefined {
  const parsedError = parseUserError(error);
  return (parsedError as any)[fieldName] || parsedError.general;
}

/**
 * Gets all field errors as an object with form field names as keys
 */
export function getFieldErrors(error: any): Record<string, string> {
  const parsedError = parseUserError(error);
  const fieldErrors: Record<string, string> = {};

  Object.keys(parsedError).forEach((key) => {
    if (key !== 'general' && parsedError[key as keyof UserError]) {
      fieldErrors[key] = parsedError[key as keyof UserError]!;
    }
  });

  return fieldErrors;
}

