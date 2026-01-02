import axiosInstance from '../../utils/axios';
import { IRecipe } from '../../@types/recipe';
import { IRecipeApiResponse } from '../../@types/recipeApi';
import {
  transformApiResponseToRecipe,
  transformListApiResponseToRecipe,
  transformRecipeToApiRequest,
  IRecipeListItemApiResponse,
} from '../../utils/recipeAdapter';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface RecipeQueryParams extends QueryParams {
  // Search parameter (searches across multiple fields)
  search?: string;
  // Filter by dish name
  dish_name?: string;
  // Filter by cuisine type ID
  cusinie_type?: string;
  // Filter by draft status
  is_draft?: boolean;
  // Filter by status (P=Public, PR=Private)
  status?: string;
  // Filter by deleted status
  is_deleted?: boolean;
  // Filter by branch ID
  branch?: number;
  // Pagination
  page?: number;
  page_size?: number;
  // Ordering
  ordering?: string;
}

/**
 * Paginated recipe list response
 */
export interface RecipeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IRecipe[];
}

/**
 * Fetch recipe by ID
 */
export async function getRecipeById(id: string | number): Promise<IRecipe> {
  const response = await axiosInstance.get<IRecipeApiResponse>(`/recipe/${id}/`);
  return transformApiResponseToRecipe(response.data);
}

/**
 * Fetch list of recipes with pagination
 */
export async function getRecipes(params?: RecipeQueryParams): Promise<RecipeListResponse> {
  // Build query params, only including defined values
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.dish_name) queryParams.dish_name = params.dish_name;
  if (params?.cusinie_type && params.cusinie_type !== 'all') queryParams.cusinie_type = params.cusinie_type;
  if (params?.is_draft !== undefined) queryParams.is_draft = params.is_draft;
  if (params?.status) queryParams.status = params.status;
  if (params?.is_deleted !== undefined) queryParams.is_deleted = params.is_deleted;
  if (params?.branch) queryParams.branch = params.branch;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<{
    count: number;
    next: string | null;
    previous: string | null;
    page: number;
    results: IRecipeListItemApiResponse[];
  }>('/recipe/', {
    params: queryParams,
  });

  // Handle case where results might be undefined or null
  const results = response.data?.results || [];
  
  return {
    count: response.data?.count || 0,
    next: response.data?.next || null,
    previous: response.data?.previous || null,
    page: response.data?.page || 1,
    results: results.map(transformListApiResponseToRecipe),
  };
}

/**
 * Create new recipe
 */
export async function createRecipe(recipe: Partial<IRecipe>): Promise<IRecipe> {
  const apiRequest = transformRecipeToApiRequest(recipe);
  const response = await axiosInstance.post<IRecipeApiResponse>('/recipe/', apiRequest);
  return transformApiResponseToRecipe(response.data);
}

/**
 * Update recipe (PATCH)
 */
export async function updateRecipe(id: string | number, recipe: Partial<IRecipe>): Promise<IRecipe> {
  const apiRequest = transformRecipeToApiRequest(recipe);
  const response = await axiosInstance.patch<IRecipeApiResponse>(`/recipe/${id}/`, apiRequest);
  return transformApiResponseToRecipe(response.data);
}

/**
 * Update recipe (PUT - full update)
 */
export async function updateRecipeFull(id: string | number, recipe: Partial<IRecipe>): Promise<IRecipe> {
  const apiRequest = transformRecipeToApiRequest(recipe);
  const response = await axiosInstance.put<IRecipeApiResponse>(`/recipe/${id}/`, apiRequest);
  return transformApiResponseToRecipe(response.data);
}

/**
 * Delete recipe
 */
export async function deleteRecipe(id: string | number): Promise<void> {
  await axiosInstance.delete(`/recipe/${id}/`);
}

