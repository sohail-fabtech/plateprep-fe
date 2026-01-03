import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getScheduleDishes,
  getScheduleDishById,
  scheduleDish,
  updateScheduleDish,
  deleteScheduleDish,
  ScheduleDishQueryParams,
  ScheduleDishListResponse,
  IScheduleDish,
  ScheduleDishRequest,
  UpdateScheduleDishRequest,
} from './scheduleDishService';

// Re-export types for use in other modules
export type { ScheduleDishQueryParams, ScheduleDishListResponse };

// ----------------------------------------------------------------------

export const scheduleDishKeys = {
  all: ['scheduleDishes'] as const,
  lists: () => [...scheduleDishKeys.all, 'list'] as const,
  list: (params?: ScheduleDishQueryParams) => [...scheduleDishKeys.lists(), params] as const,
  details: () => [...scheduleDishKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...scheduleDishKeys.details(), id] as const,
};

/**
 * Hook to fetch scheduled dishes list
 */
export function useScheduleDishes(params?: ScheduleDishQueryParams) {
  return useQuery<ScheduleDishListResponse>({
    queryKey: scheduleDishKeys.list(params),
    queryFn: () => getScheduleDishes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch scheduled dish by ID
 */
export function useScheduleDish(id: string | number | undefined) {
  return useQuery<IScheduleDish>({
    queryKey: scheduleDishKeys.detail(id!),
    queryFn: () => getScheduleDishById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to schedule a dish
 */
export function useScheduleDishMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleDishRequest) => scheduleDish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleDishKeys.lists() });
    },
  });
}

/**
 * Hook to update scheduled dish
 */
export function useUpdateScheduleDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateScheduleDishRequest }) =>
      updateScheduleDish(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(scheduleDishKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: scheduleDishKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: scheduleDishKeys.lists() });
    },
  });
}

/**
 * Hook to delete scheduled dish (soft delete)
 */
export function useDeleteScheduleDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteScheduleDish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleDishKeys.lists() });
    },
  });
}

