import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  Typography,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  useTheme,
  Skeleton,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { ITask, ITaskForm, ITaskPriority, ITaskStatus } from '../../../@types/task';
import { ITaskDetail } from '../../../@types/taskApi';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import BranchSelect from '../../../components/branch-select/BranchSelect';
// hooks
import { useBranchForm } from '../../../hooks/useBranchForm';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuthContext } from '../../../auth/useAuthContext';
// validation
import TaskValidationSchema from './TaskValidation';
// services
import { 
  uploadFileWithPresignedUrl, 
  generateFileKey, 
  useRecipes, 
  useUsers, 
  RecipeQueryParams, 
  UserQueryParams,
  useCreateTask,
  useUpdateTask,
  ITaskApiRequest,
} from '../../../services';
// utils
import { transformTaskFormToApiRequest } from '../../../utils/taskAdapter';
// sections
import VideoUploadZone from './form/VideoUploadZone';
import { SingleImageUpload } from '../recipe/form';
// constants
import { KITCHEN_STATION_OPTIONS } from '../../../constants/kitchenStations';

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
  currentTask?: ITask | ITaskDetail;
};

// ----------------------------------------------------------------------

// Dropdown Options
const TASK_TYPE_OPTIONS = ['Prep Mise En Place', 'Cook Dish', 'Plate Dish', 'Clean Station', 'Other'];
const DISH_OPTIONS = ['Garden Breeze', 'Event On A Budget', 'Don\'t Waste Time', 'Mediterranean Delight'];

const STAFF_OPTIONS = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Chef Robert'];

// Consistent Form Styling System (Matching Recipe Form)
const FORM_INPUT_SX = {
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiInputLabel-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiFormHelperText-root': {
    fontSize: { xs: '0.75rem', md: '0.75rem' },
  },
};

