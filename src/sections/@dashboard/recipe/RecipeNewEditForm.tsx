import { useEffect, useMemo, useCallback, useState } from 'react';
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
  TextField,
  Typography,
  MenuItem,
  Autocomplete,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  InputAdornment,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IRecipe, IIngredient, IPreparationStep, IComment } from '../../../@types/recipe';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
// services
import {
  useCreateRecipe,
  useUpdateRecipe,
  useMenuCategories,
  useAllPredefinedIngredients,
  useAllPredefinedStarch,
  useAllPredefinedVegetables,
  uploadFileWithPresignedUrl,
  generateFileKey,
} from '../../../services';
// sections
import { ImageUploadZone, VideoUploadZone, DynamicIngredientList, DynamicStepList } from './form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  dishName: string;
  cuisineType: string[];
  centerOfPlate: string;
  menuClass: string;
  preparationTime: number;
  preparationTimeUnit: string;
  menuPrice: number;
  costPerServing: number;
  station: string;
  youtubeUrl: string;
  restaurantLocation: string;
  caseCost: number;
  caseWeight: number;
  servingWeight: number;
  servingsInCase: number;
  foodCostWanted: number;
  description: string;
  tags: string[];
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  essentials: Array<{ name: string; quantity: number; unit: string }>;
  starchTitle: string;
  starchSteps: string[];
  predefinedStarch: number[]; // Array of IDs
  predefinedVegetable: number[]; // Array of IDs
  designYourPlate: string[];
  predefinedIngredients: number[]; // Array of IDs
  availability: string;
  cookingDeviationComments: string[];
  realtimeVariableComments: string[];
  status: string;
  images: string[];
  primaryImageIndex: number;
  fullyPlatedImageIndex: number;
  video: { url: string; name: string; type: 'preparation' | 'presentation' } | null;
};

type Props = {
  isEdit?: boolean;
  currentRecipe?: IRecipe;
};

// ----------------------------------------------------------------------

// Center of Plate options (from API documentation)
const CENTER_OF_PLATE_OPTIONS = [
  'Beans / Legumes',
  'Beef',
  'Breakfast Plate',
  'Cheese-Centric',
  'Chicken',
  'Combination (Mixed Proteins)',
  'Duck',
  'Egg-Based',
  'Grain-Based',
  'Lamb',
  'Other',
  'Pasta-Based',
  'Pizza / Flatbread',
  'Pork',
  'Rice-Based',
  'Sandwich / Wrap',
  'Seafood – Fish',
  'Seafood – Shellfish',
  'Soup / Stew',
  'Tofu / Plant-Based Protein',
  'Turkey',
  'Veal',
  'Vegetable-Centric',
];

// Menu Class options (subcategories)
const MENU_CLASS_OPTIONS = ['Commence', 'Soup', 'Salad', 'Appetizers', 'Main Course', 'Dessert', 'Side Dishes', 'Add On'];

// Station options (from API documentation)
const STATION_OPTIONS = [
  'Salads',
  'Cooking Station',
  'Frying Station',
  'Sauté Station',
  'Baking/Pastry Station',
  'Garnish Station',
  'Sauté',
  'Sauté1',
  'Sauté2',
  'Assembly Station',
  'Expediting Station (Expo)',
  'Dishwashing Station',
  'Storage Area (Dry/Wet Storage)',
  'Receiving Area',
  'Cleaning Station',
  'Grill Station',
  'Pizza Station',
  'Dessert',
].sort((a, b) => a.localeCompare(b)); // Sort alphabetically

const TIME_UNIT_OPTIONS = ['minutes', 'hours'];

