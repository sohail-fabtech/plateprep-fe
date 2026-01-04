import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Typography,
  MenuItem,
  InputAdornment,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IVideoGenerationForm } from '../../../@types/videoGeneration';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import { SkeletonIngredientList, SkeletonStepList } from '../../../components/skeleton';
// hooks
import { usePermissions } from '../../../hooks/usePermissions';
import { useSubscription } from '../../../hooks/useSubscription';
// sections
import { VideoTemplateSelector, SimpleIngredientList } from './form';
import { DynamicStepList } from '../recipe/form';
// mock
import { _videoTemplates } from '../../../_mock/arrays';
// services
import { useRecipes, useIngredients, useSteps, useGenerateVideo, RecipeQueryParams } from '../../../services';

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
};

// ----------------------------------------------------------------------

// Consistent Form Styling System (Matching Recipe, Task & Restaurant Forms)
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

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Italian', 'Chinese', 'Japanese'];

export default function VideoGenerationNewEditForm({ isEdit = false }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const { hasSubscription } = useSubscription();
  
  // Fetch public recipes (is_deleted: false, status: 'P', no branch_id)
  const recipeQueryParams: RecipeQueryParams = useMemo(() => ({
    page: 1,
    page_size: 1000, // Fetch all public recipes
    status: 'P', // Public only
    is_deleted: false,
  }), []);
  
  const { data: recipesData, isLoading: isLoadingRecipes } = useRecipes(recipeQueryParams);
  
  // Recipe options for dropdown
  const RECIPE_OPTIONS = useMemo(() => {
    const options = recipesData?.results?.map((recipe) => ({
      value: String(recipe.id),
      label: recipe.dishName,
    })) || [];
    options.push({ value: 'other', label: 'Other' });
    return options;
  }, [recipesData]);
  
  // Generate video mutation
  const generateVideoMutation = useGenerateVideo();

  const NewVideoSchema = Yup.object().shape({
    selectedTemplate: Yup.string().required('Please select a video template'),
    recipe: Yup.string().required('Recipe selection is required'),
    recipeName: Yup.string().when('recipe', {
      is: 'other',
      then: (schema) => schema.required('Recipe name is required when selecting Other'),
      otherwise: (schema) => schema.notRequired(),
    }),
    language: Yup.string().required('Language is required'),
    introduction: Yup.string().required('Introduction is required'),
    lastWords: Yup.string().required('Last words are required'),
    ingredients: Yup.array().min(1, 'At least one ingredient is required'),
    steps: Yup.array().min(1, 'At least one step is required'),
  });

  const defaultValues = useMemo<IVideoGenerationForm>(
    () => ({
      selectedTemplate: '',
      recipe: '',
      recipeName: '',
      language: 'English',
      introduction: "Thank you Chef and thank you for logging in. In this video, we are going to break down a new recipe that has been added for our customer's enjoyments",
      lastWords: "Thank you for everything you do for us. We couldn't do what we do without your participation in our mission",
      ingredients: [],
      steps: [],
    }),
    []
  );

  const methods = useForm<IVideoGenerationForm>({
    resolver: yupResolver(NewVideoSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = methods;

  const selectedRecipe = watch('recipe');
  const selectedTemplate = watch('selectedTemplate');
  
  // Fetch ingredients and steps when recipe is selected
  const recipeIdForFetch = selectedRecipe && selectedRecipe !== 'other' ? selectedRecipe : undefined;
  const { data: ingredientsData, isLoading: isLoadingIngredients } = useIngredients(recipeIdForFetch);
  const { data: stepsData, isLoading: isLoadingSteps } = useSteps(recipeIdForFetch);

  // Get selected recipe from the list to display recipe name
  const selectedRecipeData = useMemo(() => {
    if (!selectedRecipe || selectedRecipe === 'other' || !recipesData?.results) {
      return null;
    }
    return recipesData.results.find((recipe) => String(recipe.id) === selectedRecipe);
  }, [selectedRecipe, recipesData]);

  // Load recipe data when recipe is selected
  useEffect(() => {
    if (selectedRecipe && selectedRecipe !== 'other') {
      // Set recipe name from the selected recipe in the list
      if (selectedRecipeData) {
        setValue('recipeName', selectedRecipeData.dishName || '');
      }
      
      // Only update ingredients/steps when data is loaded (not loading)
      if (!isLoadingIngredients && ingredientsData !== undefined) {
        // Map ingredients from API response to form format (just titles)
        if (ingredientsData.length > 0) {
          const ingredients = ingredientsData.map((ing) => ing.title);
          setValue('ingredients', ingredients);
        } else {
          // If API returns empty array, set to [''] so user can add items
          setValue('ingredients', ['']);
        }
      }
      
      if (!isLoadingSteps && stepsData !== undefined) {
        // Map steps from API response to form format (just titles)
        if (stepsData.length > 0) {
          const steps = stepsData.map((step) => step.title);
          setValue('steps', steps);
        } else {
          // If API returns empty array, set to [''] so user can add items
          setValue('steps', ['']);
        }
      }
    } else if (selectedRecipe === 'other') {
      // Clear ingredients and steps when "Other" is selected
      setValue('ingredients', ['']);
      setValue('steps', ['']);
      setValue('recipeName', '');
    }
  }, [selectedRecipe, selectedRecipeData, ingredientsData, stepsData, isLoadingIngredients, isLoadingSteps, setValue]);

  // Handle form validation errors
  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
    enqueueSnackbar('Please fix the form errors before submitting', { variant: 'error' });
  };

  const onSubmit = async (data: IVideoGenerationForm) => {
    try {
      // Check permissions
      if (!hasPermission('create_video_generation')) {
        enqueueSnackbar('You do not have permission to generate videos. Please contact your administrator.', { variant: 'error' });
        return;
      }

      // Check subscription
      if (!hasSubscription()) {
        enqueueSnackbar('You need an active subscription to generate videos. Please subscribe to continue.', { variant: 'error' });
        navigate(PATH_DASHBOARD.subscription);
        return;
      }

      // Validate that recipe is selected (not "other" for now, or handle "other" case)
      if (!data.recipe || data.recipe === 'other') {
        enqueueSnackbar('Please select a recipe from the list.', { variant: 'error' });
        return;
      }
      
      // Validate template is selected
      if (!data.selectedTemplate) {
        enqueueSnackbar('Please select a video template.', { variant: 'error' });
        return;
      }
      
      // Validate ingredients
      const filteredIngredients = data.ingredients.filter((ing) => ing.trim() !== '');
      if (filteredIngredients.length === 0) {
        enqueueSnackbar('Please add at least one ingredient.', { variant: 'error' });
        return;
      }
      
      // Validate steps
      const filteredSteps = data.steps.filter((step) => step.trim() !== '');
      if (filteredSteps.length === 0) {
        enqueueSnackbar('Please add at least one step.', { variant: 'error' });
        return;
      }
      
      // Map language to API format (lowercase)
      const languageMap: Record<string, string> = {
        'English': 'en',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Italian': 'it',
        'Chinese': 'zh',
        'Japanese': 'ja',
      };
      
      const apiPayload = {
        title: data.recipeName || '',
        recipe: parseInt(data.recipe, 10),
        introduction: data.introduction,
        steps: filteredSteps,
        ingredient: filteredIngredients,
        last_words: data.lastWords,
        template_id: data.selectedTemplate,
        language: languageMap[data.language] || 'en',
      };
      
      // Clear previous errors before submission
      clearErrors();
      
      await generateVideoMutation.mutateAsync(apiPayload);
      
      enqueueSnackbar('Video generation started successfully!', { variant: 'success' });
      navigate(PATH_DASHBOARD.videoGeneration.library);
    } catch (error: any) {
      console.error('Error generating video:', error);
      console.error('Error originalError:', error?.originalError);
      console.error('Error response:', error?.response);
      console.error('Error responseData:', error?.responseData);
      
      // The axios interceptor returns error.response.data directly, so the service preserves it in responseData
      // Check responseData first (preserved by VideoGenerationError)
      const errorData = error?.responseData || error?.originalError || null;
      
      console.error('Error response data (final):', errorData);
      
      // Handle field-specific errors from API (check original response first)
      if (errorData && typeof errorData === 'object') {
        let hasFieldErrors = false;
        
        // Handle recipe field error (e.g., "This recipe already has a video")
        if (errorData.recipe) {
          let recipeErrorMessage: string;
          
          if (Array.isArray(errorData.recipe)) {
            recipeErrorMessage = errorData.recipe[0] || 'Recipe error occurred.';
          } else if (typeof errorData.recipe === 'string') {
            recipeErrorMessage = errorData.recipe;
          } else {
            recipeErrorMessage = 'Recipe error occurred.';
          }
          
          // Trim whitespace from error message
          recipeErrorMessage = recipeErrorMessage.trim();
          
          // Set error on recipe field
          setError('recipe', {
            type: 'server',
            message: recipeErrorMessage,
          });
          
          // Show the specific error message in snackbar
          enqueueSnackbar(recipeErrorMessage, { variant: 'error' });
          hasFieldErrors = true;
        }
        
        // Handle other field-specific errors
        Object.keys(errorData).forEach((field) => {
          // Skip generic error fields and recipe (already handled)
          if (field === 'error' || field === 'detail' || field === 'message' || field === 'non_field_errors' || field === 'recipe') {
            return;
          }
          
          const fieldErrors = errorData[field];
          let errorMessage: string;
          
          if (Array.isArray(fieldErrors)) {
            errorMessage = fieldErrors[0] || `${field} error occurred.`;
          } else if (typeof fieldErrors === 'string') {
            errorMessage = fieldErrors;
          } else {
            return; // Skip invalid error formats
          }
          
          // Trim whitespace
          errorMessage = errorMessage.trim();
          
          // Map API field names to form field names
          const formFieldName = 
            field === 'template_id' ? 'selectedTemplate' :
            field === 'ingredient' ? 'ingredients' :
            field === 'last_words' ? 'lastWords' :
            field;
          
          setError(formFieldName as any, {
            type: 'server',
            message: errorMessage,
          });
          hasFieldErrors = true;
        });
        
        // If we set field errors, don't show general error message
        if (hasFieldErrors) {
          return;
        }
      }
      
      // Show general error message only if no field-specific errors were found
      // Use the processed error message from the service as fallback
      const errorMessage = error?.message || 'Failed to generate video. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    if (result.type === 'ingredient') {
      const ingredients = [...watch('ingredients')];
      const [reorderedItem] = ingredients.splice(result.source.index, 1);
      ingredients.splice(result.destination.index, 0, reorderedItem);
      setValue('ingredients', ingredients);
    } else if (result.type === 'step') {
      const steps = [...watch('steps')];
      const [reorderedItem] = steps.splice(result.source.index, 1);
      steps.splice(result.destination.index, 0, reorderedItem);
      setValue('steps', steps);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit, onError)}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Video Template Selection */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <VideoTemplateSelector
              templates={_videoTemplates}
              selectedTemplate={selectedTemplate}
              onSelect={(templateId) => {
                setValue('selectedTemplate', templateId, { shouldValidate: true });
              }}
              error={!!errors.selectedTemplate}
              helperText={errors.selectedTemplate?.message}
            />
          </Card>
        </Grid>

        {/* Form Fields */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              }}
            >
              Video Configuration
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Recipe Selection */}
              <Grid item xs={12}>
                <RHFSelect 
                  name="recipe" 
                  label="Recipe" 
                  sx={FORM_INPUT_SX}
                  disabled={isLoadingRecipes}
                >
                  {isLoadingRecipes ? (
                    <MenuItem value="" disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading recipes...
                    </MenuItem>
                  ) : (
                    RECIPE_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                      >
                        {option.label}
                      </MenuItem>
                    ))
                  )}
                </RHFSelect>
              </Grid>

              {/* Manual Recipe Name - Show when "Other" is selected */}
              {selectedRecipe === 'other' && (
                <Grid item xs={12}>
                  <RHFTextField
                    name="recipeName"
                    label="Recipe Name"
                    placeholder="Enter recipe name"
                    sx={FORM_INPUT_SX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:book-outline" width={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              {/* Language */}
              <Grid item xs={12}>
                <RHFSelect name="language" label="Language" sx={FORM_INPUT_SX}>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <MenuItem
                      key={lang}
                      value={lang}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {lang}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Recipe Name Display (when recipe is selected) */}
              {selectedRecipe && selectedRecipe !== 'other' && (
                <Grid item xs={12}>
                  <RHFTextField
                    name="recipeName"
                    label="Recipe Name"
                    disabled
                    sx={FORM_INPUT_SX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:book-outline" width={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              {/* Introduction */}
              <Grid item xs={12}>
                <RHFTextField
                  name="introduction"
                  label="Introduction"
                  placeholder="Thank you Chef and thank you for logging in. In this video, we are going to break down a new recipe that has been added for our customer's enjoyments"
                  multiline
                  rows={4}
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              {/* Last Words */}
              <Grid item xs={12}>
                <RHFTextField
                  name="lastWords"
                  label="Last Words"
                  placeholder="Thank you for everything you do for us. We couldn't do what we do without your participation in our mission"
                  multiline
                  rows={4}
                  sx={FORM_INPUT_SX}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Ingredients and Steps */}
        <Grid item xs={12} lg={6}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Stack spacing={{ xs: 2, md: 3 }}>
              {/* Ingredients */}
              <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {isLoadingIngredients ? (
                  <SkeletonIngredientList title="Ingredients" count={3} />
                ) : (
                  <Controller
                    name="ingredients"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <SimpleIngredientList
                        items={field.value}
                        onChange={field.onChange}
                        title="Ingredients"
                        droppableId="video-ingredients"
                        placeholder="Enter ingredient name"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              </Card>

              {/* Steps */}
              <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {isLoadingSteps ? (
                  <SkeletonStepList title="Steps" count={3} />
                ) : (
                  <Controller
                    name="steps"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DynamicStepList
                        items={field.value}
                        onChange={field.onChange}
                        title="Steps"
                        droppableId="video-steps"
                        placeholder="Enter step description"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              </Card>
            </Stack>
          </DragDropContext>
        </Grid>

        {/* Information Message */}
        <Grid item xs={12}>
          <Alert
            severity="info"
            icon={<Iconify icon="eva:info-fill" width={20} />}
            sx={{
              '& .MuiAlert-message': {
                width: '100%',
              },
              '& .MuiAlert-icon': {
                alignSelf: 'flex-start',
                mt: 0.5,
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              <strong>Note:</strong> Video generation will take approximately 3-4 minutes. Please wait patiently and do not close this page. After 3-4 minutes, your video will be generated successfully and will appear in the video library.
            </Typography>
          </Alert>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(PATH_DASHBOARD.videoGeneration.library)}
              sx={{
                fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                fontWeight: 600,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting || generateVideoMutation.isPending}
              sx={{
                fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                fontWeight: 600,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              Generate Video
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

