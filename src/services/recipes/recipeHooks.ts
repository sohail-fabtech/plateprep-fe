import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IRecipe } from '../../@types/recipe';
import {
  getRecipeById,
  getRecipes,
  createRecipe,
  updateRecipe,
  updateRecipeFull,
  deleteRecipe,
  restoreRecipe,
  permanentlyDeleteRecipe,
  RecipeQueryParams,
  RecipeListResponse,
} from './recipeService';

// ----------------------------------------------------------------------

/**
 * Query key factory for recipes
 */
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (params?: RecipeQueryParams) => [...recipeKeys.lists(), params] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...recipeKeys.details(), id] as const,
};

/**
 * Hook to fetch a single recipe by ID
 */
export function useRecipe(id: string | number | undefined) {
  return useQuery({
    queryKey: recipeKeys.detail(id!),
    queryFn: () => getRecipeById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch list of recipes with pagination
 */
export function useRecipes(params?: RecipeQueryParams) {
  return useQuery<RecipeListResponse>({
    queryKey: recipeKeys.list(params),
    queryFn: () => getRecipes(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
}

/**
 * Hook to create a new recipe
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipe: Partial<IRecipe>) => createRecipe(recipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

/**
 * Hook to update a recipe (PATCH)
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<IRecipe> }) =>
      updateRecipe(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

/**
 * Hook to update a recipe (PUT - full update)
 */
export function useUpdateRecipeFull() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<IRecipe> }) =>
      updateRecipeFull(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

/**
 * Hook to delete a recipe (soft delete/archive)
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteRecipe(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) });
    },
  });
}

/**
 * Hook to restore an archived recipe
 */
export function useRestoreRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => restoreRecipe(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(id) });
    },
  });
}

/**
 * Hook to permanently delete a recipe
 */
export function usePermanentlyDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => permanentlyDeleteRecipe(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) });
    },
  });
}

