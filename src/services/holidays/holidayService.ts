import axiosInstance from '../../utils/axios';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface IHoliday {
  id: number;
  holiday: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface IHolidayApiResponse {
  id: number;
  holiday: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface HolidayListApiResponse extends PaginatedResponse<IHolidayApiResponse> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IHolidayApiResponse[];
}

export interface HolidayQueryParams extends QueryParams {
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface HolidayListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IHoliday[];
}

/**
 * Transform API response to internal format
 */
function transformApiResponseToHoliday(apiResponse: IHolidayApiResponse): IHoliday {
  return {
    id: apiResponse.id,
    holiday: apiResponse.holiday,
    createdAt: apiResponse.created_at,
    updatedAt: apiResponse.updated_at,
    isDeleted: apiResponse.is_deleted,
  };
}

/**
 * Fetch all holidays
 */
export async function getHolidays(params?: HolidayQueryParams): Promise<HolidayListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size !== undefined && params.page_size !== null) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.ordering) queryParams.ordering = params.ordering;

  try {
    const response = await axiosInstance.get<HolidayListApiResponse>('/select-holiday/', {
      params: queryParams,
    });

    return {
      count: response.data?.count || 0,
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      page: response.data?.page || 1,
      results: (response.data?.results || []).map(transformApiResponseToHoliday),
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to fetch holidays');
  }
}