export default function RecipeNewEditForm({ isEdit = false, currentRecipe }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // TanStack Query hooks
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const { data: menuCategories = [], isLoading: isLoadingCategories } = useMenuCategories();
  
  // Predefined items hooks
  const { data: predefinedIngredients = [], isLoading: isLoadingIngredients } = useAllPredefinedIngredients();
  const { data: predefinedStarch = [], isLoading: isLoadingStarch } = useAllPredefinedStarch();
  const { data: predefinedVegetables = [], isLoading: isLoadingVegetables } = useAllPredefinedVegetables();

  // Build cuisine options from API
  const cuisineOptions = useMemo(() => {
    return menuCategories
      .filter((category) => category.categoryName)
      .map((category) => category.categoryName);
  }, [menuCategories]);

  // Predefined items are already sorted and ready to use from hooks

  const NewRecipeSchema = Yup.object().shape({
    dishName: Yup.string().required('Dish name is required'),
    cuisineType: Yup.array().min(1, 'At least one cuisine type is required'),
    centerOfPlate: Yup.string().required('Center of plate is required'),
    menuClass: Yup.string().required('Menu class is required'),
    preparationTime: Yup.number().min(1, 'Preparation time must be at least 1').required('Preparation time is required'),
    menuPrice: Yup.number().min(0, 'Menu price must be positive').required('Menu price is required'),
    station: Yup.string().required('Station is required'),
    description: Yup.string().required('Description is required'),
  });

  const defaultValues = useMemo(
    () => ({
      dishName: currentRecipe?.dishName || '',
      cuisineType: currentRecipe?.cuisineType ? [currentRecipe.cuisineType] : [],
      centerOfPlate: currentRecipe?.plateDesign?.centerOfPlate?.category || '',
      menuClass: 'Commence',
      preparationTime: currentRecipe?.preparationTime || 30,
      preparationTimeUnit: 'minutes',
      menuPrice: currentRecipe?.costing?.salePrice || 0,
      costPerServing: currentRecipe?.costing?.costPerServing || 0,
      station: currentRecipe?.station || '',
      youtubeUrl: currentRecipe?.youtubeUrl || '',
      restaurantLocation: '',
      caseCost: currentRecipe?.costing?.caseCost || 0,
      caseWeight: currentRecipe?.costing?.caseWeightLb || 0,
      servingWeight: currentRecipe?.costing?.servingWeightOz || 0,
      servingsInCase: 16,
      foodCostWanted: currentRecipe?.costing?.foodCostPct || 20,
      description: currentRecipe?.description || '',
      tags: currentRecipe?.tags || [],
      ingredients: currentRecipe?.ingredients?.map(ing => ({ name: ing.title, quantity: ing.quantity, unit: ing.unit })) || [],
      essentials: currentRecipe?.essentialIngredients?.map(ing => ({ name: ing.title, quantity: ing.quantity, unit: ing.unit })) || [],
      starchTitle: currentRecipe?.starchPreparation?.type || '',
      starchSteps: currentRecipe?.starchPreparation?.steps?.map(step => step.description) || [],
      predefinedStarch: (currentRecipe as any)?.predefinedStarch?.map((item: any) => item.id) || [],
      predefinedVegetable: (currentRecipe as any)?.predefinedVegetables?.map((item: any) => item.id) || [],
      designYourPlate: currentRecipe?.plateDesign?.platingSteps?.map(step => step.description) || [],
      predefinedIngredients: (currentRecipe as any)?.predefinedIngredients?.map((item: any) => item.id) || [],
      availability: currentRecipe?.isAvailable ? 'available' : 'unavailable',
      cookingDeviationComments: currentRecipe?.cookingDeviationComments?.map(comment => comment.step) || [],
      realtimeVariableComments: currentRecipe?.realtimeVariableComments?.map(comment => comment.step) || [],
      status: currentRecipe?.status || 'draft',
      images: currentRecipe?.imageFiles || [],
      primaryImageIndex: 0,
      fullyPlatedImageIndex: -1,
      video: currentRecipe?.videoFile ? { url: currentRecipe.videoFile, name: 'video.mp4', type: 'preparation' as 'preparation' | 'presentation' } : null,
    }),
    [currentRecipe]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewRecipeSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentRecipe) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentRecipe, reset, defaultValues]);

  // Auto-calculate cost per serving
  useEffect(() => {
    const { caseCost, servingsInCase } = values;
    if (caseCost && servingsInCase) {
      const calculated = (caseCost / servingsInCase).toFixed(2);
      setValue('costPerServing', parseFloat(calculated));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.caseCost, values.servingsInCase, setValue]);

  // Transform form data to IRecipe format
  const transformFormDataToRecipe = useCallback((data: FormValuesProps): Partial<IRecipe> => {
    // Convert preparation time to minutes
    const preparationTimeInMinutes = data.preparationTimeUnit === 'hours' 
      ? data.preparationTime * 60 
      : data.preparationTime;

    // Get first cuisine type (API expects single value, not array)
    const cuisineType = data.cuisineType && data.cuisineType.length > 0 ? data.cuisineType[0] : '';

    // Transform ingredients
    const ingredients: IIngredient[] = data.ingredients.map((ing, index) => ({
      id: currentRecipe?.ingredients?.[index]?.id || String(Date.now() + index),
      title: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    }));

    // Transform essential ingredients
    const essentialIngredients: IIngredient[] = data.essentials.map((ess, index) => ({
      id: currentRecipe?.essentialIngredients?.[index]?.id || String(Date.now() + index + 1000),
      title: ess.name,
      quantity: ess.quantity,
      unit: ess.unit || '',
    }));

    // Transform preparation steps (use existing steps from recipe if editing, otherwise empty)
    const steps: IPreparationStep[] = currentRecipe?.steps || [];

    // Transform design your plate steps (plating steps)
    const platingSteps: IPreparationStep[] = (data.designYourPlate || []).map((step, index) => ({
      id: currentRecipe?.plateDesign?.platingSteps?.[index]?.id || String(Date.now() + index + 2000),
      stepNumber: index + 1,
      description: step,
    }));

    // Transform starch preparation steps
    const starchSteps: IPreparationStep[] = (data.starchSteps || []).map((step, index) => ({
      id: currentRecipe?.starchPreparation?.steps?.[index]?.id || String(Date.now() + index + 3000),
      stepNumber: index + 1,
      description: step,
    }));

    // Transform comments
    const cookingDeviationComments: IComment[] = (data.cookingDeviationComments || []).map((comment, index) => ({
      id: currentRecipe?.cookingDeviationComments?.[index]?.id || String(Date.now() + index + 4000),
      step: comment,
    }));

    const realtimeVariableComments: IComment[] = (data.realtimeVariableComments || []).map((comment, index) => ({
      id: currentRecipe?.realtimeVariableComments?.[index]?.id || String(Date.now() + index + 5000),
      step: comment,
    }));

    // Build recipe object
    const recipe: Partial<IRecipe> = {
      dishName: data.dishName,
      cuisineType,
      preparationTime: preparationTimeInMinutes,
      station: data.station,
      youtubeUrl: data.youtubeUrl,
      description: data.description,
      tags: data.tags || [],
      imageFiles: data.images || [],
      videoFile: data.video?.url || '',
      ingredients,
      essentialIngredients,
      steps,
      plateDesign: {
        centerOfPlate: {
          category: data.centerOfPlate,
          subcategory: data.menuClass,
        },
        platingSteps,
      },
      starchPreparation: {
        type: data.starchTitle || '',
        steps: starchSteps,
        cookingTime: preparationTimeInMinutes,
      },
      costing: {
        caseCost: typeof data.caseCost === 'number' ? data.caseCost : parseFloat(String(data.caseCost || 0)) || 0,
        caseWeightLb: typeof data.caseWeight === 'number' ? data.caseWeight : parseFloat(String(data.caseWeight || 0)) || 0,
        servingWeightOz: typeof data.servingWeight === 'number' ? data.servingWeight : parseFloat(String(data.servingWeight || 0)) || 0,
        costPerServing: typeof data.costPerServing === 'number' ? data.costPerServing : parseFloat(String(data.costPerServing || 0)) || 0,
        salePrice: typeof data.menuPrice === 'number' ? data.menuPrice : parseFloat(String(data.menuPrice || 0)) || 0,
        foodCostPct: typeof data.foodCostWanted === 'number' ? data.foodCostWanted : parseFloat(String(data.foodCostWanted || 0)) || 0,
      },
      status: data.status as 'draft' | 'active' | 'private' | 'archived',
      isAvailable: data.availability === 'available',
      isPublic: data.status === 'active',
      cookingDeviationComments,
      realtimeVariableComments,
    };

    // Add predefined items as arrays of IDs (for API)
    (recipe as any).predefinedIngredients = data.predefinedIngredients || [];
    (recipe as any).predefinedStarch = data.predefinedStarch || [];
    (recipe as any).predefinedVegetables = data.predefinedVegetable || [];

    return recipe;
  }, [currentRecipe]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // Step 1: Upload files to S3 using presigned URLs
      const uploadedImageUrls: string[] = [];
      let uploadedVideoUrl: string | null = null;
      let uploadedStarchImageUrl: string | null = null;
      let uploadedPlateImageUrl: string | null = null;

      // Upload recipe images
      if (imageFiles.length > 0) {
        enqueueSnackbar('Uploading images...', { variant: 'info' });
        for (const file of imageFiles) {
          const fileKey = generateFileKey('recipe_images', file.name);
          const s3Url = await uploadFileWithPresignedUrl(file, fileKey, file.type);
          uploadedImageUrls.push(s3Url);
        }
      }

      // Keep existing image URLs (from current recipe or already uploaded)
      const existingImageUrls = values.images.filter((url) => 
        url.startsWith('http') && !url.startsWith('blob:')
      );
      const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];

      // Upload video if new file selected
      if (videoFile) {
        enqueueSnackbar('Uploading video...', { variant: 'info' });
        const fileKey = generateFileKey('recipe_videos', videoFile.name);
        uploadedVideoUrl = await uploadFileWithPresignedUrl(videoFile, fileKey, videoFile.type);
      }

      // Upload starch preparation image if new file selected
      if (starchImageFile) {
        enqueueSnackbar('Uploading starch preparation image...', { variant: 'info' });
        const fileKey = generateFileKey('starch_preparation', starchImageFile.name);
        uploadedStarchImageUrl = await uploadFileWithPresignedUrl(starchImageFile, fileKey, starchImageFile.type);
      }

      // Upload plate design image if new file selected
      if (plateImageFile) {
        enqueueSnackbar('Uploading plate design image...', { variant: 'info' });
        const fileKey = generateFileKey('plate_design', plateImageFile.name);
        uploadedPlateImageUrl = await uploadFileWithPresignedUrl(plateImageFile, fileKey, plateImageFile.type);
      }

      // Step 2: Transform form data to recipe format
      const recipeData = transformFormDataToRecipe(data);

      // Step 3: Add uploaded URLs to recipe data
      if (allImageUrls.length > 0) {
        recipeData.imageFiles = allImageUrls;
      }
      if (uploadedVideoUrl) {
        recipeData.videoFile = uploadedVideoUrl;
      } else if (data.video?.url && data.video.url.startsWith('http') && !data.video.url.startsWith('blob:')) {
        // Keep existing video URL if it's already an S3 URL
        recipeData.videoFile = data.video.url;
      }

      // Add starch preparation image and plate design image
      if (uploadedStarchImageUrl) {
        (recipeData as any).starchPreparationImage = uploadedStarchImageUrl;
      }
      if (uploadedPlateImageUrl) {
        (recipeData as any).plateDesignImage = uploadedPlateImageUrl;
      }

      // Step 4: Handle draft status
      if (data.status === 'draft') {
        (recipeData as any).is_draft = true;
        (recipeData as any).is_schedule = false;
      } else {
        (recipeData as any).is_draft = false;
      }

      // Step 5: Create or update recipe
      if (isEdit && currentRecipe?.id) {
        // Update existing recipe
        await updateRecipeMutation.mutateAsync({
          id: currentRecipe.id,
          data: recipeData,
        });
        enqueueSnackbar('Recipe updated successfully!', { variant: 'success' });
      } else {
        // Create new recipe
        await createRecipeMutation.mutateAsync(recipeData);
        enqueueSnackbar('Recipe created successfully!', { variant: 'success' });
      }

      navigate(PATH_DASHBOARD.recipes.list);
    } catch (error) {
      console.error('Error saving recipe:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save recipe. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const onSaveDraft = async () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  // Store File objects separately for upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [starchImageFile, setStarchImageFile] = useState<File | null>(null);
  const [plateImageFile, setPlateImageFile] = useState<File | null>(null);

  const handleImageUpload = (files: File[]) => {
    // Store File objects for later upload
    setImageFiles((prev) => [...prev, ...files]);
    // Create preview URLs for display
    const urls = files.map((file) => URL.createObjectURL(file));
    setValue('images', [...values.images, ...urls]);
  };

  const handleImageRemove = (index: number) => {
    const newImages = values.images.filter((_, i) => i !== index);
    setValue('images', newImages);
    // Remove corresponding file
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    
    if (values.primaryImageIndex === index) {
      setValue('primaryImageIndex', 0);
    }
    if (values.fullyPlatedImageIndex === index) {
      setValue('fullyPlatedImageIndex', -1);
    }
  };

  const handleVideoUpload = (file: File) => {
    // Store File object for later upload
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setValue('video', { url, name: file.name, type: 'preparation' });
  };

  const handleVideoRemove = () => {
    setValue('video', null);
    setVideoFile(null);
  };

  const handleVideoTypeChange = (type: 'preparation' | 'presentation') => {
    if (values.video) {
      setValue('video', { ...values.video, type });
    }
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
      const reordered = Array.from(list);
      const [removed] = reordered.splice(startIndex, 1);
      reordered.splice(endIndex, 0, removed);
      return reordered;
    };

    if (source.droppableId === 'ingredients') {
      const reordered = reorder(values.ingredients, source.index, destination.index);
      setValue('ingredients', reordered);
    } else if (source.droppableId === 'essentials') {
      const reordered = reorder(values.essentials, source.index, destination.index);
      setValue('essentials', reordered);
    } else if (source.droppableId === 'starchSteps') {
      const reordered = reorder(values.starchSteps, source.index, destination.index);
      setValue('starchSteps', reordered);
    } else if (source.droppableId === 'designYourPlate') {
      const reordered = reorder(values.designYourPlate, source.index, destination.index);
      setValue('designYourPlate', reordered);
    } else if (source.droppableId === 'cookingDeviationComments') {
      const reordered = reorder(values.cookingDeviationComments, source.index, destination.index);
      setValue('cookingDeviationComments', reordered);
    } else if (source.droppableId === 'realtimeVariableComments') {
      const reordered = reorder(values.realtimeVariableComments, source.index, destination.index);
      setValue('realtimeVariableComments', reordered);
    }
  }, [values, setValue]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
        <Grid item xs={12}>
          {/* Image Upload Section */}
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Recipe Images
            </Typography>
            <Controller
              name="images"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <ImageUploadZone
                  images={field.value}
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  onSetPrimary={(index) => setValue('primaryImageIndex', index)}
                  onSetFullyPlated={(index) => setValue('fullyPlatedImageIndex', index)}
                  primaryIndex={values.primaryImageIndex}
                  fullyPlatedIndex={values.fullyPlatedImageIndex}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Video Upload Section */}
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Recipe Video
            </Typography>
            <Controller
              name="video"
              control={control}
              render={({ field, fieldState: { error } }) => (
                field.value ? (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Uploaded Video
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 2,
                      }}
                    >
                      <Card
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: theme.customShadows.z8,
                          '&:hover .video-actions': {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                          <video
                            src={field.value.url}
                            controls
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          >
                            <track kind="captions" />
                          </video>
                          {/* Video Type Badge */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              zIndex: 9,
                            }}
                          >
                            <Chip
                              label={field.value.type === 'preparation' ? 'Preparation & Plating' : 'Presentation & Selling'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                bgcolor: field.value.type === 'preparation' ? theme.palette.primary.main : theme.palette.success.main,
                                color: '#fff',
                              }}
                            />
                          </Box>
                          {/* Actions */}
                          <Box
                            className="video-actions"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              opacity: 0,
                              transition: theme.transitions.create('opacity'),
                              zIndex: 9,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={handleVideoRemove}
                              sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.9),
                                color: '#fff',
                                '&:hover': {
                                  bgcolor: theme.palette.error.main,
                                },
                              }}
                            >
                              <Iconify icon="eva:trash-2-outline" width={16} />
                            </IconButton>
                          </Box>
                        </Box>
                        {/* Video Info */}
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2 }}>
                          <Iconify icon="eva:video-fill" width={24} sx={{ color: theme.palette.primary.main }} />
                          <Typography variant="subtitle2" noWrap>
                            {field.value.name}
                          </Typography>
                        </Stack>
                      </Card>
                    </Box>
                  </Box>
                ) : (
                  <VideoUploadZone
                    video={field.value}
                    onUpload={handleVideoUpload}
                    onRemove={handleVideoRemove}
                    onTypeChange={handleVideoTypeChange}
                    error={!!error}
                    helperText={error?.message}
                  />
                )
              )}
            />
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Basic Information */}
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <RHFTextField name="dishName" label="Dish Name" />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="cuisineType"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={cuisineOptions}
                      loading={isLoadingCategories}
                      value={field.value}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            label={option}
                            size="small"
                            sx={{
                              bgcolor: value.length > 1 ? alpha(theme.palette.warning.main, 0.16) : undefined,
                              color: value.length > 1 ? theme.palette.warning.main : undefined,
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cuisine Type"
                          error={!!error}
                          helperText={
                            error?.message || (field.value.length > 1 && '✨ Fusion Dish')
                          }
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFSelect name="centerOfPlate" label="Center of Plate">
                  {CENTER_OF_PLATE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFSelect name="menuClass" label="Menu Class">
                  {MENU_CLASS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="preparationTime"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Preparation Time"
                      type="number"
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Controller
                              name="preparationTimeUnit"
                              control={control}
                              render={({ field: unitField }) => (
                                <TextField
                                  {...unitField}
                                  select
                                  size="small"
                                  sx={{ width: 100, '& fieldset': { border: 'none' } }}
                                >
                                  {TIME_UNIT_OPTIONS.map((unit) => (
                                    <MenuItem key={unit} value={unit}>
                                      {unit}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField
                  name="menuPrice"
                  label="Menu Price"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField
                  name="costPerServing"
                  label="Cost Per Serving"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    readOnly: true,
                  }}
                  helperText="Auto-calculated from ingredients"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFSelect name="station" label="Station to Prepare Dish">
                  {STATION_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField
                  name="youtubeUrl"
                  label="Youtube URL"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Iconify icon="mdi:youtube" width={24} sx={{ color: '#FF0000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Food Cost Calculator */}
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Food Cost Calculator
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="caseCost"
                  label="Cost of Case"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="caseWeight"
                  label="Case Weight (lbs)"
                  type="number"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="servingWeight"
                  label="Serving Weight (oz)"
                  type="number"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="servingsInCase"
                  label="Servings in Case"
                  type="number"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cost per Serving"
                  value={`$${values.costPerServing.toFixed(2)}`}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      fontWeight: 700,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField
                  name="foodCostWanted"
                  label="Margin per Serving (%)"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Suggested Menu Price"
                  value={`$${((values.costPerServing / (values.foodCostWanted / 100)) || 0).toFixed(2)}`}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      fontWeight: 700,
                    },
                  }}
                  helperText="Based on desired margin"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Description & Tags */}
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Description & Tags
            </Typography>

            <Stack spacing={3}>
              <RHFTextField
                name="description"
                label="Description"
                multiline
                rows={4}
              />

              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    freeSolo
                    options={[]}
                    value={field.value}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          label={option}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.16),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Tags" placeholder="Add tags" />
                    )}
                  />
                )}
              />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Ingredients & Essentials */}
          <Card sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Controller
                  name="ingredients"
                  control={control}
                  render={({ field }) => (
                    <DynamicIngredientList
                      title="Ingredients"
                      items={field.value}
                      onChange={field.onChange}
                      droppableId="ingredients"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="essentials"
                  control={control}
                  render={({ field }) => (
                    <DynamicIngredientList
                      title="Essentials Needed"
                      items={field.value}
                      onChange={field.onChange}
                      droppableId="essentials"
                      showUnit={false}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Preparation Steps */}
          <Card sx={{ p: 4 }}>
            <Controller
              name="starchSteps"
              control={control}
              render={({ field }) => (
                <DynamicStepList
                  title="Starch Preparation"
                  items={field.value}
                  onChange={field.onChange}
                  droppableId="starchSteps"
                  placeholder="Enter preparation step"
                  showUploadImage
                />
              )}
            />

            <Divider sx={{ my: 4 }} />

            <Controller
              name="designYourPlate"
              control={control}
              render={({ field }) => (
                <DynamicStepList
                  title="Design Your Plate"
                  items={field.value}
                  onChange={field.onChange}
                  droppableId="designYourPlate"
                  placeholder="Enter plating instruction"
                  showUploadImage
                />
              )}
            />
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Predefined Selections */}
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Predefined Items
            </Typography>

            <Stack spacing={3}>
              <Controller
                name="predefinedStarch"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    multiple
                    options={predefinedStarch}
                    getOptionLabel={(option: { id: number; name: string }) => option.name || ''}
                    isOptionEqualToValue={(option: { id: number; name: string }, value: { id: number; name: string }) =>
                      option.id === value.id
                    }
                    value={predefinedStarch.filter((item: { id: number; name: string }) =>
                      field.value.includes(item.id)
                    )}
                    onChange={(_, newValue: { id: number; name: string }[]) => {
                      field.onChange(newValue.map((item: { id: number; name: string }) => item.id));
                    }}
                    loading={isLoadingStarch}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip {...getTagProps({ index })} label={option.name} size="small" />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Predefined Starch"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />

              <Controller
                name="predefinedVegetable"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    multiple
                    options={predefinedVegetables}
                    getOptionLabel={(option: { id: number; name: string }) => option.name || ''}
                    isOptionEqualToValue={(option: { id: number; name: string }, value: { id: number; name: string }) =>
                      option.id === value.id
                    }
                    value={predefinedVegetables.filter((item: { id: number; name: string }) =>
                      field.value.includes(item.id)
                    )}
                    onChange={(_, newValue: { id: number; name: string }[]) => {
                      field.onChange(newValue.map((item: { id: number; name: string }) => item.id));
                    }}
                    loading={isLoadingVegetables}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip {...getTagProps({ index })} label={option.name} size="small" />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Predefined Vegetable"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />

              <Controller
                name="predefinedIngredients"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    multiple
                    options={predefinedIngredients}
                    getOptionLabel={(option: { id: number; name: string }) => option.name || ''}
                    isOptionEqualToValue={(option: { id: number; name: string }, value: { id: number; name: string }) =>
                      option.id === value.id
                    }
                    value={predefinedIngredients.filter((item: { id: number; name: string }) =>
                      field.value.includes(item.id)
                    )}
                    onChange={(_, newValue: { id: number; name: string }[]) => {
                      field.onChange(newValue.map((item: { id: number; name: string }) => item.id));
                    }}
                    loading={isLoadingIngredients}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip {...getTagProps({ index })} label={option.name} size="small" />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Predefined Ingredients"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Comments & Status */}
          <Card sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="cookingDeviationComments"
                  control={control}
                  render={({ field }) => (
                    <DynamicStepList
                      title="Cooking Deviation Comments"
                      items={field.value}
                      onChange={field.onChange}
                      droppableId="cookingDeviationComments"
                      placeholder="Enter comment"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="realtimeVariableComments"
                  control={control}
                  render={({ field }) => (
                    <DynamicStepList
                      title="Real-time Variable Comments"
                      items={field.value}
                      onChange={field.onChange}
                      droppableId="realtimeVariableComments"
                      placeholder="Enter comment"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1 }}>
                    Availability
                  </FormLabel>
                  <Controller
                    name="availability"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel value="available" control={<Radio />} label="Available" />
                        <FormControlLabel value="low" control={<Radio />} label="Low Stock" />
                        <FormControlLabel value="out" control={<Radio />} label="Out of Stock" />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1 }}>
                    Status
                  </FormLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel value="draft" control={<Radio />} label="Draft" />
                        <FormControlLabel value="active" control={<Radio />} label="Active" />
                        <FormControlLabel value="archived" control={<Radio />} label="Archived" />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(PATH_DASHBOARD.recipes.list)}
            >
              Cancel
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => reset()}
            >
              Clear
            </Button>

            <LoadingButton
              variant="outlined"
              size="large"
              loading={isSubmitting}
              onClick={onSaveDraft}
            >
              Save as Draft
            </LoadingButton>

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting || createRecipeMutation.isPending || updateRecipeMutation.isPending}
            >
              {isEdit ? 'Update Recipe' : 'Create Recipe'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
    </DragDropContext>
  );
}
