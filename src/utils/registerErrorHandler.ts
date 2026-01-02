// ----------------------------------------------------------------------

export interface RegisterError {
  general?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  restaurant?: {
    restaurant_name?: string;
    street_address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
}

// ----------------------------------------------------------------------

/**
 * Parses register API error responses and returns structured error object
 * Handles different error formats:
 * - { detail: "message" } - General errors
 * - { first_name: ["error"], email: ["error"], resturant: {...} } - Field-level validation errors (400)
 * - Nested restaurant errors: { resturant: { resturant_name: ["error"] } }
 */
export function parseRegisterError(error: any): RegisterError {
  const result: RegisterError = {};

  // Handle Axios error response structure
  const errorData = error?.response?.data || error?.data || error;

  // Check for general error message (detail field)
  if (errorData?.detail) {
    result.general = errorData.detail;
    return result;
  }

  // Handle user field-level validation errors
  if (errorData?.first_name) {
    const first_nameErrors = Array.isArray(errorData.first_name)
      ? errorData.first_name
      : [errorData.first_name];
    result.first_name = first_nameErrors[0] || 'Invalid first name';
  }

  if (errorData?.last_name) {
    const last_nameErrors = Array.isArray(errorData.last_name)
      ? errorData.last_name
      : [errorData.last_name];
    result.last_name = last_nameErrors[0] || 'Invalid last name';
  }

  if (errorData?.email) {
    const emailErrors = Array.isArray(errorData.email) ? errorData.email : [errorData.email];
    result.email = emailErrors[0] || 'Invalid email';
  }

  if (errorData?.password) {
    const passwordErrors = Array.isArray(errorData.password)
      ? errorData.password
      : [errorData.password];
    result.password = passwordErrors[0] || 'Invalid password';
  }

  // Handle nested restaurant errors (backend uses "resturant" misspelling)
  if (errorData?.resturant) {
    result.restaurant = {};

    const restaurantErrors = errorData.resturant;

    // Handle restaurant_name (backend: resturant_name, frontend: restaurant_name)
    if (restaurantErrors?.resturant_name) {
      const nameErrors = Array.isArray(restaurantErrors.resturant_name)
        ? restaurantErrors.resturant_name
        : [restaurantErrors.resturant_name];
      result.restaurant.restaurant_name = nameErrors[0] || 'Invalid restaurant name';
    }

    // Handle other restaurant fields
    if (restaurantErrors?.street_address) {
      const addressErrors = Array.isArray(restaurantErrors.street_address)
        ? restaurantErrors.street_address
        : [restaurantErrors.street_address];
      result.restaurant.street_address = addressErrors[0] || 'Invalid street address';
    }

    if (restaurantErrors?.city) {
      const cityErrors = Array.isArray(restaurantErrors.city)
        ? restaurantErrors.city
        : [restaurantErrors.city];
      result.restaurant.city = cityErrors[0] || 'Invalid city';
    }

    if (restaurantErrors?.state) {
      const stateErrors = Array.isArray(restaurantErrors.state)
        ? restaurantErrors.state
        : [restaurantErrors.state];
      result.restaurant.state = stateErrors[0] || 'Invalid state';
    }

    if (restaurantErrors?.zipcode) {
      const zipcodeErrors = Array.isArray(restaurantErrors.zipcode)
        ? restaurantErrors.zipcode
        : [restaurantErrors.zipcode];
      result.restaurant.zipcode = zipcodeErrors[0] || 'Invalid zipcode';
    }

    if (restaurantErrors?.country) {
      const countryErrors = Array.isArray(restaurantErrors.country)
        ? restaurantErrors.country
        : [restaurantErrors.country];
      result.restaurant.country = countryErrors[0] || 'Invalid country';
    }

    if (restaurantErrors?.phone) {
      const phoneErrors = Array.isArray(restaurantErrors.phone)
        ? restaurantErrors.phone
        : [restaurantErrors.phone];
      result.restaurant.phone = phoneErrors[0] || 'Invalid phone';
    }

    if (restaurantErrors?.email) {
      const emailErrors = Array.isArray(restaurantErrors.email)
        ? restaurantErrors.email
        : [restaurantErrors.email];
      result.restaurant.email = emailErrors[0] || 'Invalid email';
    }
  }

  // If we have field errors but no general error, set a general message
  if (
    (result.first_name ||
      result.last_name ||
      result.email ||
      result.password ||
      result.restaurant) &&
    !result.general
  ) {
    result.general = 'Please correct the errors below';
  }

  // Fallback: if no structured error found, use error message
  if (
    !result.general &&
    !result.first_name &&
    !result.last_name &&
    !result.email &&
    !result.password &&
    !result.restaurant
  ) {
    result.general = error?.message || errorData?.message || 'An error occurred during registration';
  }

  return result;
}

