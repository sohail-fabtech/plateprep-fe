import axiosInstance from '../../utils/axios';
import { IRecipe } from '../../@types/recipe';
import { IRecipeApiResponse } from '../../@types/recipeApi';
import {
  transformApiResponseToRecipe,
  transformListApiResponseToRecipe,
  transformRecipeToApiRequest,
  IRecipeListItemApiResponse,
  IRecipeApiRequest,
} from '../../utils/recipeAdapter';
import { QueryParams, PaginatedResponse } from '../common/types';
import { getMenuCategories, IMenuCategory } from '../menuCategories/menuCategoryService';
import { queryClient } from '../queryClient';
import { menuCategoryKeys } from '../menuCategories/menuCategoryHooks';

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
 * Get menu categories from cache or fetch if not available
 * This prevents repeated API calls by using TanStack Query cache
 */
async function getMenuCategoriesCached(): Promise<IMenuCategory[]> {
  // Try to get from cache first
  const cachedData = queryClient.getQueryData<IMenuCategory[]>(menuCategoryKeys.list());
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch and cache it
  // Use ensureQueryData to leverage TanStack Query's caching
  return queryClient.ensureQueryData<IMenuCategory[]>({
    queryKey: menuCategoryKeys.list(),
    queryFn: () => getMenuCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Create new recipe
 */
export async function createRecipe(recipe: Partial<IRecipe>): Promise<IRecipe> {
  // Get menu categories from cache or fetch if not available
  const menuCategories = await getMenuCategoriesCached();
  const apiRequest: IRecipeApiRequest = transformRecipeToApiRequest(recipe, menuCategories);
  const response = await axiosInstance.post<IRecipeApiResponse>('/recipe/', apiRequest);
  return transformApiResponseToRecipe(response.data);
}

/**
 * Update recipe (PATCH)
 */
export async function updateRecipe(id: string | number, recipe: Partial<IRecipe>): Promise<IRecipe> {
  // Get menu categories from cache or fetch if not available
  const menuCategories = await getMenuCategoriesCached();
  const apiRequest: IRecipeApiRequest = transformRecipeToApiRequest(recipe, menuCategories);
  const response = await axiosInstance.patch<IRecipeApiResponse>(`/recipe/${id}/`, apiRequest);
  return transformApiResponseToRecipe(response.data);
}

/**
 * Update recipe (PUT - full update)
 */
export async function updateRecipeFull(id: string | number, recipe: Partial<IRecipe>): Promise<IRecipe> {
  // Get menu categories from cache or fetch if not available
  const menuCategories = await getMenuCategoriesCached();
  const apiRequest: IRecipeApiRequest = transformRecipeToApiRequest(recipe, menuCategories);
  const response = await axiosInstance.put<IRecipeApiResponse>(`/recipe/${id}/`, apiRequest);
  return transformApiResponseToRecipe(response.data);
}

/**
 * Delete recipe (soft delete/archive)
 * Sets is_deleted=True
 */
export async function deleteRecipe(id: string | number): Promise<void> {
  await axiosInstance.delete(`/recipe/${id}/`);
}

/**
 * Restore archived recipe
 * Sets is_deleted=False
 */
export interface RestoreRecipeResponse {
  message: string;
}

export async function restoreRecipe(id: string | number): Promise<RestoreRecipeResponse> {
  const response = await axiosInstance.patch<RestoreRecipeResponse>('/recipe/restore/', {
    pk: typeof id === 'string' ? parseInt(id, 10) : id,
  });
  return response.data;
}

/**
 * Permanently delete recipe
 * Removes recipe from database (cannot be undone)
 */
export interface PermanentlyDeleteRecipeResponse {
  message: string;
}

export async function permanentlyDeleteRecipe(id: string | number): Promise<PermanentlyDeleteRecipeResponse> {
  const response = await axiosInstance.delete<PermanentlyDeleteRecipeResponse>('/recipe/delete/', {
    params: {
      pk: typeof id === 'string' ? parseInt(id, 10) : id,
    },
  });
  return response.data;
}

/**
 * Fetch list of draft recipes with pagination
 */
export async function getDraftRecipes(params?: RecipeQueryParams): Promise<RecipeListResponse> {
  // Build query params, only including defined values
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.dish_name) queryParams.dish_name = params.dish_name;
  if (params?.cusinie_type && params.cusinie_type !== 'all') queryParams.cusinie_type = params.cusinie_type;
  if (params?.status) queryParams.status = params.status;
  if (params?.branch) queryParams.branch = params.branch;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<{
    count: number;
    next: string | null;
    previous: string | null;
    page: number;
    results: IRecipeListItemApiResponse[];
  }>('/recipe/get-draft/', {
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

