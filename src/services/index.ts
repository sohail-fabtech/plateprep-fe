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

// Export Ingredient hooks
export {
  useIngredients,
  ingredientKeys,
} from './recipes/ingredientHooks';

// Export Ingredient types
export type { IIngredientApiResponse } from './recipes/ingredientService';

// Export Step hooks
export {
  useSteps,
  stepKeys,
} from './recipes/stepHooks';

// Export Step types
export type { IStepApiResponse } from './recipes/stepService';

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
  useCreateUser,
  useUpdateUser,
  useUpdateProfile,
  useUpdateUserIndividualPermissions,
  useChangePassword,
  useDeleteUser,
  useRestoreUser,
  usePermanentlyDeleteUser,
  userKeys,
} from './users/userHooks';

// Export User types
export type { UserQueryParams, UserListResponse, UpdateUserIndividualPermissionsRequest } from './users/userHooks';

// Export Role hooks
export {
  useRole,
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useRestoreRole,
  usePermanentlyDeleteRole,
  usePermissions,
  roleKeys,
  permissionKeys,
} from './roles/roleHooks';

// Export Role types
export type { RoleQueryParams, RoleListResponse } from './roles/roleHooks';

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

// Export Access Log hooks
export {
  useAccessLogs,
  useAccessLog,
  accessLogKeys,
} from './accessLogs/accessLogHooks';

// Export Access Log types
export type { AccessLogQueryParams, AccessLogListResponse } from './accessLogs/accessLogHooks';

// Export Audit Log hooks
export {
  useAuditLogs,
  useAuditLog,
  auditLogKeys,
} from './auditLogs/auditLogHooks';

// Export Audit Log types
export type { AuditLogQueryParams, AuditLogListResponse } from './auditLogs/auditLogHooks';

// Export Recipe Video hooks
export {
  useRecipeVideos,
  useRecipeVideo,
  recipeVideoKeys,
} from './recipeVideos/recipeVideoHooks';

// Export Recipe Video types
export type { RecipeVideoQueryParams, RecipeVideoListResponse } from './recipeVideos/recipeVideoHooks';

// Export Video Generation hooks
export {
  useGenerateVideo,
  videoGenerationKeys,
} from './videoGeneration/videoGenerationHooks';

// Export Video Generation types
export type { GenerateVideoRequest, GenerateVideoResponse } from './videoGeneration/videoGenerationService';

// Export Dictionary Category hooks
export {
  useDictionaryCategories,
  useDictionaryCategory,
  useCreateDictionaryCategory,
  useUpdateDictionaryCategory,
  useDeleteDictionaryCategory,
  dictionaryCategoryKeys,
} from './dictionaryCategories/dictionaryCategoryHooks';

// Export Dictionary Category types
export type { DictionaryCategoryQueryParams, DictionaryCategoryListResponse } from './dictionaryCategories/dictionaryCategoryHooks';
export type { IDictionaryCategory, CreateDictionaryCategoryRequest, UpdateDictionaryCategoryRequest } from './dictionaryCategories/dictionaryCategoryService';

// Export Dictionary Item hooks
export {
  useDictionaryItems,
  useCreateDictionaryItem,
  useUpdateDictionaryItem,
  useDeleteDictionaryItem,
  dictionaryItemKeys,
} from './dictionaryItems/dictionaryItemHooks';

// Export Dictionary Item types
export type { DictionaryItemQueryParams, DictionaryItemListResponse } from './dictionaryItems/dictionaryItemHooks';
export type { IDictionaryItem, CreateDictionaryItemRequest, UpdateDictionaryItemRequest } from './dictionaryItems/dictionaryItemService';

// Export Schedule Dish hooks
export {
  useScheduleDishes,
  useScheduleDish,
  useScheduleDishMutation,
  useUpdateScheduleDish,
  useDeleteScheduleDish,
  scheduleDishKeys,
} from './scheduleDish/scheduleDishHooks';

// Export Schedule Dish types
export type { ScheduleDishQueryParams, ScheduleDishListResponse } from './scheduleDish/scheduleDishHooks';
export type {
  IScheduleDish,
  ScheduleDishRequest,
  UpdateScheduleDishRequest,
  ScheduleDishResponse,
} from './scheduleDish/scheduleDishService';

// Export Holiday hooks
export {
  useHolidays,
  holidayKeys,
} from './holidays/holidayHooks';

// Export Holiday types
export type { HolidayQueryParams, HolidayListResponse } from './holidays/holidayHooks';
export type { IHoliday } from './holidays/holidayService';

// Export AI Recipe Generation hooks
export {
  useGenerateAIRecipe,
  aiRecipeGenerationKeys,
} from './aiRecipeGeneration/aiRecipeGenerationHooks';

// Export AI Recipe Generation types
export type { GenerateAIRecipeRequest, GenerateAIRecipeResponse } from './aiRecipeGeneration/aiRecipeGenerationService';

