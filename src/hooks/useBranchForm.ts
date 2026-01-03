import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../auth/useAuthContext';

// ----------------------------------------------------------------------

export interface UseBranchFormReturn {
  branchIdForApi: number | undefined;
  showBranchSelect: boolean;
  initialBranchId: number | string | '';
}

/**
 * Reusable hook for branch/location selection in forms
 * Handles:
 * - Reading location from URL query params
 * - Owner vs non-owner logic
 * - User branch ID from profile
 * - Determining if branch select should be shown
 * - Getting initial branch ID for form
 */
export function useBranchForm(initialBranchId?: number | string | ''): UseBranchFormReturn {
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();

  // Check if location is provided via URL query parameter
  const locationFromUrl = searchParams.get('location');
  const hasLocationInUrl = !!locationFromUrl;

  // Check if user is owner
  const isOwner = user?.is_owner === true;

  // Get branch ID from user profile if not owner
  const userBranchId = user?.branch?.id;

  // Determine which branch ID to use for API
  const branchIdForApi = useMemo(() => {
    // If location is in URL, use it
    if (hasLocationInUrl && locationFromUrl) {
      const locationId = /^\d+$/.test(locationFromUrl) ? parseInt(locationFromUrl, 10) : null;
      return locationId || undefined;
    }
    
    // For non-owners, always use their profile branch ID (not task's branch)
    if (!isOwner && userBranchId) {
      return userBranchId;
    }
    
    // For owners, use task's branch (if editing) or selected branch
    if (initialBranchId) {
      const branchId = typeof initialBranchId === 'string' 
        ? (/^\d+$/.test(initialBranchId) ? parseInt(initialBranchId, 10) : undefined)
        : initialBranchId;
      if (branchId) return branchId;
    }
    
    return undefined;
  }, [hasLocationInUrl, locationFromUrl, initialBranchId, isOwner, userBranchId]);

  // Show branch select only if user is owner AND location is NOT in URL
  const showBranchSelect = isOwner && !hasLocationInUrl;

  // Get initial branch ID for form field
  const formInitialBranchId = useMemo(() => {
    if (hasLocationInUrl && locationFromUrl) {
      return /^\d+$/.test(locationFromUrl) ? parseInt(locationFromUrl, 10) : locationFromUrl;
    }
    if (initialBranchId) {
      return initialBranchId;
    }
    if (!isOwner && userBranchId) {
      return userBranchId;
    }
    return '';
  }, [hasLocationInUrl, locationFromUrl, initialBranchId, isOwner, userBranchId]);

  return {
    branchIdForApi: branchIdForApi as number | undefined,
    showBranchSelect,
    initialBranchId: formInitialBranchId,
  };
}

