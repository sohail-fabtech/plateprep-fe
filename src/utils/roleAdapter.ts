import { IRoleApiResponse } from '../@types/roleApi';
import { IRole } from '../@types/role';

// ----------------------------------------------------------------------
// Role Data Adapter - Transform API response to UI format
// ----------------------------------------------------------------------

/**
 * Transform API response to internal UI format
 */
export function transformApiResponseToRole(apiResponse: IRoleApiResponse): IRole {
  return {
    id: String(apiResponse.id),
    name: apiResponse.role_name || '',
    description: apiResponse.description || null,
    permissionsCount: apiResponse.total_permissions || 0,
    usersCount: apiResponse.users_count || 0,
    isDeleted: apiResponse.is_deleted || false,
    createdAt: apiResponse.created_at || '',
    updatedAt: apiResponse.updated_at || '',
  };
}

