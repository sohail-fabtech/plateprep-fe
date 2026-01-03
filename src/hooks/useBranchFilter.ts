import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../auth/useAuthContext';

// ----------------------------------------------------------------------

export interface UseBranchFilterReturn {
  filterBranch: string | number | '';
  setFilterBranch: (value: string | number | '') => void;
  branchIdForApi: number | string | undefined;
  showBranchFilter: boolean;
  hasLocationInUrl: boolean;
  locationFromUrl: string | null;
}

/**
 * Reusable hook for branch/location filtering logic
 * Handles:
 * - Reading location from URL query params
 * - Owner vs non-owner logic
 * - User branch ID from profile
 * - Determining if branch filter should be shown
 */
export function useBranchFilter(): UseBranchFilterReturn {
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const [filterBranch, setFilterBranch] = useState<string | number | ''>('');

  // Check if location is provided via URL query parameter
  const locationFromUrl = searchParams.get('location');
  const hasLocationInUrl = !!locationFromUrl;

  // Initialize filterBranch from URL query parameter if present
  useEffect(() => {
    if (locationFromUrl) {
      // Convert to number if it's a valid number, otherwise keep as string
      const locationValue = /^\d+$/.test(locationFromUrl) ? parseInt(locationFromUrl, 10) : locationFromUrl;
      setFilterBranch(locationValue);
    }
  }, [locationFromUrl]);

  // Check if user is owner to show branch filter
  const isOwner = user?.is_owner === true;

  // Get branch ID from user profile if not owner
  const userBranchId = user?.branch?.id;

  // Determine which branch ID to use
  // If location is in URL, use it; otherwise use normal logic
  const branchIdForApi = useMemo(() => {
    if (hasLocationInUrl && locationFromUrl) {
      // Convert to number if it's a valid number, otherwise keep as string
      return /^\d+$/.test(locationFromUrl) ? parseInt(locationFromUrl, 10) : locationFromUrl;
    }
    // If not in URL, use normal logic
    return isOwner ? (filterBranch || undefined) : userBranchId;
  }, [hasLocationInUrl, locationFromUrl, isOwner, filterBranch, userBranchId]);

  // Show branch select only if user is owner AND location is NOT in URL
  const showBranchFilter = isOwner && !hasLocationInUrl;

  return {
    filterBranch,
    setFilterBranch,
    branchIdForApi,
    showBranchFilter,
    hasLocationInUrl,
    locationFromUrl,
  };
}

