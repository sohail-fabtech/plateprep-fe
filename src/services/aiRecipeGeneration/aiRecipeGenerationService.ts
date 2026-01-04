import axiosInstance from '../../utils/axios';

// ----------------------------------------------------------------------

export interface GenerateAIRecipeRequest {
  cuisine_style: string;
  menu_class: string;
  seasonalIngredients: string;
  dietary_preferences: string;
  theme: string;
  available_ingredients: string[];
  price_range: number;
  target_audience: string;
  dietary_restrictions: string;
  status: string;
  priority: string;
}

export interface GenerateAIRecipeResponse {
  id?: number;
  message?: string;
  recipe?: any;
  [key: string]: any;
}

/**
 * Extract user-friendly error message from API error response
 */
function getErrorMessage(error: any): string {
  // Handle network errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  // Handle API response errors
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data;

    // Authentication errors
    if (status === 401) {
      return 'Your session has expired. Please login again.';
    }

    // Permission errors
    if (status === 403) {
      return errorData?.detail || 'You do not have permission to perform this action.';
    }

    // Validation errors (400)
    if (status === 400) {
      if (errorData?.detail) {
        return errorData.detail;
      }

      if (errorData?.non_field_errors) {
        const nonFieldErrors = Array.isArray(errorData.non_field_errors)
          ? errorData.non_field_errors
          : [errorData.non_field_errors];
        return nonFieldErrors[0] || 'Validation error occurred.';
      }

      // Handle field-specific validation errors
      const errorMessages: string[] = [];
      Object.keys(errorData).forEach((field) => {
        if (field === 'error' || field === 'detail' || field === 'non_field_errors') return;

        if (Array.isArray(errorData[field])) {
          errorData[field].forEach((msg: string) => {
            errorMessages.push(`${field}: ${msg}`);
          });
        } else if (typeof errorData[field] === 'string') {
          errorMessages.push(`${field}: ${errorData[field]}`);
        }
      });

      if (errorMessages.length > 0) {
        return errorMessages.join(', ');
      }

      return 'Please check your input and try again.';
    }

    // Server errors (500, 502, 503, 504)
    if (status >= 500) {
      return 'Server error occurred. Please try again later. If the problem persists, contact support.';
    }

    // Other HTTP errors
    const detail = errorData?.detail || errorData?.error || errorData?.message;
    if (detail) {
      return detail;
    }

    return `Request failed with status ${status}. Please try again.`;
  }

  // Handle request errors (no response)
  if (error.request) {
    return 'No response from server. Please check your internet connection and try again.';
  }

  // Handle other errors
  return error?.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.';
}

/**
 * Generate AI recipe
 */
export async function generateAIRecipe(
  data: GenerateAIRecipeRequest
): Promise<GenerateAIRecipeResponse> {
  try {
    const response = await axiosInstance.post<GenerateAIRecipeResponse>(
      '/ai-recipe-generation/generate_recipe/',
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}

