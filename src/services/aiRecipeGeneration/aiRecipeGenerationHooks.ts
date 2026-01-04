import { useMutation } from '@tanstack/react-query';
import { generateAIRecipe, GenerateAIRecipeRequest, GenerateAIRecipeResponse } from './aiRecipeGenerationService';

// ----------------------------------------------------------------------

export const aiRecipeGenerationKeys = {
  all: ['aiRecipeGeneration'] as const,
  generate: () => [...aiRecipeGenerationKeys.all, 'generate'] as const,
};

/**
 * Hook to generate AI recipe
 */
export function useGenerateAIRecipe() {
  return useMutation<GenerateAIRecipeResponse, Error, GenerateAIRecipeRequest>({
    mutationFn: (data: GenerateAIRecipeRequest) => generateAIRecipe(data),
    mutationKey: aiRecipeGenerationKeys.generate(),
  });
}

