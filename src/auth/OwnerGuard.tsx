import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { PATH_DASHBOARD } from '../routes/paths';

// ----------------------------------------------------------------------

type OwnerGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function OwnerGuard({ children, fallback }: OwnerGuardProps) {
  const { isOwner, profile } = usePermissions();

  // Wait for profile to load
  if (!profile) return null;

  if (!isOwner) {
    return fallback ? <>{fallback}</> : <Navigate to={PATH_DASHBOARD.permissionDenied} replace />;
  }

  return <>{children}</>;
}

