import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { IRecipe } from '../../../@types/recipe';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
// sections
import { ImageUploadZone, VideoUploadZone, SingleImageUpload, DynamicIngredientList, DynamicStepList } from './form';
// validation
import RecipeValidationSchema from './RecipeValidation';

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
  starchImage: string | null;
  predefinedStarch: string[];
  predefinedVegetable: string[];
  designYourPlate: string[];
  designYourPlateImage: string | null;
  predefinedIngredients: string[];
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

const CUISINE_OPTIONS = ['Italian', 'Chinese', 'French', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Mediterranean', 'African', 'American'];
const CENTER_OF_PLATE_OPTIONS = ['Beans / Legumes', 'Beef', 'Pork', 'Chicken', 'Seafood', 'Lamb', 'Vegetable'];
const MENU_CLASS_OPTIONS = ['Commence', 'Appetizer', 'Main Course', 'Dessert', 'Side Dish'];
const STATION_OPTIONS = ['Baking/Pastry Station', 'Grill Station', 'Sauté Station', 'Fry Station', 'Cold Station'];
const TIME_UNIT_OPTIONS = ['minutes', 'hours'];
const PREDEFINED_STARCH = ['Bread Basket / Artisan Rolls', 'Bread Pudding (savory)', 'Arroz con Gandules', 'Brown Rice'];
const PREDEFINED_VEGETABLE = ['Acorn Squash (roasted, stuffed)', 'Artichokes (braised, grilled, fried)', 'Beets (roasted, pickled, puréed)', 'Asparagus'];
const PREDEFINED_INGREDIENTS = ['Bisque (shellfish)', 'Beef Stock', 'Blue Cheese Dressing', 'Beurre Blanc'];

// Consistent Form Styling System
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

export default function RecipeNewEditForm({ isEdit = false, currentRecipe }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

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
      starchTitle: '',
      starchSteps: [],
      starchImage: null,
      predefinedStarch: [],
      predefinedVegetable: [],
      designYourPlate: [],
      designYourPlateImage: null,
      predefinedIngredients: [],
      availability: 'available',
      cookingDeviationComments: [],
      realtimeVariableComments: [],
      status: 'draft',
      images: currentRecipe?.imageFiles || [],
      primaryImageIndex: 0,
      fullyPlatedImageIndex: -1,
      video: currentRecipe?.videoFile ? { url: currentRecipe.videoFile, name: 'video.mp4', type: 'preparation' as 'preparation' | 'presentation' } : null,
    }),
    [currentRecipe]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RecipeValidationSchema),
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

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('DATA', data);
      enqueueSnackbar(!isEdit ? 'Recipe created!' : 'Recipe updated!');
      navigate(PATH_DASHBOARD.recipes.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  };

  const onSaveDraft = async () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handleImageUpload = (files: File[]) => {
    // Handle file upload logic here
    const urls = files.map((file) => URL.createObjectURL(file));
    setValue('images', [...values.images, ...urls]);
  };

  const handleImageRemove = (index: number) => {
    const newImages = values.images.filter((_, i) => i !== index);
    setValue('images', newImages);
    
    if (values.primaryImageIndex === index) {
      setValue('primaryImageIndex', 0);
    }
    if (values.fullyPlatedImageIndex === index) {
      setValue('fullyPlatedImageIndex', -1);
    }
  };

  const handleVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setValue('video', { url, name: file.name, type: 'preparation' });
  };

  const handleVideoRemove = () => {
    setValue('video', null);
  };

  const handleVideoTypeChange = (type: 'preparation' | 'presentation') => {
    if (values.video) {
      setValue('video', { ...values.video, type });
    }
  };

  const handleStarchImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setValue('starchImage', url);
  };

  const handleStarchImageRemove = () => {
    setValue('starchImage', null);
  };

  const handleDesignYourPlateImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setValue('designYourPlateImage', url);
  };

  const handleDesignYourPlateImageRemove = () => {
    setValue('designYourPlateImage', null);
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
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        <Grid item xs={12}>
          {/* Image Upload Section */}
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
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
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
              Recipe Video
            </Typography>
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
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Basic Information */}
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
              Basic Information
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField name="dishName" label="Dish Name" sx={FORM_INPUT_SX} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="cuisineType"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={CUISINE_OPTIONS}
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
                              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
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
                          sx={FORM_INPUT_SX}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="centerOfPlate" label="Center of Plate" sx={FORM_INPUT_SX}>
                  {CENTER_OF_PLATE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="menuClass" label="Menu Class" sx={FORM_INPUT_SX}>
                  {MENU_CLASS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
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
                      sx={FORM_INPUT_SX}
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
                                  sx={{ 
                                    width: { xs: 80, md: 100 }, 
                                    '& fieldset': { border: 'none' },
                                    ...FORM_INPUT_SX,
                                  }}
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

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="menuPrice"
                  label="Menu Price"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={FORM_INPUT_SX}
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
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFSelect name="station" label="Station to Prepare Dish" sx={FORM_INPUT_SX}>
                  {STATION_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="youtubeUrl"
                  label="Youtube URL"
                  sx={FORM_INPUT_SX}
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
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
              Food Cost Calculator
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="caseCost"
                  label="Cost of Case"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="caseWeight"
                  label="Case Weight (lbs)"
                  type="number"
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="servingWeight"
                  label="Serving Weight (oz)"
                  type="number"
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="servingsInCase"
                  label="Servings in Case"
                  type="number"
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Cost per Serving"
                  value={`$${values.costPerServing.toFixed(2)}`}
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      fontWeight: 700,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="foodCostWanted"
                  label="Margin per Serving (%)"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Suggested Menu Price"
                  value={`$${((values.costPerServing / (values.foodCostWanted / 100)) || 0).toFixed(2)}`}
                  sx={FORM_INPUT_SX}
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
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
              Description & Tags
            </Typography>

            <Stack spacing={{ xs: 2, md: 3 }}>
              <RHFTextField
                name="description"
                label="Description"
                multiline
                rows={4}
                sx={FORM_INPUT_SX}
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
                            fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Tags" placeholder="Add tags" sx={FORM_INPUT_SX} />
                    )}
                  />
                )}
              />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Ingredients & Essentials */}
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container spacing={{ xs: 2, md: 4 }}>
              <Grid item xs={12} md={7} lg={8}>
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

              <Grid item xs={12} md={5} lg={4}>
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
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
                />
              )}
            />

            {/* Starch Preparation Image */}
            <Box sx={{ mt: { xs: 3, md: 4 } }}>
              <Typography variant="subtitle2" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
                Starch Preparation Image
              </Typography>
              <Controller
                name="starchImage"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SingleImageUpload
                    image={field.value}
                    onUpload={handleStarchImageUpload}
                    onRemove={handleStarchImageRemove}
                    label="Upload Starch Preparation Image"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>

            <Divider sx={{ my: { xs: 3, md: 4 } }} />

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
                />
              )}
            />

            {/* Design Your Plate Image */}
            <Box sx={{ mt: { xs: 3, md: 4 } }}>
              <Typography variant="subtitle2" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
                Design Your Plate Image
              </Typography>
              <Controller
                name="designYourPlateImage"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SingleImageUpload
                    image={field.value}
                    onUpload={handleDesignYourPlateImageUpload}
                    onRemove={handleDesignYourPlateImageRemove}
                    label="Upload Design Your Plate Image"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Predefined Selections */}
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
              Predefined Items
            </Typography>

            <Stack spacing={{ xs: 2, md: 3 }}>
              <Controller
                name="predefinedStarch"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={PREDEFINED_STARCH}
                    value={field.value}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip 
                          {...getTagProps({ index })} 
                          label={option} 
                          size="small"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Predefined Starch" sx={FORM_INPUT_SX} />
                    )}
                  />
                )}
              />

              <Controller
                name="predefinedVegetable"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={PREDEFINED_VEGETABLE}
                    value={field.value}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip 
                          {...getTagProps({ index })} 
                          label={option} 
                          size="small"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Predefined Vegetable" sx={FORM_INPUT_SX} />
                    )}
                  />
                )}
              />

              <Controller
                name="predefinedIngredients"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={PREDEFINED_INGREDIENTS}
                    value={field.value}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip 
                          {...getTagProps({ index })} 
                          label={option} 
                          size="small"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Predefined Ingredients" sx={FORM_INPUT_SX} />
                    )}
                  />
                )}
              />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Comments & Status */}
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container spacing={4}>
              <Grid item xs={12} lg={6}>
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

              <Grid item xs={12} lg={6}>
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

            <Divider sx={{ my: { xs: 3, md: 4 } }} />

            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <FormLabel 
                    component="legend" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: { xs: 1, md: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                      color: 'text.primary',
                    }}
                  >
                    Availability
                  </FormLabel>
                  <Controller
                    name="availability"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel 
                          value="available" 
                          control={<Radio size="small" />} 
                          label="Available"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel 
                          value="low" 
                          control={<Radio size="small" />} 
                          label="Low Stock"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel 
                          value="out" 
                          control={<Radio size="small" />} 
                          label="Out of Stock"
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

              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <FormLabel 
                    component="legend" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: { xs: 1, md: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                      color: 'text.primary',
                    }}
                  >
                    Status
                  </FormLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel 
                          value="draft" 
                          control={<Radio size="small" />} 
                          label="Draft"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel 
                          value="active" 
                          control={<Radio size="small" />} 
                          label="Active"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel 
                          value="archived" 
                          control={<Radio size="small" />} 
                          label="Archived"
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
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="flex-end"
            sx={{ mt: { xs: 2, md: 3 } }}
          >
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(PATH_DASHBOARD.recipes.list)}
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

            <LoadingButton
              variant="outlined"
              size="large"
              loading={isSubmitting}
              onClick={onSaveDraft}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
            >
              Save as Draft
            </LoadingButton>

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
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
