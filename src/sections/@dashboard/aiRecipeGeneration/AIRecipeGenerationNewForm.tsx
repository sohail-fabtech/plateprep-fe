import { useMemo, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Autocomplete,
  Slider,
  FormHelperText,
  useTheme,
  alpha,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import { ProcessingDialog } from '../../../components/processing-dialog';
// constants
import { MENU_CLASS_OPTIONS } from '../../../constants/menuClasses';
import { TARGET_AUDIENCE_OPTIONS } from '../../../constants/targetAudience';
// services
import { useMenuCategories, useGenerateAIRecipe } from '../../../services';
// validation
import { AIRecipeGenerationValidationSchema, AIRecipeGenerationFormValues } from './AIRecipeGenerationValidation';

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

type Props = {
  // No props needed for now
};

// ----------------------------------------------------------------------

export default function AIRecipeGenerationNewForm({}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Fetch menu categories for cuisine type
  const { data: menuCategories = [], isLoading: isLoadingCategories } = useMenuCategories();

  // Generate AI recipe mutation
  const generateAIRecipeMutation = useGenerateAIRecipe();

  // Build cuisine options from API
  const cuisineOptions = useMemo(() => {
    return menuCategories
      .filter((category) => category.categoryName)
      .map((category) => category.categoryName);
  }, [menuCategories]);

  const defaultValues: AIRecipeGenerationFormValues = {
    cuisine_style: '',
    menu_class: '',
    seasonalIngredients: '',
    dietary_preferences: '',
    dietary_restrictions: '',
    available_ingredients: '',
    price_range: 0,
    target_audience: '',
    theme: '',
    status: 'not_started',
    priority: 'normal',
  };

  const methods = useForm<AIRecipeGenerationFormValues>({
    resolver: yupResolver(AIRecipeGenerationValidationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const priceRange = watch('price_range');

  // Processing dialog state
  const [processingDialog, setProcessingDialog] = useState<{
    open: boolean;
    state: 'processing' | 'success' | 'error';
    message: string;
  }>({
    open: false,
    state: 'processing',
    message: '',
  });

  // Restore form data from location state if available (when navigating back from preview)
  useEffect(() => {
    const state = location.state as { formData?: AIRecipeGenerationFormValues } | null;
    if (state?.formData) {
      reset(state.formData);
    }
  }, [location.state, reset]);

  const onSubmit = async (data: AIRecipeGenerationFormValues) => {
    // Show processing dialog
    setProcessingDialog({
      open: true,
      state: 'processing',
      message: 'Generating AI recipe...',
    });

    try {
      // Convert available_ingredients string to array (comma-separated)
      const availableIngredientsArray = data.available_ingredients
        .split(',')
        .map((ing) => ing.trim())
        .filter((ing) => ing.length > 0);

      const apiPayload = {
        cuisine_style: data.cuisine_style,
        menu_class: data.menu_class,
        seasonalIngredients: data.seasonalIngredients,
        dietary_preferences: data.dietary_preferences || '',
        theme: data.theme || '',
        available_ingredients: availableIngredientsArray,
        price_range: data.price_range,
        target_audience: data.target_audience,
        dietary_restrictions: data.dietary_restrictions,
        status: data.status || 'not_started',
        priority: data.priority || 'normal',
      };

      setProcessingDialog({
        open: true,
        state: 'processing',
        message: 'Generating AI recipe...',
      });

      const response = await generateAIRecipeMutation.mutateAsync(apiPayload);

      setProcessingDialog({
        open: true,
        state: 'success',
        message: 'AI recipe generated successfully!',
      });

      // Navigate to preview page with API response and form data after a short delay
      setTimeout(() => {
        navigate(PATH_DASHBOARD.recipes.previewAI, {
          state: {
            apiResponse: response,
            formData: data,
          },
        });
      }, 1500);
    } catch (error: any) {
      console.error('Error generating AI recipe:', error);
      const errorMessage = error?.message || 'Failed to generate AI recipe. Please try again.';
      setProcessingDialog({
        open: true,
        state: 'error',
        message: errorMessage,
      });
    }
  };

  return (
    <>
      <ProcessingDialog
        open={processingDialog.open}
        state={processingDialog.state}
        message={processingDialog.message}
        onClose={() => setProcessingDialog({ open: false, state: 'processing', message: '' })}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          AI Recipe Generation
        </Typography>

        <Grid container spacing={3}>
          {/* Column 1 (Left) */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Cuisine Type */}
              <Controller
                name="cuisine_style"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    options={cuisineOptions}
                    loading={isLoadingCategories}
                    value={field.value || null}
                    onChange={(_, newValue) => field.onChange(newValue || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cuisine Type *"
                        error={!!error}
                        helperText={error?.message}
                        sx={FORM_INPUT_SX}
                      />
                    )}
                  />
                )}
              />

              {/* Dietary Preferences */}
              <RHFTextField
                name="dietary_preferences"
                label="Dietary Preferences"
                sx={FORM_INPUT_SX}
              />

              {/* Dietary Restrictions */}
              <RHFTextField
                name="dietary_restrictions"
                label="Dietary Restrictions *"
                sx={FORM_INPUT_SX}
              />
            </Stack>
          </Grid>

          {/* Column 2 (Middle) */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Menu Class */}
              <RHFSelect name="menu_class" label="Menu Class *" sx={FORM_INPUT_SX}>
                {MENU_CLASS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </RHFSelect>

              {/* Target Audience */}
              <RHFSelect name="target_audience" label="Target Audience *" sx={FORM_INPUT_SX}>
                {TARGET_AUDIENCE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>
          </Grid>

          {/* Column 3 (Right) */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Seasonal Ingredients */}
              <RHFTextField
                name="seasonalIngredients"
                label="Seasonal Ingredients *"
                multiline
                rows={3}
                sx={FORM_INPUT_SX}
              />

              {/* Available Ingredients */}
              <RHFTextField
                name="available_ingredients"
                label="Available Ingredients *"
                placeholder="Enter ingredients separated by commas"
                multiline
                rows={3}
                helperText="Enter ingredients separated by commas"
                sx={FORM_INPUT_SX}
              />
            </Stack>
          </Grid>
        </Grid>

        {/* Menu Price Slider - At the bottom, before Generate button */}
        <Box sx={{ mt: 4, width: { xs: '100%', md: 'auto' }, maxWidth: { md: 300 } }}>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              fontWeight: 500,
            }}
          >
            Menu Price *
          </Typography>
          <Controller
            name="price_range"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Box>
                <Slider
                  {...field}
                  value={typeof field.value === 'number' ? field.value : 0}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  min={0}
                  max={100}
                  step={1}
                  marks={[
                    { value: 0, label: '$0' },
                    { value: 100, label: '$100' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                    },
                    '& .MuiSlider-track': {
                      height: 6,
                    },
                    '& .MuiSlider-rail': {
                      height: 6,
                    },
                  }}
                />
                {error && (
                  <FormHelperText error sx={{ mt: 0.5, mx: 0 }}>
                    {error.message}
                  </FormHelperText>
                )}
              </Box>
            )}
          />
        </Box>

        {/* Generate Button - At the bottom, right side */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            sx={{
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              fontWeight: 600,
              height: { xs: 48, md: 52 },
              minWidth: { xs: 200, md: 240 },
            }}
          >
            Generate
          </LoadingButton>
        </Box>
        </Card>
      </FormProvider>
    </>
  );
}

