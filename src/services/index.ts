// Export QueryClient
export { queryClient } from './queryClient';

// Export Recipe hooks
export {
  useRecipe,
  useRecipes,
  useDraftRecipes,
  useCreateRecipe,
  useUpdateRecipe,
  useUpdateRecipeFull,
  useDeleteRecipe,
  useRestoreRecipe,
  usePermanentlyDeleteRecipe,
  recipeKeys,
} from './recipes/recipeHooks';

// Export Recipe types
export type { RecipeQueryParams, RecipeListResponse } from './recipes/recipeService';

// Export Task hooks
export {
  useTask,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useUpdateTaskDescription,
  useUpdateTaskStatus,
  useAddTaskComment,
  useUpdateTaskComment,
  useDeleteTask,
  useRestoreTask,
  usePermanentlyDeleteTask,
  taskKeys,
} from './tasks/taskHooks';

// Export Task types
export type { TaskQueryParams, TaskListResponse, ITaskApiRequest } from './tasks/taskHooks';

// Export User hooks
export {
  useUser,
  useUsers,
  useUpdateUser,
  useDeleteUser,
  useRestoreUser,
  usePermanentlyDeleteUser,
  userKeys,
} from './users/userHooks';

// Export User types
export type { UserQueryParams, UserListResponse } from './users/userHooks';

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
export {
  useBranches,
  useBranch,
  useCreateBranch,
  useUpdateBranch,
  useArchiveBranch,
  useRestoreBranch,
  usePermanentlyDeleteBranch,
  branchKeys,
} from './branches/branchHooks';

// Export Branch types
export type { BranchQueryParams, BranchListResponse, IBranch } from './branches/branchService';

// Export Menu Category hooks
export { useMenuCategories, menuCategoryKeys } from './menuCategories/menuCategoryHooks';

// Export Menu Category types
export type { IMenuCategory } from './menuCategories/menuCategoryService';

// Export Predefined Items hooks
export {
  usePredefinedIngredients,
  useAllPredefinedIngredients,
  usePredefinedStarch,
  useAllPredefinedStarch,
  usePredefinedVegetables,
  useAllPredefinedVegetables,
  predefinedItemKeys,
} from './predefinedItems/predefinedItemHooks';

// Export Predefined Items types
export type {
  IPredefinedItem,
  PredefinedItemQueryParams,
  PredefinedItemListResponse,
} from './predefinedItems/predefinedItemService';

// Export common types
export type { ApiResponse, PaginatedResponse, QueryParams, MutationOptions } from './common/types';

// Export Presigned URL hooks
export {
  useGetPresignedUrl,
  useUploadFileToS3,
  useUploadFileWithPresignedUrl,
  useUploadMultipleFiles,
  presignedUrlKeys,
} from './presignedUrl/presignedUrlHooks';

// Export Presigned URL service functions
export {
  getPresignedUrl,
  uploadFileToS3,
  uploadFileWithPresignedUrl,
  uploadMultipleFiles,
  generateFileKey,
} from './presignedUrl/presignedUrlService';

// Export Presigned URL types
export type {
  IPresignedUrlRequest,
  IPresignedUrlResponse,
} from './presignedUrl/presignedUrlService';

