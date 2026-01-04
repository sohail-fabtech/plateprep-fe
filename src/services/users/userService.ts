import axiosInstance from '../../utils/axios';
import {
  IUserDetail,
  IUserApiResponse,
  UserListResponse,
  RestoreUserResponse,
  PermanentlyDeleteUserResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../@types/userApi';
import { transformApiResponseToUser } from '../../utils/userAdapter';
import { QueryParams } from '../common/types';

// ----------------------------------------------------------------------

// Re-export types for use in other modules
export type {
  UserListResponse,
  RestoreUserResponse,
  PermanentlyDeleteUserResponse,
  CreateUserRequest,
  UpdateUserRequest,
};

export interface UserQueryParams extends QueryParams {
  search?: string;
  email?: string;
  role?: string;
  city?: string;
  country?: string;
  is_active?: boolean;
  created_at?: string;
  postal_code?: string;
  phone_number?: string;
  resturant?: string;
  is_deleted?: boolean;
  subscription?: boolean;
  is_archived?: boolean;
  user_role?: string;
  branch?: number;
  page_size?: number;
  ordering?: string;
}

/**
 * Fetch user by ID
 */
export async function getUserById(id: string | number): Promise<IUserDetail> {
  const response = await axiosInstance.get<IUserApiResponse>(`/user-detail/${id}/`);
  return response.data;
}

/**
 * Fetch list of users
 */
export async function getUsers(params?: UserQueryParams): Promise<UserListResponse> {
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.email) queryParams.email = params.email;
  if (params?.role) queryParams.role = params.role;
  if (params?.city) queryParams.city = params.city;
  if (params?.country) queryParams.country = params.country;
  if (params?.is_active !== undefined) queryParams.is_active = params.is_active;
  if (params?.created_at) queryParams.created_at = params.created_at;
  if (params?.postal_code) queryParams.postal_code = params.postal_code;
  if (params?.phone_number) queryParams.phone_number = params.phone_number;
  if (params?.resturant) queryParams.resturant = params.resturant;
  if (params?.is_deleted !== undefined) queryParams.is_deleted = params.is_deleted;
  if (params?.subscription !== undefined) queryParams.subscription = params.subscription;
  if (params?.is_archived !== undefined) queryParams.is_archived = params.is_archived;
  if (params?.user_role) queryParams.user_role = params.user_role;
  if (params?.branch) queryParams.branch = params.branch;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<UserListResponse>('/user-detail/', {
    params: queryParams,
  });

  return response.data;
}

/**
 * Delete user (soft delete / archive)
 */
export async function deleteUser(id: string | number): Promise<void> {
  await axiosInstance.delete(`/user-detail/${id}/`);
}

/**
 * Restore archived user
 */
export async function restoreUser(id: string | number): Promise<RestoreUserResponse> {
  const response = await axiosInstance.post<RestoreUserResponse>(`/user-detail/restore/`, {
    id,
  });
  return response.data;
}

/**
 * Permanently delete user
 */
export async function permanentlyDeleteUser(id: string | number): Promise<PermanentlyDeleteUserResponse> {
  const response = await axiosInstance.post<PermanentlyDeleteUserResponse>(`/user-detail/${id}/delete/`);
  return response.data;
}

/**
 * Create user (POST)
 */
export async function createUser(data: CreateUserRequest): Promise<IUserDetail> {
  const response = await axiosInstance.post<IUserApiResponse>('/user-detail/', data);
  return response.data;
}

/**
 * Update user (PATCH)
 */
export async function updateUser(id: string | number, data: UpdateUserRequest): Promise<IUserDetail> {
  const response = await axiosInstance.patch<IUserApiResponse>(`/user-detail/${id}/`, data);
  return response.data;
}

/**
 * Update user individual permissions
 */
export interface UpdateUserIndividualPermissionsRequest {
  user_id: number;
  permissions: number[];
}

export interface UpdateUserIndividualPermissionsResponse {
  detail: string;
  user_id: number;
  permissions: number[];
}

export async function updateUserIndividualPermissions(
  data: UpdateUserIndividualPermissionsRequest
): Promise<UpdateUserIndividualPermissionsResponse> {
  const response = await axiosInstance.post<UpdateUserIndividualPermissionsResponse>(
    '/user-permissions/set/',
    data
  );
  return response.data;
}

