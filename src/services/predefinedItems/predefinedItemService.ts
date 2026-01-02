import axiosInstance from '../../utils/axios';
import { PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface IPredefinedItem {
  id: number;
  name: string;
  type: string | null;
}

export interface IPredefinedItemApiResponse {
  id: number;
  name: string | null;
  type: string | null;
}

export interface PredefinedItemQueryParams {
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface PredefinedItemListResponse extends PaginatedResponse<IPredefinedItem> {}

/**
 * Transform API response to internal format
 */
function transformApiResponseToPredefinedItem(apiResponse: IPredefinedItemApiResponse): IPredefinedItem {
  return {
    id: apiResponse.id,
    name: apiResponse.name || '',
    type: apiResponse.type,
  };
}

/**
 * Fetch predefined ingredients
 */
export async function getPredefinedIngredients(
  params?: PredefinedItemQueryParams
): Promise<PredefinedItemListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<PaginatedResponse<IPredefinedItemApiResponse>>(
    '/predefined-ingredients/',
    {
      params: queryParams,
    }
  );

  return {
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
    page: response.data.page || 1,
    results: (response.data.results || []).map(transformApiResponseToPredefinedItem),
  };
}

/**
 * Fetch predefined starch
 */
export async function getPredefinedStarch(
  params?: PredefinedItemQueryParams
): Promise<PredefinedItemListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<PaginatedResponse<IPredefinedItemApiResponse>>(
    '/predefined-starch/',
    {
      params: queryParams,
    }
  );

  return {
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
    page: response.data.page || 1,
    results: (response.data.results || []).map(transformApiResponseToPredefinedItem),
  };
}

/**
 * Fetch predefined vegetables
 */
export async function getPredefinedVegetables(
  params?: PredefinedItemQueryParams
): Promise<PredefinedItemListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<PaginatedResponse<IPredefinedItemApiResponse>>(
    '/predefined-vegetables/',
    {
      params: queryParams,
    }
  );

  return {
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
    page: response.data.page || 1,
    results: (response.data.results || []).map(transformApiResponseToPredefinedItem),
  };
}

