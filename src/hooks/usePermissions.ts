import { useAuthContext } from '../auth/useAuthContext';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute,
  getUserRoleType,
} from '../utils/permissions';

// ----------------------------------------------------------------------

export function usePermissions() {
  const { user } = useAuthContext();

  return {
    profile: user,
    hasPermission: (codename: string) => hasPermission(user, codename),
    hasAnyPermission: (codenames: string[]) => hasAnyPermission(user, codenames),
    hasAllPermissions: (codenames: string[]) => hasAllPermissions(user, codenames),
    canAccessRoute: (routePath: string) => canAccessRoute(user, routePath),
    isSuperAdmin: user?.is_super === true,
    isOwner: user?.is_owner === true,
    isNonOwner: user?.is_owner === false,
    roleType: getUserRoleType(user),
  };
}

