import axiosInstance from '../../utils/axios';

// ----------------------------------------------------------------------

/**
 * Step API Response Type
 */
export interface IStepApiResponse {
  id: number;
  title: string;
}

/**
 * Fetch steps by recipe ID
 * @param recipeId - Recipe ID
 * @returns Array of step objects
 */
export async function getStepsByRecipeId(
  recipeId: string | number
): Promise<IStepApiResponse[]> {
  try {
    const response = await axiosInstance.get<IStepApiResponse[]>('/step/', {
      params: {
        recipe: recipeId,
      },
    });

    return response.data || [];
  } catch (error: any) {
    // Handle error response
    if (error?.response?.data) {
      const errorData = error.response.data;
      
      // Handle field-level errors
      if (typeof errorData === 'object' && !errorData.detail && !errorData.error) {
        const fieldErrors = Object.keys(errorData)
          .map((field) => `${field}: ${Array.isArray(errorData[field]) ? errorData[field].join(', ') : errorData[field]}`)
          .join('; ');
        throw new Error(fieldErrors || 'Failed to fetch steps.');
      }
      
      // Handle detail/error messages
      const errorMsg = errorData?.detail || errorData?.error || errorData?.message;
      if (errorMsg) {
        throw new Error(typeof errorMsg === 'string' ? errorMsg : 'Failed to fetch steps.');
      }
    }
    
    throw new Error(error?.message || 'Failed to fetch steps. Please check your connection.');
  }
}

