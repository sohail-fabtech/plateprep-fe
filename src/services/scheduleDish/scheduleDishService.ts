import axiosInstance from '../../utils/axios';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface IScheduleDish {
  id: number;
  dish: {
    name: string;
    id: number;
  };
  holiday: number | null;
  scheduleDatetime: string;
  season: string | null;
  status: {
    name: string;
    value: string;
  };
  job: string | null;
  creator: number;
  createdAt: string;
}

export interface IScheduleDishApiResponse {
  id: number;
  dish: {
    name: string;
    id: number;
  };
  holiday: number | null;
  schedule_datetime: string;
  season: string | null;
  status: {
    name: string;
    value: string;
  };
  job: string | null;
  creator: number;
  created_at: string;
}

export interface ScheduleDishListApiResponse extends PaginatedResponse<IScheduleDishApiResponse> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IScheduleDishApiResponse[];
}

export interface ScheduleDishQueryParams extends QueryParams {
  dish?: string;
  schedule_datetime?: string;
  season?: string;
  holiday?: string;
  status?: string;
  assign_to?: string;
  branch?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface ScheduleDishListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IScheduleDish[];
}

export interface ScheduleDishRequest {
  dish: number;
  schedule_datetime: string; // ISO format
  holiday: number;
  season?: string | null;
}

export interface UpdateScheduleDishRequest {
  dish?: number;
  schedule_datetime?: string; // ISO format
  holiday?: number;
  season?: string | null;
  status?: 'IP' | 'CP' | 'PD';
}

export interface ScheduleDishResponse {
  message: string;
  job_id: string;
}

/**
 * Transform API response to internal format
 */
function transformApiResponseToSchedule(apiResponse: IScheduleDishApiResponse): IScheduleDish {
  return {
    id: apiResponse.id,
    dish: apiResponse.dish,
    holiday: apiResponse.holiday,
    scheduleDatetime: apiResponse.schedule_datetime,
    season: apiResponse.season,
    status: apiResponse.status,
    job: apiResponse.job,
    creator: apiResponse.creator,
    createdAt: apiResponse.created_at,
  };
}

/**
 * Fetch all scheduled dishes
 */
export async function getScheduleDishes(params?: ScheduleDishQueryParams): Promise<ScheduleDishListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size !== undefined && params.page_size !== null) queryParams.page_size = params.page_size;
  if (params?.dish) queryParams.dish = params.dish;
  if (params?.schedule_datetime) queryParams.schedule_datetime = params.schedule_datetime;
  if (params?.season) queryParams.season = params.season;
  if (params?.holiday) queryParams.holiday = params.holiday;
  if (params?.status) queryParams.status = params.status;
  if (params?.assign_to) queryParams.assign_to = params.assign_to;
  if (params?.branch) queryParams.branch = params.branch;
  if (params?.ordering) queryParams.ordering = params.ordering;

  try {
    const response = await axiosInstance.get<ScheduleDishListApiResponse>('/schedule-dish/', {
      params: queryParams,
    });

    return {
      count: response.data?.count || 0,
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      page: response.data?.page || 1,
      results: (response.data?.results || []).map(transformApiResponseToSchedule),
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to fetch scheduled dishes');
  }
}

/**
 * Fetch scheduled dish by ID
 */
export async function getScheduleDishById(id: string | number): Promise<IScheduleDish> {
  try {
    const response = await axiosInstance.get<IScheduleDishApiResponse>(`/schedule-dish/${id}/`);
    return transformApiResponseToSchedule(response.data);
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to fetch scheduled dish');
  }
}

/**
 * Schedule a dish
 */
export async function scheduleDish(data: ScheduleDishRequest): Promise<ScheduleDishResponse> {
  try {
    const response = await axiosInstance.post<ScheduleDishResponse>('/schedule-dish/schedule/', data);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.non_field_errors?.[0] ||
      error?.response?.data?.dish?.[0] ||
      error?.response?.data?.schedule_datetime?.[0] ||
      error?.response?.data?.holiday?.[0] ||
      error?.response?.data?.detail ||
      error?.message ||
      'Failed to schedule dish';
    throw new Error(errorMessage);
  }
}

/**
 * Update scheduled dish
 */
export async function updateScheduleDish(
  id: string | number,
  data: UpdateScheduleDishRequest
): Promise<IScheduleDish> {
  try {
    const response = await axiosInstance.patch<IScheduleDishApiResponse>(`/schedule-dish/${id}/`, data);
    return transformApiResponseToSchedule(response.data);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.dish?.[0] ||
      error?.response?.data?.schedule_datetime?.[0] ||
      error?.response?.data?.holiday?.[0] ||
      error?.response?.data?.status?.[0] ||
      error?.response?.data?.detail ||
      error?.message ||
      'Failed to update scheduled dish';
    throw new Error(errorMessage);
  }
}

/**
 * Delete scheduled dish (soft delete)
 */
export async function deleteScheduleDish(id: string | number): Promise<void> {
  try {
    await axiosInstance.delete(`/schedule-dish/${id}/`);
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message || 'Failed to delete scheduled dish');
  }
}

