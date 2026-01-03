import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDictionaryCategories,
  getDictionaryCategoryById,
  createDictionaryCategory,
  updateDictionaryCategory,
  deleteDictionaryCategory,
  DictionaryCategoryQueryParams,
  DictionaryCategoryListResponse,
  IDictionaryCategory,
  CreateDictionaryCategoryRequest,
  UpdateDictionaryCategoryRequest,
} from './dictionaryCategoryService';

// Re-export types for use in other modules
export type { DictionaryCategoryQueryParams, DictionaryCategoryListResponse };

// ----------------------------------------------------------------------

export const dictionaryCategoryKeys = {
  all: ['dictionaryCategories'] as const,
  lists: () => [...dictionaryCategoryKeys.all, 'list'] as const,
  list: (params?: DictionaryCategoryQueryParams) => [...dictionaryCategoryKeys.lists(), params] as const,
  details: () => [...dictionaryCategoryKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...dictionaryCategoryKeys.details(), id] as const,
};

/**
 * Hook to fetch dictionary categories list
 */
export function useDictionaryCategories(params?: DictionaryCategoryQueryParams) {
  return useQuery<DictionaryCategoryListResponse>({
    queryKey: dictionaryCategoryKeys.list(params),
    queryFn: () => getDictionaryCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch dictionary category by ID
 */
export function useDictionaryCategory(id: string | number | undefined) {
  return useQuery<IDictionaryCategory>({
    queryKey: dictionaryCategoryKeys.detail(id!),
    queryFn: () => getDictionaryCategoryById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new dictionary category
 */
export function useCreateDictionaryCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDictionaryCategoryRequest) => createDictionaryCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryCategoryKeys.lists() });
    },
  });
}

/**
 * Hook to update dictionary category
 */
export function useUpdateDictionaryCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateDictionaryCategoryRequest }) =>
      updateDictionaryCategory(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(dictionaryCategoryKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: dictionaryCategoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dictionaryCategoryKeys.lists() });
    },
  });
}

/**
 * Hook to delete dictionary category (soft delete)
 */
export function useDeleteDictionaryCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteDictionaryCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryCategoryKeys.lists() });
    },
  });
}

