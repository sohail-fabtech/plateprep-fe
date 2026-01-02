import { useQuery } from '@tanstack/react-query';
import { getBranches, BranchQueryParams, BranchListResponse } from './branchService';

// ----------------------------------------------------------------------

export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (params?: BranchQueryParams) => [...branchKeys.lists(), params] as const,
};

/**
 * Hook to fetch branches list
 */
export function useBranches(params?: BranchQueryParams) {
  return useQuery<BranchListResponse>({
    queryKey: branchKeys.list(params),
    queryFn: () => getBranches(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

