import axiosInstance from '../../utils/axios';
import { IVideoGeneration } from '../../@types/videoGeneration';
import { QueryParams } from '../common/types';

// ----------------------------------------------------------------------

export interface RecipeVideoQueryParams extends QueryParams {
  page_size?: number;
  search?: string;
  dish_name?: string;
  ordering?: string;
  is_deleted?: boolean;
  // Add other RecipeFilter parameters as needed
}

export interface RecipeVideoApiResponse {
  id: number;
  dish_name: string | null;
  video: string; // Absolute URL
}

export interface RecipeVideoApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: RecipeVideoApiResponse[];
}

export interface RecipeVideoListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IVideoGeneration[]; // Results are transformed to IVideoGeneration format
}

/**
 * Transform API response to UI format
 */
function transformApiResponseToVideoGeneration(apiResponse: RecipeVideoApiResponse): IVideoGeneration {
  return {
    id: apiResponse.id,
    dish_name: apiResponse.dish_name || 'Untitled Recipe',
    video: apiResponse.video,
    status: 'live', // Default status since API doesn't provide it
    isArchived: false, // Default since API doesn't provide archived status
  };
}

/**
 * Fetch list of recipe videos
 */
export async function getRecipeVideos(params?: RecipeVideoQueryParams): Promise<RecipeVideoListResponse> {
  const queryParams: Record<string, string | number | boolean> = {};

  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.page_size !== undefined && params.page_size !== null) {
    queryParams.page_size = params.page_size;
  }
  if (params?.search) queryParams.search = params.search;
  if (params?.dish_name) queryParams.dish_name = params.dish_name;
  if (params?.ordering) queryParams.ordering = params.ordering;
  if (params?.is_deleted !== undefined) queryParams.is_deleted = params.is_deleted;

  try {
    const response = await axiosInstance.get<RecipeVideoApiListResponse>('/recipe/recipe_videos/', {
      params: queryParams,
    });

    // Transform results to UI format
    return {
      ...response.data,
      results: response.data.results.map(transformApiResponseToVideoGeneration),
    };
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      if (status === 403) {
        const detail = errorData?.detail || 'You do not have permission to view recipe videos.';
        throw new Error(detail);
      }

      if (status === 400) {
        const detail = errorData?.error || errorData?.detail || 'Invalid request parameters.';
        throw new Error(detail);
      }

      if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Generic error message
      throw new Error(errorData?.error || errorData?.detail || errorData?.message || 'An error occurred while fetching recipe videos.');
    }

    // Network or other errors
    throw new Error(error.message || 'Failed to fetch recipe videos. Please check your connection.');
  }
}

/**
 * Fetch single recipe video by ID
 */
export async function getRecipeVideoById(id: string | number): Promise<IVideoGeneration> {
  try {
    // Since the API doesn't have a detail endpoint, we'll search for the specific ID
    const response = await axiosInstance.get<RecipeVideoApiListResponse>('/recipe/recipe_videos/', {
      params: {
        search: id.toString(),
      },
    });

    const recipe = response.data.results?.find((r) => r.id === Number(id));
    
    if (!recipe) {
      throw new Error('Recipe video not found.');
    }

    return transformApiResponseToVideoGeneration(recipe);
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      if (status === 403) {
        const detail = errorData?.detail || 'You do not have permission to view this recipe video.';
        throw new Error(detail);
      }

      if (status === 400) {
        const detail = errorData?.error || errorData?.detail || 'Invalid request.';
        throw new Error(detail);
      }

      if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Generic error message
      throw new Error(errorData?.error || errorData?.detail || errorData?.message || 'An error occurred while fetching recipe video.');
    }

    // Network or other errors
    if (error.message && error.message !== 'Recipe video not found.') {
      throw error;
    }
    throw new Error(error.message || 'Failed to fetch recipe video. Please check your connection.');
  }
}

