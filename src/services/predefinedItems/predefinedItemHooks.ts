import { useQuery } from '@tanstack/react-query';
import {
  getPredefinedIngredients,
  getPredefinedStarch,
  getPredefinedVegetables,
  PredefinedItemQueryParams,
  PredefinedItemListResponse,
  IPredefinedItem,
} from './predefinedItemService';

// ----------------------------------------------------------------------

export const predefinedItemKeys = {
  all: ['predefinedItems'] as const,
  lists: () => [...predefinedItemKeys.all, 'list'] as const,
  ingredients: (params?: PredefinedItemQueryParams) =>
    [...predefinedItemKeys.lists(), 'ingredients', params] as const,
  starch: (params?: PredefinedItemQueryParams) =>
    [...predefinedItemKeys.lists(), 'starch', params] as const,
  vegetables: (params?: PredefinedItemQueryParams) =>
    [...predefinedItemKeys.lists(), 'vegetables', params] as const,
};

/**
 * Hook to fetch predefined ingredients
 */
export function usePredefinedIngredients(params?: PredefinedItemQueryParams) {
  return useQuery<PredefinedItemListResponse>({
    queryKey: predefinedItemKeys.ingredients(params),
    queryFn: () => getPredefinedIngredients(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch all predefined ingredients (for dropdowns)
 * Fetches with page_size=1000 to get all items
 */
export function useAllPredefinedIngredients() {
  return useQuery<IPredefinedItem[]>({
    queryKey: predefinedItemKeys.ingredients({ page: 1, page_size: 1000, ordering: 'name' }),
    queryFn: async () => {
      const response = await getPredefinedIngredients({ page: 1, page_size: 1000, ordering: 'name' });
      // Sort alphabetically by name (case-insensitive)
      return response.results.sort((a, b) =>
        (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
      );
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch predefined starch
 */
export function usePredefinedStarch(params?: PredefinedItemQueryParams) {
  return useQuery<PredefinedItemListResponse>({
    queryKey: predefinedItemKeys.starch(params),
    queryFn: () => getPredefinedStarch(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch all predefined starch (for dropdowns)
 * Fetches with page_size=1000 to get all items
 */
export function useAllPredefinedStarch() {
  return useQuery<IPredefinedItem[]>({
    queryKey: predefinedItemKeys.starch({ page: 1, page_size: 1000, ordering: 'name' }),
    queryFn: async () => {
      const response = await getPredefinedStarch({ page: 1, page_size: 1000, ordering: 'name' });
      // Sort alphabetically by name (case-insensitive)
      return response.results.sort((a, b) =>
        (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
      );
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch predefined vegetables
 */
export function usePredefinedVegetables(params?: PredefinedItemQueryParams) {
  return useQuery<PredefinedItemListResponse>({
    queryKey: predefinedItemKeys.vegetables(params),
    queryFn: () => getPredefinedVegetables(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch all predefined vegetables (for dropdowns)
 * Fetches with page_size=1000 to get all items
 */
export function useAllPredefinedVegetables() {
  return useQuery<IPredefinedItem[]>({
    queryKey: predefinedItemKeys.vegetables({ page: 1, page_size: 1000, ordering: 'name' }),
    queryFn: async () => {
      const response = await getPredefinedVegetables({ page: 1, page_size: 1000, ordering: 'name' });
      // Sort alphabetically by name (case-insensitive)
      return response.results.sort((a, b) =>
        (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
      );
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