export default function TaskNewEditForm({ isEdit = false, currentTask }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Branch form hook - get branch ID from current task if editing
  // For ITaskDetail (from API), use branchId; for ITask (legacy), use branchId
  const taskDetail = currentTask as ITaskDetail;
  const isTaskDetail = taskDetail && 'recipeId' in taskDetail;
  const taskBranchId = isTaskDetail 
    ? taskDetail.branchId 
    : (currentTask as ITask)?.branchId;
  
  const { branchIdForApi, showBranchSelect, initialBranchId } = useBranchForm(
    taskBranchId ? String(taskBranchId) : ''
  );

  const defaultValues = useMemo<ITaskForm>(
    () => {
      // Check if currentTask is ITaskDetail (from API) or ITask (legacy)
      const taskDetail = currentTask as ITaskDetail;
      const isTaskDetail = taskDetail && 'recipeId' in taskDetail;
      
      // Determine if task is recipe-based or custom
      const hasRecipeId = isTaskDetail 
        ? !!taskDetail.recipeId 
        : (currentTask?.taskName && typeof currentTask.taskName !== 'string');
      const isCustomTask = isTaskDetail 
        ? !!taskDetail.otherTaskName 
        : (!hasRecipeId && currentTask?.taskName);
      
      // Get recipe ID for dish selection
      const recipeId = isTaskDetail ? taskDetail.recipeId : (hasRecipeId ? (currentTask as any)?.taskName?.id || (currentTask as any)?.taskName : null);
      
      // Get priority - handle both ITaskDetail and ITask formats
      const priorityValue = isTaskDetail 
        ? (taskDetail.priority?.value === 'H' ? 'high' : 
           taskDetail.priority?.value === 'M' ? 'medium' : 
           taskDetail.priority?.value === 'L' ? 'low' : 'medium')
        : (currentTask?.priority || 'medium');
      
      // Get status - handle both ITaskDetail and ITask formats
      const statusValue = isTaskDetail
        ? (taskDetail.status?.value === 'AS' ? 'pending' :
           taskDetail.status?.value === 'IP' ? 'in-progress' :
           taskDetail.status?.value === 'CP' ? 'completed' :
           taskDetail.status?.value === 'CL' ? 'cancelled' : 'pending')
        : (currentTask?.status || 'pending');
      
      // Get video link - check YouTube URL first, then attachment video link
      const videoLinkValue = isTaskDetail
        ? (taskDetail.youtubeUrl || taskDetail.videoLink || '')
        : '';
      
      // Get video file (S3 URL)
      const videoFileValue = isTaskDetail && taskDetail.video
        ? { url: taskDetail.video, name: '', type: 'preparation' as const }
        : null;
      
      return {
        taskType: hasRecipeId ? 'dish' : 'other',
        taskName: isCustomTask ? (isTaskDetail ? taskDetail.otherTaskName || '' : String(currentTask?.taskName || '')) : '',
        dishSelection: hasRecipeId && recipeId ? String(recipeId) : (isCustomTask ? 'other' : ''),
        kitchenStation: isTaskDetail ? (taskDetail.kitchenStation || '') : '',
        assignTo: (isTaskDetail ? taskDetail.staffId : currentTask?.staffId) ? String(isTaskDetail ? taskDetail.staffId : currentTask?.staffId) : '',
      email: '',
        restaurantLocation: initialBranchId,
        taskStartTime: (isTaskDetail ? taskDetail.startedAt : (currentTask as any)?.startedAt)
          ? (() => {
              const startedAt = isTaskDetail ? taskDetail.startedAt : (currentTask as any)?.startedAt;
              if (!startedAt) return null;
              // Handle both ISO datetime strings and time-only strings (HH:MM:SS)
              if (typeof startedAt === 'string' && (startedAt.includes('T') || startedAt.includes(' '))) {
                // ISO datetime string
                return new Date(startedAt);
              } else if (typeof startedAt === 'string' && startedAt.includes(':')) {
                // Time-only string (HH:MM:SS) - combine with today's date
                const [hours, minutes, seconds] = startedAt.split(':');
                const date = new Date();
                date.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds || '0', 10), 0);
                return date;
              }
              return null;
            })()
          : null,
        taskCompletionTime: (isTaskDetail ? taskDetail.completedAt : (currentTask as any)?.completedAt)
          ? (() => {
              const completedAt = isTaskDetail ? taskDetail.completedAt : (currentTask as any)?.completedAt;
              if (!completedAt) return null;
              // Handle both ISO datetime strings and time-only strings (HH:MM:SS)
              if (typeof completedAt === 'string' && (completedAt.includes('T') || completedAt.includes(' '))) {
                // ISO datetime string
                return new Date(completedAt);
              } else if (typeof completedAt === 'string' && completedAt.includes(':')) {
                // Time-only string (HH:MM:SS) - combine with today's date
                const [hours, minutes, seconds] = completedAt.split(':');
                const date = new Date();
                date.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds || '0', 10), 0);
                return date;
              }
              return null;
            })()
          : null,
        dueDate: (isTaskDetail ? taskDetail.dueDate : currentTask?.dueDate) 
          ? new Date(isTaskDetail ? taskDetail.dueDate : (currentTask?.dueDate as string)) 
          : null,
        videoLink: videoLinkValue,
        video: videoFileValue,
        image: (isTaskDetail ? taskDetail.image : currentTask?.image) || null,
        priority: priorityValue as ITaskPriority,
        description: (isTaskDetail ? taskDetail.taskDescription : currentTask?.taskDescription) || '',
        status: statusValue as ITaskStatus,
      };
    },
    [currentTask, initialBranchId]
  );

  const methods = useForm<ITaskForm>({
    resolver: yupResolver(TaskValidationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Get branch ID from location field or branchIdForApi for API calls
  // For owners: prioritize selected branch from form, then task's branch
  // For non-owners: always use their profile branch ID (from branchIdForApi)
  const { user } = useAuthContext();
  const isOwner = user?.is_owner === true;
  
  const selectedBranchId = useMemo(() => {
    // For non-owners, always use their profile branch ID
    if (!isOwner && branchIdForApi) {
      return typeof branchIdForApi === 'number' ? branchIdForApi : parseInt(String(branchIdForApi), 10);
    }
    
    // For owners, prioritize form selection, then fallback to branchIdForApi (task's branch)
    const locationValue = values.restaurantLocation;
    if (locationValue) {
      if (typeof locationValue === 'number') {
        return locationValue;
      }
      if (typeof locationValue === 'string' && /^\d+$/.test(locationValue)) {
        return parseInt(locationValue, 10);
      }
    }
    
    // Fallback to branchIdForApi (task's branch when editing)
    if (branchIdForApi) {
      return typeof branchIdForApi === 'number' ? branchIdForApi : parseInt(String(branchIdForApi), 10);
    }
    
    return undefined;
  }, [values.restaurantLocation, branchIdForApi, isOwner]);

  // Recipe select state for search and pagination
  const [recipePage, setRecipePage] = useState(1);
  const [recipeSearchInput, setRecipeSearchInput] = useState('');
  const [recipeMenuOpen, setRecipeMenuOpen] = useState(false);
  const [allRecipes, setAllRecipes] = useState<Array<{ id: string | number; dishName: string }>>([]);
  const [selectedRecipeCache, setSelectedRecipeCache] = useState<{ id: string | number; dishName: string } | null>(null);
  const debouncedRecipeSearch = useDebounce(recipeSearchInput, 300);

  // User select state for search and pagination
  const [userPage, setUserPage] = useState(1);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<Array<{ id: number; first_name: string; last_name: string; email: string }>>([]);
  const [selectedUserCache, setSelectedUserCache] = useState<{ id: number; first_name: string; last_name: string; email: string } | null>(null);
  const debouncedUserSearch = useDebounce(userSearchInput, 300);

  // Fetch recipes with filters: status='P' (public), is_deleted=false, and branch
  const recipeQueryParams: RecipeQueryParams = useMemo(() => {
    const params: RecipeQueryParams = {
      page: recipePage,
      page_size: 50, // Fetch in pages for pagination
      status: 'P', // Public only
      is_deleted: false,
    };
    
    if (selectedBranchId) {
      params.branch = selectedBranchId;
    }
    
    if (debouncedRecipeSearch) {
      params.search = debouncedRecipeSearch;
    }
    
    return params;
  }, [selectedBranchId, recipePage, debouncedRecipeSearch]);

  const { data: recipesData, isLoading: isLoadingRecipes, isFetching: isFetchingRecipes } = useRecipes(recipeQueryParams);

  // Accumulate recipes as pages load
  useEffect(() => {
    if (recipesData?.results) {
      const newRecipes = recipesData.results.map((recipe) => ({
        id: recipe.id,
        dishName: recipe.dishName || 'Unnamed Recipe',
      }));

      if (recipePage === 1 || debouncedRecipeSearch) {
        // Reset on first page or when search changes
        setAllRecipes(newRecipes);
      } else {
        setAllRecipes((prev) => [...prev, ...newRecipes]);
      }
    }
  }, [recipesData, recipePage, debouncedRecipeSearch]);

  // Reset recipe page when search changes
  useEffect(() => {
    if (debouncedRecipeSearch) {
      setRecipePage(1);
    }
  }, [debouncedRecipeSearch]);

  // Cache selected recipe when value changes
  useEffect(() => {
    const recipeValue = values.dishSelection;
    if (recipeValue && recipeValue !== 'other') {
      const found = allRecipes.find((r) => String(r.id) === String(recipeValue));
      if (found) {
        setSelectedRecipeCache(found);
      } else if (selectedRecipeCache && String(selectedRecipeCache.id) === String(recipeValue)) {
        // Keep existing cache if it matches
        return;
      } else {
        setSelectedRecipeCache(null);
      }
    } else {
      setSelectedRecipeCache(null);
    }
  }, [values.dishSelection, allRecipes, selectedRecipeCache]);

  // Fetch users with filters: branch and is_deleted=false
  const userQueryParams: UserQueryParams = useMemo(() => {
    const params: UserQueryParams = {
      page: userPage,
      page_size: 50, // Fetch in pages for pagination
      is_deleted: false,
    };
    
    if (selectedBranchId) {
      params.branch = selectedBranchId;
    }
    
    if (debouncedUserSearch) {
      params.search = debouncedUserSearch;
    }
    
    return params;
  }, [selectedBranchId, userPage, debouncedUserSearch]);

  const { data: usersData, isLoading: isLoadingUsers, isFetching: isFetchingUsers } = useUsers(userQueryParams);

  // Accumulate users as pages load
  useEffect(() => {
    if (usersData?.results) {
      const newUsers = usersData.results.map((user) => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      }));

      if (userPage === 1 || debouncedUserSearch) {
        // Reset on first page or when search changes
        setAllUsers(newUsers);
      } else {
        setAllUsers((prev) => [...prev, ...newUsers]);
      }
    }
  }, [usersData, userPage, debouncedUserSearch]);

  // Reset user page when search changes
  useEffect(() => {
    if (debouncedUserSearch) {
      setUserPage(1);
    }
  }, [debouncedUserSearch]);

  // Cache selected user when value changes
  useEffect(() => {
    const userValue = values.assignTo;
    if (userValue) {
      const found = allUsers.find((u) => String(u.id) === String(userValue));
      if (found) {
        setSelectedUserCache(found);
      } else if (selectedUserCache && String(selectedUserCache.id) === String(userValue)) {
        // Keep existing cache if it matches
        return;
      } else {
        setSelectedUserCache(null);
      }
    } else {
      setSelectedUserCache(null);
    }
  }, [values.assignTo, allUsers, selectedUserCache]);

  // Load more recipes when scrolling
  const handleRecipeMenuScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom < 100 && recipesData?.next && !isFetchingRecipes && !isLoadingRecipes && !debouncedRecipeSearch) {
      setRecipePage((prev) => prev + 1);
    }
  }, [recipesData?.next, isFetchingRecipes, isLoadingRecipes, debouncedRecipeSearch]);

  // Load more users when scrolling
  const handleUserMenuScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom < 100 && usersData?.next && !isFetchingUsers && !isLoadingUsers && !debouncedUserSearch) {
      setUserPage((prev) => prev + 1);
    }
  }, [usersData?.next, isFetchingUsers, isLoadingUsers, debouncedUserSearch]);

  // Mutation hooks
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  useEffect(() => {
    if (isEdit && currentTask) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentTask, reset, defaultValues]);

  const onSubmit = async (data: ITaskForm) => {
    console.log('Form submitted with data:', data);
    console.log('Form validation errors:', errors);
    try {
      let uploadedImageUrl: string | null = null;
      let uploadedVideoUrl: string | null = null;

      // Upload image if new file selected
      if (imageFile) {
        const fileKey = generateFileKey('task_images', imageFile.name);
        uploadedImageUrl = await uploadFileWithPresignedUrl(imageFile, fileKey, imageFile.type);
      } else if (data.image && data.image.startsWith('http')) {
        // Use existing image URL if it's already an HTTP URL
        uploadedImageUrl = data.image;
      }

      // Upload video file to S3 if new file selected
      if (videoFile) {
        const fileKey = generateFileKey('task_videos', videoFile.name);
        uploadedVideoUrl = await uploadFileWithPresignedUrl(videoFile, fileKey, videoFile.type);
      } else if (data.video && data.video.url && data.video.url.startsWith('http') && !data.video.url.startsWith('blob:')) {
        // Use existing video URL if it's already an HTTP URL (not a blob URL)
        uploadedVideoUrl = data.video.url;
      }

      // Get branch ID for API
      const branchIdForRequest = branchIdForApi || (data.restaurantLocation && /^\d+$/.test(String(data.restaurantLocation)) 
        ? parseInt(String(data.restaurantLocation), 10) 
        : undefined);

      // Get user email from selected user
      const selectedUserEmail = data.assignTo 
        ? (allUsers.find((u) => String(u.id) === String(data.assignTo))?.email || null)
        : null;

      // Transform form data to API request format
      const apiRequest: ITaskApiRequest = transformTaskFormToApiRequest(
        data,
        branchIdForRequest,
        uploadedImageUrl,
        uploadedVideoUrl,
        selectedUserEmail
      );

      // Remove status from create request (backend always sets to 'AS')
      if (!isEdit && apiRequest.status) {
        delete apiRequest.status;
      }

      if (isEdit && currentTask) {
        // Update existing task
        await updateTaskMutation.mutateAsync({
          id: currentTask.id,
          data: apiRequest,
        });
        enqueueSnackbar('Task updated successfully!', { variant: 'success' });
      } else {
        // Create new task
        await createTaskMutation.mutateAsync(apiRequest);
        enqueueSnackbar('Task created successfully!', { variant: 'success' });
      }

      navigate(PATH_DASHBOARD.tasks.list);
    } catch (error: any) {
      console.error('Error saving task:', error);
      const errorMessage = error?.response?.data?.detail || 
                          (error?.response?.data && typeof error.response.data === 'object' 
                            ? JSON.stringify(error.response.data) 
                            : error?.message) ||
                          'Something went wrong!';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };


  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setValue('video', { url, name: file.name, type: 'preparation' });
  };

  const handleVideoRemove = () => {
    setVideoFile(null);
    setValue('video', null);
  };

  const handleVideoTypeChange = (type: 'preparation' | 'presentation') => {
    if (values.video) {
      setValue('video', { ...values.video, type });
    }
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setValue('image', url);
  };

  // Handle image remove
  const handleImageRemove = () => {
    setImageFile(null);
    setValue('image', null);
  };



  // Check if "Other" is selected in dish selection to show custom task name input
  const isOtherSelected = values.dishSelection === 'other';

  // Update taskType based on dishSelection
  useEffect(() => {
    if (values.dishSelection === 'other') {
      setValue('taskType', 'other', { shouldValidate: false });
    } else if (values.dishSelection && values.dishSelection !== 'other') {
      setValue('taskType', 'dish', { shouldValidate: false });
    }
  }, [values.dishSelection, setValue]);

  // Handle form submission errors
  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
    console.error('Form values:', values);
    console.error('Form errors object:', errors);
    enqueueSnackbar('Please fix the form errors before submitting', { variant: 'error' });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit, onError)}>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Basic Task Information */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              }}
            >
              Basic Task Information
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Restaurant Location - Only shown to owners when location not in URL */}
              {showBranchSelect && (
                <Grid  item xs={12} sm={6} md={4}>
                  <Controller
                    name="restaurantLocation"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <BranchSelect
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : (/^\d+$/.test(value) ? parseInt(value, 10) : value));
                        }}
                        label="Restaurant Location"
                        formInputSx={{
                          width: '100%',
                          maxWidth: '100%',
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: { xs: '0.75rem', md: '0.75rem' },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Task Type */}
              {/* <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="taskType" label="Task Type" sx={FORM_INPUT_SX}>
                  {TASK_TYPE_OPTIONS.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid> */}

              {/* Dish Selection - Always shown with search and pagination */}
                <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="dishSelection"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const selectedRecipeName = useMemo(() => {
                      if (!field.value || field.value === 'other') return field.value === 'other' ? 'Other' : '';
                      if (selectedRecipeCache && String(selectedRecipeCache.id) === String(field.value)) {
                        return selectedRecipeCache.dishName;
                      }
                      const recipe = allRecipes.find((r) => String(r.id) === String(field.value));
                      return recipe ? recipe.dishName : '';
                    }, [field.value, selectedRecipeCache, allRecipes]);

                    return (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Select Dish"
                        error={!!error}
                        helperText={error?.message}
                        disabled={isLoadingRecipes || !selectedBranchId}
                        SelectProps={{
                          open: recipeMenuOpen,
                          onOpen: () => setRecipeMenuOpen(true),
                          onClose: () => {
                            setRecipeMenuOpen(false);
                            setRecipeSearchInput('');
                          },
                          renderValue: () => selectedRecipeName || (field.value ? String(field.value) : ''),
                          MenuProps: {
                            PaperProps: {
                              onScroll: handleRecipeMenuScroll,
                              onMouseDown: (e) => e.stopPropagation(),
                              sx: { maxHeight: 260 },
                            },
                            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                            transformOrigin: { vertical: 'top', horizontal: 'left' },
                            disableAutoFocusItem: true,
                          },
                          sx: { textTransform: 'none' },
                        }}
                        sx={FORM_INPUT_SX}
                      >
                        {/* Search input inside dropdown */}
                        <Box
                          component="div"
                          sx={{ px: 1.5, pt: 1.5, pb: 1 }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search recipes..."
                            value={recipeSearchInput}
                            onChange={(e) => setRecipeSearchInput(e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') e.preventDefault();
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                                </InputAdornment>
                              ),
                              onMouseDown: (e) => e.stopPropagation(),
                              onClick: (e) => e.stopPropagation(),
                            }}
                            inputProps={{
                              onMouseDown: (e) => e.stopPropagation(),
                              onClick: (e) => e.stopPropagation(),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                height: 36,
                              },
                              '& .MuiInputBase-input': { py: 1 },
                            }}
                          />
                        </Box>

                        {/* Divider */}
                        <Box sx={{ width: '100%', height: 1, bgcolor: 'divider', mx: 1.5, mb: 0.5 }} />

                        {/* "Other" option at the top */}
                      <MenuItem
                          value="other"
                          sx={{
                            mx: 1,
                            borderRadius: 0.75,
                            fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                          }}
                        >
                          Other
                      </MenuItem>

                        {/* Recipe options */}
                        {isLoadingRecipes || isFetchingRecipes ? (
                          [...Array(3)].map((_, index) => (
                            <MenuItem key={`skeleton-${index}`} disabled>
                              <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{
                                  mx: 1,
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                }}
                              />
                            </MenuItem>
                          ))
                        ) : allRecipes.length === 0 ? (
                          <MenuItem disabled>
                            <Box
                              sx={{
                                width: '100%',
                                py: 1,
                                textAlign: 'center',
                                color: 'text.disabled',
                                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                              }}
                            >
                              {debouncedRecipeSearch ? 'No recipes found' : selectedBranchId ? 'No recipes available' : 'Please select a location first'}
                            </Box>
                          </MenuItem>
                        ) : (
                          allRecipes.map((recipe) => (
                            <MenuItem
                              key={recipe.id}
                              value={String(recipe.id)}
                              sx={{
                                mx: 1,
                                borderRadius: 0.75,
                                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                              }}
                            >
                              {recipe.dishName}
                            </MenuItem>
                          ))
                        )}
                      </TextField>
                    );
                  }}
                />
              </Grid>

              {/* Task Name Input - Show when "Other" is selected */}
              {isOtherSelected && (
                <Grid item xs={12} sm={6} md={4}>
                  <RHFTextField
                    name="taskName"
                    label="Enter Task Name"
                    placeholder="Enter your custom task name"
                    sx={FORM_INPUT_SX}
                  />
                </Grid>
              )}

              {/* Kitchen Station */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="kitchenStation" label="Kitchen Station" sx={FORM_INPUT_SX}>
                  {KITCHEN_STATION_OPTIONS.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Assign To - with search and pagination */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="assignTo"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const selectedUserName = useMemo(() => {
                      if (!field.value) return '';
                      if (selectedUserCache && String(selectedUserCache.id) === String(field.value)) {
                        return `${selectedUserCache.first_name} ${selectedUserCache.last_name}`.trim();
                      }
                      const user = allUsers.find((u) => String(u.id) === String(field.value));
                      return user ? `${user.first_name} ${user.last_name}`.trim() : '';
                    }, [field.value, selectedUserCache, allUsers]);

                    return (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Assign To"
                        error={!!error}
                        helperText={error?.message}
                        disabled={isLoadingUsers || !selectedBranchId}
                        SelectProps={{
                          open: userMenuOpen,
                          onOpen: () => setUserMenuOpen(true),
                          onClose: () => {
                            setUserMenuOpen(false);
                            setUserSearchInput('');
                          },
                          renderValue: () => selectedUserName || (field.value ? String(field.value) : ''),
                          MenuProps: {
                            PaperProps: {
                              onScroll: handleUserMenuScroll,
                              onMouseDown: (e) => e.stopPropagation(),
                              sx: { maxHeight: 260 },
                            },
                            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                            transformOrigin: { vertical: 'top', horizontal: 'left' },
                            disableAutoFocusItem: true,
                          },
                          sx: { textTransform: 'none' },
                        }}
                        sx={FORM_INPUT_SX}
                      >
                        {/* Search input inside dropdown */}
                        <Box
                          component="div"
                          sx={{ px: 1.5, pt: 1.5, pb: 1 }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search users..."
                            value={userSearchInput}
                            onChange={(e) => setUserSearchInput(e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') e.preventDefault();
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                                </InputAdornment>
                              ),
                              onMouseDown: (e) => e.stopPropagation(),
                              onClick: (e) => e.stopPropagation(),
                            }}
                            inputProps={{
                              onMouseDown: (e) => e.stopPropagation(),
                              onClick: (e) => e.stopPropagation(),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                height: 36,
                              },
                              '& .MuiInputBase-input': { py: 1 },
                            }}
                          />
                        </Box>

                        {/* Divider */}
                        <Box sx={{ width: '100%', height: 1, bgcolor: 'divider', mx: 1.5, mb: 0.5 }} />

                        {/* User options */}
                        {isLoadingUsers || isFetchingUsers ? (
                          [...Array(3)].map((_, index) => (
                            <MenuItem key={`skeleton-${index}`} disabled>
                              <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{
                                  mx: 1,
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                }}
                              />
                            </MenuItem>
                          ))
                        ) : allUsers.length === 0 ? (
                          <MenuItem disabled>
                            <Box
                              sx={{
                                width: '100%',
                                py: 1,
                                textAlign: 'center',
                                color: 'text.disabled',
                                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                              }}
                            >
                              {debouncedUserSearch ? 'No users found' : selectedBranchId ? 'No users available' : 'Please select a location first'}
                            </Box>
                          </MenuItem>
                        ) : (
                          allUsers.map((user) => {
                            const fullName = `${user.first_name} ${user.last_name}`.trim();
                            return (
                    <MenuItem
                                key={user.id}
                                value={String(user.id)}
                                sx={{
                                  mx: 1,
                                  borderRadius: 0.75,
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                }}
                              >
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {fullName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {user.email}
                                  </Typography>
                                </Box>
                    </MenuItem>
                            );
                          })
                        )}
                      </TextField>
                    );
                  }}
                />
              </Grid>

              {/* Email Address */}
              {/* <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="email"
                  label="Email Address (Optional)"
                  type="email"
                  placeholder="staff@restaurant.com"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:email-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid> */}
            </Grid>
          </Card>
        </Grid>

        {/* Task Scheduling */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              }}
            >
              Task Scheduling
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Task Start Time */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="taskStartTime"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      {...field}
                      label="Task Start Time"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          sx={FORM_INPUT_SX}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Task Completion Time */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="taskCompletionTime"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      {...field}
                      label="Task Completion Time"
                      minDateTime={values.taskStartTime || undefined}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          sx={FORM_INPUT_SX}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Due Date */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      {...field}
                      label="Due Date & Time"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          sx={FORM_INPUT_SX}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Priority & Description */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              }}
            >
              Priority & Description
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Priority */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel
                    component="legend"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    Priority Level
                  </FormLabel>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value="low"
                          control={<Radio size="small" />}
                          label="Low"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel
                          value="medium"
                          control={<Radio size="small" />}
                          label="Medium"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel
                          value="high"
                          control={<Radio size="small" />}
                          label="High"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel
                          value="urgent"
                          control={<Radio size="small" />}
                          label="Urgent"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              {/* Task Description */}
              <Grid item xs={12}>
                <RHFTextField
                  name="description"
                  label="Task Description"
                  multiline
                  rows={6}
                  placeholder="Enter detailed task description, instructions, or special notes..."
                  sx={FORM_INPUT_SX}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Additional Resources */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              }}
            >
              Additional Resources (Optional)
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Video Link */}
              <Grid item xs={12}>
                <RHFTextField
                  name="videoLink"
                  label="Add Video Link"
                  placeholder="https://youtube.com/watch?v=..."
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:link-2-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Upload Video - Using VideoUploadZone */}
              <Grid item xs={12}>
                <Controller
                  name="video"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <VideoUploadZone
                      video={field.value}
                      onUpload={handleVideoUpload}
                      onRemove={handleVideoRemove}
                      onTypeChange={handleVideoTypeChange}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              {/* Upload Image - Using SingleImageUpload */}
              {/* <Grid item xs={12}>
                <Controller
                  name="image"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <SingleImageUpload
                      image={field.value || null}
                      onUpload={handleImageUpload}
                      onRemove={handleImageRemove}
                      label="Upload Task Image"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid> */}
            </Grid>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: { xs: 2, md: 3 } }}
          >
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(PATH_DASHBOARD.tasks.list)}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => reset()}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
            >
              Clear
            </Button>

            {/* <LoadingButton
              variant="outlined"
              size="large"
              loading={isSubmitting}
              onClick={onSaveDraft}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
            >
              Save as Draft
            </LoadingButton> */}

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting || createTaskMutation.isPending || updateTaskMutation.isPending}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
            >
              {isEdit ? 'Update Task' : 'Create Task'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

