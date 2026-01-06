import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWineInventory,
  updateWineInventory,
  getWineInventoryById,
  getWineInventoryList,
  deleteWineInventory,
  restoreWineInventory,
  permanentlyDeleteWineInventory,
  WineInventoryApiRequest,
  WineInventoryQueryParams,
} from './wineInventoryService';

export const wineInventoryKeys = {
  all: ['wineInventory'] as const,
  lists: () => [...wineInventoryKeys.all, 'list'] as const,
  list: (params?: WineInventoryQueryParams) => [...wineInventoryKeys.lists(), params] as const,
  details: () => [...wineInventoryKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...wineInventoryKeys.details(), id] as const,
};

export function useCreateWineInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWineInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wineInventoryKeys.lists() });
    },
  });
}

export function useUpdateWineInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWineInventory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: wineInventoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: wineInventoryKeys.lists() });
    },
  });
}

/**
 * Hook to fetch a single wine inventory by ID
 */
export function useWineInventory(id: string | number | undefined) {
  return useQuery({
    queryKey: wineInventoryKeys.detail(id!),
    queryFn: () => getWineInventoryById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch list of wine inventory with filters and pagination
 */
export function useWineInventoryList(params?: WineInventoryQueryParams) {
  return useQuery({
    queryKey: wineInventoryKeys.list(params),
    queryFn: () => getWineInventoryList(params),
  });
}

/**
 * Hook to delete wine inventory (soft delete / archive)
 */
export function useDeleteWineInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWineInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wineInventoryKeys.lists() });
    },
  });
}

/**
 * Hook to restore archived wine inventory
 */
export function useRestoreWineInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreWineInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wineInventoryKeys.lists() });
    },
  });
}

/**
 * Hook to permanently delete wine inventory
 */
export function usePermanentlyDeleteWineInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: permanentlyDeleteWineInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wineInventoryKeys.lists() });
    },
  });
}

export type { WineInventoryApiRequest, WineInventoryQueryParams };

