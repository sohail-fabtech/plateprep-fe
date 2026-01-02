// Export QueryClient
export { queryClient } from './queryClient';

// Export Recipe hooks
export {
  useRecipe,
  useRecipes,
  useCreateRecipe,
  useUpdateRecipe,
  useUpdateRecipeFull,
  useDeleteRecipe,
  recipeKeys,
} from './recipes/recipeHooks';

// Export Recipe types
export type { RecipeQueryParams, RecipeListResponse } from './recipes/recipeService';

// Export Task hooks
export {
  useTask,
  useTasks,
  useUpdateTask,
  useUpdateTaskDescription,
  useUpdateTaskStatus,
  useAddTaskComment,
  useDeleteTask,
  taskKeys,
} from './tasks/taskHooks';

// Export Location hooks
export {
  useLocations,
  useLocation,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
  locationKeys,
} from './locations/locationHooks';

// Export Branch hooks
export { useBranches, branchKeys } from './branches/branchHooks';

// Export Branch types
export type { BranchQueryParams, BranchListResponse, IBranch } from './branches/branchService';

// Export Menu Category hooks
export { useMenuCategories, menuCategoryKeys } from './menuCategories/menuCategoryHooks';

// Export Menu Category types
export type { IMenuCategory } from './menuCategories/menuCategoryService';

// Export common types
export type { ApiResponse, PaginatedResponse, QueryParams, MutationOptions } from './common/types';

