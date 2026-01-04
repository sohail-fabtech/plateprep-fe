import axiosInstance from '../../utils/axios';

// ----------------------------------------------------------------------

/**
 * Ingredient API Response Type
 */
export interface IIngredientApiResponse {
  id: number;
  title: string;
  quantity: string | null;
  unit: string;
  recipe: number;
}

/**
 * Fetch ingredients by recipe ID
 * @param recipeId - Recipe ID
 * @returns Array of ingredient objects
 */
export async function getIngredientsByRecipeId(
  recipeId: string | number
): Promise<IIngredientApiResponse[]> {
  try {
    const response = await axiosInstance.get<IIngredientApiResponse[]>('/ingredients/', {
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
        throw new Error(fieldErrors || 'Failed to fetch ingredients.');
      }
      
      // Handle detail/error messages
      const errorMsg = errorData?.detail || errorData?.error || errorData?.message;
      if (errorMsg) {
        throw new Error(typeof errorMsg === 'string' ? errorMsg : 'Failed to fetch ingredients.');
      }
    }
    
    throw new Error(error?.message || 'Failed to fetch ingredients. Please check your connection.');
  }
}

