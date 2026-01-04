import axiosInstance from '../../utils/axios';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface IDictionaryItem {
  id: number;
  term: string;
  definition: string | null;
  description: string | null;
  category: {
    id: number;
    name: string;
  };
}

export interface IDictionaryItemApiResponse {
  id: number;
  term: string;
  definition: string | null;
  description: string | null;
  category: {
    id: number;
    name: string;
  };
}

export interface DictionaryItemListApiResponse extends PaginatedResponse<IDictionaryItemApiResponse> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IDictionaryItemApiResponse[];
}

export interface DictionaryItemQueryParams extends QueryParams {
  category?: number;
  term?: string;
  term__icontains?: string;
  definition?: string;
  definition__icontains?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface DictionaryItemListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IDictionaryItem[];
}

/**
 * Transform API response to internal format
 */
function transformApiResponseToItem(apiResponse: IDictionaryItemApiResponse): IDictionaryItem {
  return {
    id: apiResponse.id,
    term: apiResponse.term,
    definition: apiResponse.definition,
    description: apiResponse.description,
    category: {
      id: apiResponse.category.id,
      name: apiResponse.category.name,
    },
  };
}

/**
 * Fetch dictionary items with optional category filter
 */
export async function getDictionaryItems(params?: DictionaryItemQueryParams): Promise<DictionaryItemListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size !== undefined && params.page_size !== null) queryParams.page_size = params.page_size;
  if (params?.category) queryParams.category = params.category;
  if (params?.term) queryParams.term = params.term;
  if (params?.term__icontains) queryParams.term__icontains = params.term__icontains;
  if (params?.definition) queryParams.definition = params.definition;
  if (params?.definition__icontains) queryParams.definition__icontains = params.definition__icontains;
  if (params?.search) queryParams.search = params.search;
  if (params?.ordering) queryParams.ordering = params.ordering;

  try {
    const response = await axiosInstance.get<DictionaryItemListApiResponse>('/dictionary-items/', {
      params: queryParams,
    });

    return {
      count: response.data?.count || 0,
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      page: response.data?.page || 1,
      results: (response.data?.results || []).map(transformApiResponseToItem),
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to fetch dictionary items');
  }
}

export interface CreateDictionaryItemRequest {
  term: string;
  category: number;
  definition?: string | null;
  description?: string | null;
}

export interface UpdateDictionaryItemRequest {
  term?: string;
  category?: number;
  definition?: string | null;
  description?: string | null;
}

/**
 * Create a new dictionary item
 */
export async function createDictionaryItem(data: CreateDictionaryItemRequest): Promise<IDictionaryItem> {
  try {
    const response = await axiosInstance.post<IDictionaryItemApiResponse>('/dictionary-items/', data);
    return transformApiResponseToItem(response.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.term?.[0] || 
                        error?.response?.data?.category?.[0] || 
                        error?.response?.data?.detail || 
                        error?.message || 
                        'Failed to create dictionary item';
    throw new Error(errorMessage);
  }
}

/**
 * Update dictionary item
 */
export async function updateDictionaryItem(
  id: string | number,
  data: UpdateDictionaryItemRequest
): Promise<IDictionaryItem> {
  try {
    const response = await axiosInstance.patch<IDictionaryItemApiResponse>(`/dictionary-items/${id}/`, data);
    return transformApiResponseToItem(response.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.term?.[0] || 
                        error?.response?.data?.category?.[0] || 
                        error?.response?.data?.detail || 
                        error?.message || 
                        'Failed to update dictionary item';
    throw new Error(errorMessage);
  }
}

/**
 * Delete dictionary item
 */
export async function deleteDictionaryItem(id: string | number): Promise<void> {
  try {
    await axiosInstance.delete(`/dictionary-items/${id}/`);
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to delete dictionary item');
  }
}

