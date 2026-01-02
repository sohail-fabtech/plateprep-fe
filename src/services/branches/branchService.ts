import axiosInstance from '../../utils/axios';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface IBranch {
  id: number;
  branchName: string;
  branchLocation: string | null;
  phoneNumber: string | null;
  email: string | null;
  socialMedia: Record<string, string> | null;
  restaurantName: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface IBranchApiResponse {
  id: number;
  branch_name: string;
  branch_location: string | null;
  phone_number: string | null;
  email: string | null;
  social_media: Record<string, string> | null;
  restaurant_name: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface BranchListApiResponse extends PaginatedResponse<IBranchApiResponse> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IBranchApiResponse[];
}

export interface BranchQueryParams extends QueryParams {
  search?: string;
  branch_name?: string;
  branch_location?: string;
  email?: string;
  phone_number?: string;
  is_archived?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface BranchListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IBranch[];
}

/**
 * Transform API response to internal format
 */
function transformApiResponseToBranch(apiResponse: IBranchApiResponse): IBranch {
  return {
    id: apiResponse.id,
    branchName: apiResponse.branch_name,
    branchLocation: apiResponse.branch_location,
    phoneNumber: apiResponse.phone_number,
    email: apiResponse.email,
    socialMedia: apiResponse.social_media,
    restaurantName: apiResponse.restaurant_name,
    createdAt: apiResponse.created_at,
    updatedAt: apiResponse.updated_at,
    isDeleted: apiResponse.is_deleted,
  };
}

/**
 * Fetch all branches
 */
export async function getBranches(params?: BranchQueryParams): Promise<BranchListResponse> {
  const queryParams: Record<string, string | number | boolean> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.branch_name) queryParams.branch_name = params.branch_name;
  if (params?.branch_location) queryParams.branch_location = params.branch_location;
  if (params?.email) queryParams.email = params.email;
  if (params?.phone_number) queryParams.phone_number = params.phone_number;
  if (params?.is_archived !== undefined) queryParams.is_archived = params.is_archived;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<BranchListApiResponse>('/branches/', {
    params: queryParams,
  });

  return {
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
    page: response.data.page,
    results: (response.data.results || []).map(transformApiResponseToBranch),
  };
}

