import { UserProfile, Permission } from '../auth/types';

// ----------------------------------------------------------------------

/**
 * Get all user permissions (role + individual)
 */
export function getAllUserPermissions(profile: UserProfile | null): Set<string> {
  if (!profile) return new Set();

  const permissions = new Set<string>();

  // Add role permissions
  if (profile.user_role?.permissions) {
    profile.user_role.permissions.forEach((perm: Permission) => {
      permissions.add(perm.codename);
    });
  }

  // Add individual permissions (overrides/extends)
  if (profile.individual_permissions) {
    profile.individual_permissions.forEach((perm: Permission) => {
      permissions.add(perm.codename);
    });
  }

  return permissions;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  profile: UserProfile | null,
  permissionCodename: string
): boolean {
  if (!profile) return false;

  // Super admin has all permissions
  if (profile.is_super === true) return true;

  const permissions = getAllUserPermissions(profile);
  return permissions.has(permissionCodename);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  profile: UserProfile | null,
  permissionCodenames: string[]
): boolean {
  if (!profile) return false;
  if (profile.is_super === true) return true;

  const permissions = getAllUserPermissions(profile);
  return permissionCodenames.some((codename) => permissions.has(codename));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  profile: UserProfile | null,
  permissionCodenames: string[]
): boolean {
  if (!profile) return false;
  if (profile.is_super === true) return true;

  const permissions = getAllUserPermissions(profile);
  return permissionCodenames.every((codename) => permissions.has(codename));
}

/**
 * Get user role type
 */
export function getUserRoleType(
  profile: UserProfile | null
): 'super_admin' | 'owner' | 'non_owner' | null {
  if (!profile) return null;
  if (profile.is_super === true) return 'super_admin';
  if (profile.is_owner === true) return 'owner';
  return 'non_owner';
}

/**
 * Route to permission mapping
 */
export const routePermissionMap: Record<string, string[]> = {
  '/dashboard/app': ['view_dashboard'],
  '/dashboard/dashboard-overview': ['view_dashboard'],
  '/dashboard/recipes': ['view_recipe'],
  '/dashboard/recipes/list': ['view_recipe'],
  '/dashboard/recipes/new': ['create_recipe'],
  '/dashboard/recipes/:id': ['view_recipe'],
  '/dashboard/recipes/:id/edit': ['edit_recipe'],
  '/dashboard/wine-inventory': ['view_wine_inventory'],
  '/dashboard/wine-inventory/list': ['view_wine_inventory'],
  '/dashboard/wine-inventory/create': ['create_wine_inventory'],
  '/dashboard/wine-inventory/:id': ['view_wine_inventory'],
  '/dashboard/wine-inventory/:id/edit': ['edit_wine_inventory'],
  '/dashboard/tasks': ['view_tasks'],
  '/dashboard/tasks/list': ['view_tasks'],
  '/dashboard/tasks/create': ['create_tasks'],
  '/dashboard/tasks/:id': ['view_tasks'],
  '/dashboard/tasks/:id/edit': ['edit_tasks'],
  '/dashboard/scheduling': ['view_scheduling_release'],
  '/dashboard/scheduling/list': ['view_scheduling_release'],
  '/dashboard/scheduling/create': ['create_scheduling_release'],
  '/dashboard/scheduling/:id/edit': ['edit_scheduling_release'],
  '/dashboard/scheduling/calendar': ['view_scheduling_release'],
  '/dashboard/scheduling/releases': ['view_scheduling_release'],
  '/dashboard/restaurant-location': ['view_branches'],
  '/dashboard/restaurant-location/list': ['view_branches'],
  '/dashboard/restaurant-location/new': ['create_branches'],
  '/dashboard/restaurant-location/:id': ['view_branches'],
  '/dashboard/restaurant-location/:id/edit': ['edit_branches'],
  '/dashboard/restaurant-location/map': ['view_branches'],
  '/dashboard/users': ['view_users'],
  '/dashboard/users/list': ['view_users'],
  '/dashboard/users/create': ['create_users'],
  '/dashboard/users/:id': ['view_users'],
  '/dashboard/users/:id/edit': ['edit_users'],
  '/dashboard/templates': ['view_templates'],
  '/dashboard/templates/list': ['view_templates'],
  '/dashboard/templates/create': ['create_templates'],
  '/dashboard/editor-template': ['view_editor_template'],
  '/dashboard/editor-template/edit': ['view_editor_template'],
  '/dashboard/tracking': ['view_tracking'],
  '/dashboard/tracking/analytics': ['view_tracking'],
  '/dashboard/video-generation': ['view_video_generation'],
  '/dashboard/video-generation/library': ['view_video_generation'],
  '/dashboard/video-generation/create': ['create_video_generation'],
  '/dashboard/settings': ['view_settings'],
  '/dashboard/settings/general': ['view_settings'],
  '/dashboard/settings/account': ['view_settings'],
  '/dashboard/how-to': ['view_how_to'],
  '/dashboard/how-to/guides': ['view_how_to'],
  '/dashboard/how-to/:title': ['view_how_to'],
  '/dashboard/dictionary': ['view_dictionary'],
  '/dashboard/dictionary/list': ['view_dictionary'],
  '/dashboard/dictionary/:categoryId': ['view_dictionary'],
  '/dashboard/roles': ['view_roles'],
  '/dashboard/roles/list': ['view_roles'],
  '/dashboard/roles/create': ['create_roles'],
  '/dashboard/roles/:id': ['view_roles'],
  '/dashboard/roles/:id/edit': ['edit_roles'],
};

