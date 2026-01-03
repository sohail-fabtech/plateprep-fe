import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDictionaryItems,
  createDictionaryItem,
  updateDictionaryItem,
  DictionaryItemQueryParams,
  DictionaryItemListResponse,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
} from './dictionaryItemService';

// Re-export types for use in other modules
export type { DictionaryItemQueryParams, DictionaryItemListResponse };

// ----------------------------------------------------------------------

export const dictionaryItemKeys = {
  all: ['dictionaryItems'] as const,
  lists: () => [...dictionaryItemKeys.all, 'list'] as const,
  list: (params?: DictionaryItemQueryParams) => [...dictionaryItemKeys.lists(), params] as const,
};

/**
 * Hook to fetch dictionary items list
 */
export function useDictionaryItems(params?: DictionaryItemQueryParams) {
  return useQuery<DictionaryItemListResponse>({
    queryKey: dictionaryItemKeys.list(params),
    queryFn: () => getDictionaryItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new dictionary item
 */
export function useCreateDictionaryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDictionaryItemRequest) => createDictionaryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryItemKeys.lists() });
    },
  });
}

/**
 * Hook to update dictionary item
 */
export function useUpdateDictionaryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateDictionaryItemRequest }) =>
      updateDictionaryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryItemKeys.lists() });
    },
  });
}

