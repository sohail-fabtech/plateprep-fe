import { IUserApiResponse, IUserDetail } from '../@types/userApi';
import { IUser } from '../@types/user';

// ----------------------------------------------------------------------
// User Data Adapter - Transform API response to UI format
// ----------------------------------------------------------------------

/**
 * Transform API response to internal UI format
 */
export function transformApiResponseToUser(apiResponse: IUserApiResponse): IUser {
  // Build full name
  const fullName = `${apiResponse.first_name || ''} ${apiResponse.last_name || ''}`.trim() || 'Unknown User';

  // Build address from available fields
  const addressParts = [
    apiResponse.street_address,
    apiResponse.city,
    apiResponse.state_province,
    apiResponse.postal_code,
    apiResponse.country,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '-';

  // Get location (branch name) or restaurant name
  const location = apiResponse.branch?.branch_name || apiResponse.resturant?.resturant_name || '-';

  // Get user role name (use user_role.role_name instead of role_name)
  const userRoleName = apiResponse.user_role?.role_name || apiResponse.role_name || apiResponse.role || '-';

  // Determine status based on is_active and is_deleted
  let status = 'active';
  if (apiResponse.is_deleted) {
    status = 'archived';
  } else if (!apiResponse.is_active) {
    status = 'inactive';
  }

  return {
    id: String(apiResponse.id),
    name: fullName,
    email: apiResponse.email || '',
    phoneNumber: apiResponse.phone_number || '-',
    address: fullAddress,
    location,
    role: userRoleName, // Using user_role.role_name
    status,
    avatarUrl: apiResponse.profile_image_url || apiResponse.profile || undefined,
    isDeleted: apiResponse.is_deleted || false,
  };
}