/**
 * Known path segments that should not be replaced
 */
const KNOWN_PATH_SEGMENTS = [
  'list',
  'create',
  'new',
  'edit',
  'calendar',
  'releases',
  'map',
  'guides',
  'library',
  'general',
  'account',
  'analytics',
];

/**
 * Normalize route path (remove params and query strings)
 */
function normalizeRoutePath(routePath: string): string {
  // Remove query strings
  let normalized = routePath.split('?')[0];
  
  // Split into segments
  const segments = normalized.split('/').filter(Boolean);
  const normalizedSegments = segments.map((segment, index) => {
    // Don't replace known path segments
    if (KNOWN_PATH_SEGMENTS.includes(segment.toLowerCase())) {
      return segment;
    }
    
    // Replace UUIDs with :id
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
      return ':id';
    }
    
    // Replace numeric IDs with :id
    if (/^\d+$/.test(segment)) {
      return ':id';
    }
    
    // For routes like /how-to/:title or /dictionary/:categoryId, replace with :id
    // This handles string-based IDs
    // Check if this looks like an ID (not a known segment and not 'dashboard')
    if (segment !== 'dashboard' && !KNOWN_PATH_SEGMENTS.includes(segment.toLowerCase())) {
      // Check if previous segment suggests this is an ID (like 'how-to' or 'dictionary')
      const prevSegment = index > 0 ? segments[index - 1] : '';
      if (prevSegment === 'how-to' || prevSegment === 'dictionary') {
        return prevSegment === 'how-to' ? ':title' : ':categoryId';
      }
      // For other cases, if it's a single segment that's not a known path, treat as :id
      // But be conservative - only if it's clearly not a path segment
      if (index === segments.length - 1 && segments.length > 2) {
        return ':id';
      }
    }
    
    return segment;
  });
  
  return '/' + normalizedSegments.join('/');
}

/**
 * Owner-only routes - only accessible to owners
 */
const OWNER_ONLY_ROUTES = [
  '/dashboard/restaurant-location/list',
  '/dashboard/roles/list',
];

/**
 * Check if user can access a route
 */
export function canAccessRoute(profile: UserProfile | null, routePath: string): boolean {
  if (!profile) return false;
  if (profile.is_super === true) return true;

  // Remove query strings for matching
  const cleanPath = routePath.split('?')[0];

  // Check if route is owner-only
  const isOwnerOnlyRoute = OWNER_ONLY_ROUTES.some((route) => cleanPath === route || cleanPath.startsWith(route));
  if (isOwnerOnlyRoute && profile.is_owner !== true) {
    return false;
  }

  // Try exact match first
  let requiredPermissions = routePermissionMap[cleanPath];

  // If no exact match, try normalized path
  if (!requiredPermissions) {
    const normalizedPath = normalizeRoutePath(cleanPath);
    requiredPermissions = routePermissionMap[normalizedPath];
  }

  // If still no match, try matching by prefix (for nested routes)
  if (!requiredPermissions) {
    // Sort keys by length (longest first) to match most specific routes first
    const sortedKeys = Object.keys(routePermissionMap).sort((a, b) => b.length - a.length);
    const matchingKey = sortedKeys.find((key) => cleanPath.startsWith(key));
    if (matchingKey) {
      requiredPermissions = routePermissionMap[matchingKey];
    }
  }

  // No permission required for unmapped routes (allow access by default)
  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  return hasAnyPermission(profile, requiredPermissions);
}

