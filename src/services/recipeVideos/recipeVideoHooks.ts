import { useQuery } from '@tanstack/react-query';
import {
  getRecipeVideos,
  getRecipeVideoById,
  RecipeVideoQueryParams,
  RecipeVideoListResponse,
} from './recipeVideoService';

// ----------------------------------------------------------------------

/**
 * Query key factory for recipe videos
 */
export const recipeVideoKeys = {
  all: ['recipeVideos'] as const,
  lists: () => [...recipeVideoKeys.all, 'list'] as const,
  list: (params?: RecipeVideoQueryParams) => [...recipeVideoKeys.lists(), params] as const,
  details: () => [...recipeVideoKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...recipeVideoKeys.details(), id] as const,
};

/**
 * Hook to fetch list of recipe videos
 * Uses default cache settings (5 minutes staleTime, 10 minutes gcTime)
 */
export function useRecipeVideos(params?: RecipeVideoQueryParams) {
  return useQuery<RecipeVideoListResponse>({
    queryKey: recipeVideoKeys.list(params),
    queryFn: () => getRecipeVideos(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
}

/**
 * Hook to fetch single recipe video by ID
 * Uses default cache settings (5 minutes staleTime, 10 minutes gcTime)
 */
export function useRecipeVideo(id: string | number | undefined) {
  return useQuery({
    queryKey: recipeVideoKeys.detail(id!),
    queryFn: () => getRecipeVideoById(id!),
    enabled: !!id,
  });
}

// Re-export types
export type { RecipeVideoQueryParams, RecipeVideoListResponse } from './recipeVideoService';

