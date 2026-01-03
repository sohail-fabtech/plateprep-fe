// ----------------------------------------------------------------------
// Role API Types - Matching API Response Structure
// ----------------------------------------------------------------------

export interface IPermission {
  id: number;
  name: string;
  codename: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface IRoleApiResponse {
  id: number;
  role_name: string;
  description: string | null;
  total_permissions: number;
  users_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  permissions?: Array<{
    id: number;
    name: string;
    codename: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
  }>;
}

export interface IRoleDetail extends IRoleApiResponse {
  // Same structure as API response for now
}

export interface RoleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IRoleApiResponse[];
}

export interface RestoreRoleResponse {
  details: string;
}

export interface PermanentlyDeleteRoleResponse {
  details: string;
}

