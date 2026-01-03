import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  archiveBranch,
  restoreBranch,
  permanentlyDeleteBranch,
  BranchQueryParams,
  BranchListResponse,
  IBranch,
  CreateBranchRequest,
  UpdateBranchRequest,
  RestoreBranchResponse,
  PermanentlyDeleteBranchResponse,
} from './branchService';

// ----------------------------------------------------------------------

export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (params?: BranchQueryParams) => [...branchKeys.lists(), params] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...branchKeys.details(), id] as const,
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

/**
 * Hook to fetch branch by ID
 */
export function useBranch(id: string | number | undefined) {
  return useQuery<IBranch>({
    queryKey: branchKeys.detail(id!),
    queryFn: () => getBranchById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute - shorter to allow refetching after updates
    refetchOnMount: 'always', // Always refetch when component mounts to ensure fresh data
  });
}

/**
 * Hook to create a new branch
 */
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchRequest) => createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}

/**
 * Hook to update branch
 */
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateBranchRequest }) => updateBranch(id, data),
    onSuccess: (data, variables) => {
      // Update the cache with the returned data immediately
      queryClient.setQueryData(branchKeys.detail(variables.id), data);
      // Invalidate branch detail and list queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      // Refetch the detail query to ensure latest data
      queryClient.refetchQueries({ queryKey: branchKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook to archive branch (soft delete)
 */
export function useArchiveBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => archiveBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}

/**
 * Hook to restore archived branch
 */
export function useRestoreBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => restoreBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}

/**
 * Hook to permanently delete branch
 */
export function usePermanentlyDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => permanentlyDeleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}

// Re-export response types
export type { RestoreBranchResponse, PermanentlyDeleteBranchResponse } from './branchService';

