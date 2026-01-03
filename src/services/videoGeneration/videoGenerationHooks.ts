import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateVideo, GenerateVideoRequest, GenerateVideoResponse } from './videoGenerationService';

// ----------------------------------------------------------------------

/**
 * Query key factory for video generation
 */
export const videoGenerationKeys = {
  all: ['videoGeneration'] as const,
  generate: () => [...videoGenerationKeys.all, 'generate'] as const,
};

/**
 * Hook to generate a video
 */
export function useGenerateVideo() {
  const queryClient = useQueryClient();

  return useMutation<GenerateVideoResponse, Error, GenerateVideoRequest>({
    mutationFn: (data: GenerateVideoRequest) => generateVideo(data),
    onSuccess: () => {
      // Invalidate recipe videos list to refresh after generation
      queryClient.invalidateQueries({ queryKey: ['recipeVideos'] });
    },
  });
}

