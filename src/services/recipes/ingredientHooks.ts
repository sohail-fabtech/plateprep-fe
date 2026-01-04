import { useQuery } from '@tanstack/react-query';
import { getIngredientsByRecipeId, IIngredientApiResponse } from './ingredientService';

// ----------------------------------------------------------------------

/**
 * Query key factory for ingredients
 */
export const ingredientKeys = {
  all: ['ingredients'] as const,
  lists: () => [...ingredientKeys.all, 'list'] as const,
  list: (recipeId: string | number | undefined) => [...ingredientKeys.lists(), recipeId] as const,
};

/**
 * Hook to fetch ingredients by recipe ID
 * @param recipeId - Recipe ID (only fetches if provided and not "other")
 */
export function useIngredients(recipeId: string | number | undefined) {
  return useQuery<IIngredientApiResponse[]>({
    queryKey: ingredientKeys.list(recipeId),
    queryFn: () => getIngredientsByRecipeId(recipeId!),
    enabled: !!recipeId && recipeId !== 'other' && typeof recipeId !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

