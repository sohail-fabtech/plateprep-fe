import axiosInstance from '../../utils/axios';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface IBranch {
  id: number;
  branchName: string;
  branchLocation: string | null;
  phoneNumber: string | null;
  email: string | null;
  socialMedia: Array<{ name: string; url: string }> | null;
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
  social_media: Record<string, string> | null; // Object format: { "whatsapp": "url", "instagram": "url" }
  restaurant_name: string;
  total_social_links?: string[];
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
  // Convert social_media object format to array format for UI
  // API sends: { "whatsapp": "url", "instagram": "url" }
  // UI needs: [{ name: "whatsapp", url: "url" }, { name: "instagram", url: "url" }]
  let socialMediaArray: Array<{ name: string; url: string }> = [];
  
  if (apiResponse.social_media && typeof apiResponse.social_media === 'object') {
    socialMediaArray = Object.entries(apiResponse.social_media)
      .map(([name, url]) => ({
        name,
        url,
      }))
      .filter((item) => item.name && item.url);
  }

  return {
    id: apiResponse.id,
    branchName: apiResponse.branch_name,
    branchLocation: apiResponse.branch_location,
    phoneNumber: apiResponse.phone_number,
    email: apiResponse.email,
    socialMedia: socialMediaArray.length > 0 ? socialMediaArray : null,
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

/**
 * Fetch branch by ID
 */
export async function getBranchById(id: string | number): Promise<IBranch> {
  const response = await axiosInstance.get<IBranchApiResponse>(`/branches/${id}/`);
  return transformApiResponseToBranch(response.data);
}

export interface RestoreBranchResponse {
  message: string;
  branch: IBranchApiResponse;
}

export interface PermanentlyDeleteBranchResponse {
  message: string;
}

/**
 * Archive branch (soft delete)
 */
export async function archiveBranch(id: string | number): Promise<void> {
  await axiosInstance.delete(`/branches/${id}/`);
}

/**
 * Restore archived branch
 */
export async function restoreBranch(id: string | number): Promise<RestoreBranchResponse> {
  const response = await axiosInstance.post<RestoreBranchResponse>(`/branches/${id}/restore/`, {});
  return response.data;
}

/**
 * Permanently delete branch
 */
export async function permanentlyDeleteBranch(id: string | number): Promise<PermanentlyDeleteBranchResponse> {
  const response = await axiosInstance.post<PermanentlyDeleteBranchResponse>(`/branches/${id}/delete/`, {});
  return response.data;
}

/**
 * Transform social media from array format to object format for API
 */
export function transformSocialMediaToApiFormat(
  socialMedia: Array<{ name: string; url: string }> | null
): Record<string, string> | null {
  if (!socialMedia || socialMedia.length === 0) return null;
  
  const result: Record<string, string> = {};
  socialMedia.forEach((item) => {
    if (item.name && item.url) {
      result[item.name] = item.url;
    }
  });
  return Object.keys(result).length > 0 ? result : null;
}

export interface CreateBranchRequest {
  branch_name: string;
  branch_location?: string | null;
  phone_number?: string | null;
  email?: string | null;
  social_media?: Record<string, string> | null;
}

export interface UpdateBranchRequest {
  branch_name?: string;
  branch_location?: string | null;
  phone_number?: string | null;
  email?: string | null;
  social_media?: Record<string, string> | null;
}

/**
 * Create new branch
 */
export async function createBranch(data: CreateBranchRequest): Promise<IBranch> {
  const response = await axiosInstance.post<IBranchApiResponse>('/branches/', data);
  return transformApiResponseToBranch(response.data);
}

/**
 * Update branch fields
 */
export async function updateBranch(id: string | number, data: UpdateBranchRequest): Promise<IBranch> {
  const response = await axiosInstance.patch<IBranchApiResponse>(`/branches/${id}/`, data);
  return transformApiResponseToBranch(response.data);
}

