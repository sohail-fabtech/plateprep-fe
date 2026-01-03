import axiosInstance from '../../utils/axios';
import {
  IRoleDetail,
  IRoleApiResponse,
  RoleListResponse,
  RestoreRoleResponse,
  PermanentlyDeleteRoleResponse,
  IPermission,
} from '../../@types/roleApi';
import { QueryParams } from '../common/types';

// ----------------------------------------------------------------------

// Re-export types for use in other modules
export type { RoleListResponse, RestoreRoleResponse, PermanentlyDeleteRoleResponse };

export interface RoleQueryParams extends QueryParams {
  search?: string;
  is_archived?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CreateRoleRequest {
  role_name: string;
  description?: string | null;
  permission_ids: number[];
}

export interface UpdateRoleRequest {
  role_name?: string;
  description?: string | null;
  permission_ids?: number[];
}

/**
 * Fetch role by ID
 */
export async function getRoleById(id: string | number): Promise<IRoleDetail> {
  const response = await axiosInstance.get<IRoleApiResponse>(`/roles/${id}/`);
  return response.data;
}

/**
 * Fetch list of roles
 */
export async function getRoles(params?: RoleQueryParams): Promise<RoleListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.is_archived !== undefined) {
    queryParams.is_archived = params.is_archived ? 'True' : 'False';
  }
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<RoleListResponse>('/roles/', {
    params: queryParams,
  });

  return response.data;
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleRequest): Promise<IRoleDetail> {
  const response = await axiosInstance.post<IRoleApiResponse>('/roles/', data);
  return response.data;
}

/**
 * Update role (PATCH)
 */
export async function updateRole(id: string | number, data: UpdateRoleRequest): Promise<IRoleDetail> {
  const response = await axiosInstance.patch<IRoleApiResponse>(`/roles/${id}/`, data);
  return response.data;
}

/**
 * Delete role (soft delete / archive)
 */
export async function deleteRole(id: string | number): Promise<void> {
  await axiosInstance.post(`/roles/${id}/delete/`);
}

/**
 * Restore archived role
 */
export async function restoreRole(id: string | number): Promise<RestoreRoleResponse> {
  const response = await axiosInstance.post<RestoreRoleResponse>(`/roles/${id}/restore/`);
  return response.data;
}

/**
 * Permanently delete role
 */
export async function permanentlyDeleteRole(id: string | number): Promise<PermanentlyDeleteRoleResponse> {
  const response = await axiosInstance.delete<PermanentlyDeleteRoleResponse>(`/roles/${id}/`);
  return response.data;
}

/**
 * Fetch all permissions
 */
export async function getPermissions(): Promise<IPermission[]> {
  const response = await axiosInstance.get<IPermission[]>('/permissions/');
  return response.data;
}

