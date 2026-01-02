import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

// ----------------------------------------------------------------------

type PermissionGuardProps = {
  children: ReactNode;
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: ReactNode;
  showFallback?: boolean;
};

export default function PermissionGuard({
  children,
  permission,
  anyOf,
  allOf,
  fallback = null,
  showFallback = false,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, profile } = usePermissions();

  // Wait for profile to load
  if (!profile) return null;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyOf) {
    hasAccess = hasAnyPermission(anyOf);
  } else if (allOf) {
    hasAccess = hasAllPermissions(allOf);
  } else {
    hasAccess = true; // No permission specified, show by default
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return showFallback ? <>{fallback}</> : null;
}

