import axiosInstance from '../../utils/axios';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface IDictionaryCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface IDictionaryCategoryApiResponse {
  id: number;
  name: string;
  description: string | null;
}

export interface DictionaryCategoryListApiResponse extends PaginatedResponse<IDictionaryCategoryApiResponse> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IDictionaryCategoryApiResponse[];
}

export interface DictionaryCategoryQueryParams extends QueryParams {
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface DictionaryCategoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IDictionaryCategory[];
}

export interface CreateDictionaryCategoryRequest {
  name: string;
  description?: string | null;
}

export interface UpdateDictionaryCategoryRequest {
  name?: string;
  description?: string | null;
}

/**
 * Transform API response to internal format
 */
function transformApiResponseToCategory(apiResponse: IDictionaryCategoryApiResponse): IDictionaryCategory {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    description: apiResponse.description,
  };
}

/**
 * Fetch all dictionary categories
 */
export async function getDictionaryCategories(params?: DictionaryCategoryQueryParams): Promise<DictionaryCategoryListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size !== undefined && params.page_size !== null) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.ordering) queryParams.ordering = params.ordering;

  try {
    const response = await axiosInstance.get<DictionaryCategoryListApiResponse>('/api/dictionary-category/', {
      params: queryParams,
    });

    return {
      count: response.data?.count || 0,
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      page: response.data?.page || 1,
      results: (response.data?.results || []).map(transformApiResponseToCategory),
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to fetch dictionary categories');
  }
}

/**
 * Fetch dictionary category by ID
 */
export async function getDictionaryCategoryById(id: string | number): Promise<IDictionaryCategory> {
  try {
    const response = await axiosInstance.get<IDictionaryCategoryApiResponse>(`/api/dictionary-category/${id}/`);
    return transformApiResponseToCategory(response.data);
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to fetch dictionary category');
  }
}

/**
 * Create a new dictionary category
 */
export async function createDictionaryCategory(data: CreateDictionaryCategoryRequest): Promise<IDictionaryCategory> {
  try {
    const response = await axiosInstance.post<IDictionaryCategoryApiResponse>('/api/dictionary-category/', data);
    return transformApiResponseToCategory(response.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.name?.[0] || error?.response?.data?.detail || error?.message || 'Failed to create dictionary category';
    throw new Error(errorMessage);
  }
}

/**
 * Update dictionary category
 */
export async function updateDictionaryCategory(
  id: string | number,
  data: UpdateDictionaryCategoryRequest
): Promise<IDictionaryCategory> {
  try {
    const response = await axiosInstance.patch<IDictionaryCategoryApiResponse>(`/api/dictionary-category/${id}/`, data);
    return transformApiResponseToCategory(response.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.name?.[0] || error?.response?.data?.detail || error?.message || 'Failed to update dictionary category';
    throw new Error(errorMessage);
  }
}

/**
 * Delete dictionary category (soft delete)
 */
export async function deleteDictionaryCategory(id: string | number): Promise<void> {
  try {
    await axiosInstance.delete(`/api/dictionary-category/${id}/`);
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to delete dictionary category');
  }
}

