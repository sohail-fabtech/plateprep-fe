import { useQuery } from '@tanstack/react-query';
import { getStepsByRecipeId, IStepApiResponse } from './stepService';

// ----------------------------------------------------------------------

/**
 * Query key factory for steps
 */
export const stepKeys = {
  all: ['steps'] as const,
  lists: () => [...stepKeys.all, 'list'] as const,
  list: (recipeId: string | number | undefined) => [...stepKeys.lists(), recipeId] as const,
};

/**
 * Hook to fetch steps by recipe ID
 * @param recipeId - Recipe ID (only fetches if provided and not "other")
 */
export function useSteps(recipeId: string | number | undefined) {
  return useQuery<IStepApiResponse[]>({
    queryKey: stepKeys.list(recipeId),
    queryFn: () => getStepsByRecipeId(recipeId!),
    enabled: !!recipeId && recipeId !== 'other' && typeof recipeId !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

