import { useEffect, useMemo, useRef } from 'react';
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
  Autocomplete,
  Chip,
  InputAdornment,
  useTheme,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IWineInventory, IWineInventoryForm } from '../../../@types/wineInventory';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import BranchSelect from '../../../components/branch-select/BranchSelect';
// hooks
import { useBranchForm } from '../../../hooks/useBranchForm';
import {
  useCreateWineInventory,
  useUpdateWineInventory,
} from '../../../services/wineInventory/wineInventoryHooks';
// validation
import WineInventoryValidationSchema from './WineInventoryValidation';
// sections
import { SingleImageUpload } from '../recipe/form';
// assets
import { countries } from '../../../assets/data';
// constants
import {
  WINE_TYPE_OPTIONS,
  WINE_PROFILE_OPTIONS,
  REGION_OPTIONS,
} from '../../../constants/wineInventoryOptions';

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
  currentWine?: IWineInventory;
};

// ----------------------------------------------------------------------

const BOTTLE_SIZE_LABELS = {
  '187.5': 'Split / Piccolo (187.5ml)',
  '375': 'Demi / Half (375ml)',
  '750': 'Standard (750ml)',
  '1500': 'Magnum (1.5L)',
  '3000': 'Jeroboam (3L)',
};

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

export default function WineInventoryNewEditForm({ isEdit = false, currentWine }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Branch form hook
  const { branchIdForApi, showBranchSelect, initialBranchId } = useBranchForm(
    currentWine?.locationId ? String(currentWine.locationId) : ''
  );

  const defaultValues = useMemo<IWineInventoryForm>(() => {
    // Check if region is in standard options, otherwise set to "Other"
    const region = currentWine?.region || '';
    const isCustomRegion = region && !REGION_OPTIONS.includes(region);

    return {
      wineName: currentWine?.wineName || '',
      producer: currentWine?.producer || null,
      vintage: currentWine?.vintage || null,
      country: currentWine?.country || '',
      region: isCustomRegion ? 'Other' : region || '',
      regionOther: isCustomRegion ? region : null,
      description: currentWine?.description || null,
      image: currentWine?.imageUrl || null,
      wineType: currentWine?.wineType || 'Red',
      wineProfile: currentWine?.wineProfile || 'Dry – Ripe Fruits & Spices',
      tags: currentWine?.tags || [],
      inventory: currentWine?.inventory
        ? {
            '187.5': currentWine.inventory['187.5'] ?? null,
            '375': currentWine.inventory['375'] ?? null,
            '750': currentWine.inventory['750'] ?? null,
            '1500': currentWine.inventory['1500'] ?? null,
            '3000': currentWine.inventory['3000'] ?? null,
          }
        : {
            '187.5': null,
            '375': null,
            '750': null,
            '1500': null,
            '3000': null,
          },
      minStockLevel: currentWine?.minStockLevel || 0,
      maxStockLevel: currentWine?.maxStockLevel || 0,
      stock: currentWine?.totalStock || 0,
      purchasePrice: currentWine?.purchasePrice || null,
      supplierName: currentWine?.supplierName || null,
      locationId: initialBranchId ? String(initialBranchId) : currentWine?.locationId || '',
    };
  }, [currentWine, initialBranchId]);

  const methods = useForm<IWineInventoryForm>({
    resolver: yupResolver(WineInventoryValidationSchema),
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
  const imageFileRef = useRef<File | null>(null);

  const { mutateAsync: createWineInventory, isPending: isCreating } = useCreateWineInventory();
  const { mutateAsync: updateWineInventory, isPending: isUpdating } = useUpdateWineInventory();

  useEffect(() => {
    if (isEdit && currentWine) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentWine, reset, defaultValues]);

  // Set locationId for non-owners when field is not shown
  useEffect(() => {
    if (!showBranchSelect && branchIdForApi) {
      setValue('locationId', String(branchIdForApi));
    }
  }, [showBranchSelect, branchIdForApi, setValue]);

  const onSubmit = async (data: IWineInventoryForm) => {
    try {
      // Determine location ID - use branchIdForApi from hook if available, otherwise use form value
      let locationIdForApi: number | null = null;
      if (branchIdForApi) {
        locationIdForApi = branchIdForApi;
      } else if (data.locationId) {
        const locationValue =
          typeof data.locationId === 'string' && /^\d+$/.test(data.locationId)
            ? parseInt(data.locationId, 10)
            : typeof data.locationId === 'number'
            ? data.locationId
            : null;
        locationIdForApi = locationValue;
      }

      const regionValue = data.region === 'Other' ? data.regionOther || '' : data.region;

      const inventory = {
        '187.5': data.inventory['187.5'] || 0,
        '375': data.inventory['375'] || 0,
        '750': data.inventory['750'] || 0,
        '1500': data.inventory['1500'] || 0,
        '3000': data.inventory['3000'] || 0,
      };

      // Transform to API payload format
      const apiPayload = {
        wine_name: data.wineName,
        producer: data.producer || null,
        vintage: data.vintage || null,
        country: data.country,
        region: regionValue,
        wine_type: data.wineType,
        wine_profile: data.wineProfile,
        description: data.description || null,
        tags: data.tags,
        inventory,
        stock: data.stock || 0,
        min_stock_level: data.minStockLevel,
        max_stock_level: data.maxStockLevel,
        purchase_price: data.purchasePrice || null,
        supplier_name: data.supplierName || null,
        branch: locationIdForApi,
      };

      if (isEdit && currentWine?.id) {
        await updateWineInventory({
          id: currentWine.id,
          data: apiPayload,
          imageFile: imageFileRef.current,
        });
        enqueueSnackbar('Wine updated successfully!');
      } else {
        await createWineInventory({
          data: apiPayload,
          imageFile: imageFileRef.current,
        });
        enqueueSnackbar('Wine created successfully!');
      }

      navigate(PATH_DASHBOARD.wineInventory.list);
    } catch (error) {
      console.error(error);
      const message =
        (error as any)?.response?.data?.detail ||
        (error as any)?.response?.data?.message ||
        (error as Error)?.message ||
        'Something went wrong!';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    imageFileRef.current = file;
    setValue('image', url);
  };

  const handleImageRemove = () => {
    imageFileRef.current = null;
    setValue('image', null);
  };

  // Check if "Other" is selected for region
  const isRegionOther = values.region === 'Other';

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Basic Wine Information */}
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
              Basic Wine Information
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Wine Name */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="wineName"
                  label="Wine Name"
                  placeholder="e.g., Cabernet Sauvignon"
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              {/* Producer / Winery */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="producer"
                  label="Producer / Winery"
                  placeholder="e.g., Silver Oak"
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              {/* Vintage */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="vintage"
                  label="Vintage"
                  type="number"
                  placeholder="e.g., 2019"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    inputProps: { min: 1900, max: new Date().getFullYear() + 1 },
                  }}
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="country" label="Country" sx={FORM_INPUT_SX}>
                  {countries.map((country) => (
                    <MenuItem
                      key={country.code}
                      value={country.label}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {country.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Region */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="region" label="Region" sx={FORM_INPUT_SX}>
                  {REGION_OPTIONS.map((option) => (
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

              {/* Region Other - Conditional */}
              {isRegionOther && (
                <Grid item xs={12} sm={6} md={4}>
                  <RHFTextField
                    name="regionOther"
                    label="Specify Region"
                    placeholder="Enter custom region"
                    sx={FORM_INPUT_SX}
                  />
                </Grid>
              )}

              {/* Description */}
              <Grid item xs={12}>
                <RHFTextField
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  placeholder="Enter wine description, tasting notes, or additional information..."
                  sx={FORM_INPUT_SX}
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Controller
                  name="image"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <SingleImageUpload
                      image={field.value}
                      onUpload={handleImageUpload}
                      onRemove={handleImageRemove}
                      label="Upload Wine Image"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Classification */}
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
              Classification
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Wine Type */}
              <Grid item xs={12} sm={6}>
                <RHFSelect name="wineType" label="Wine Type" sx={FORM_INPUT_SX}>
                  {WINE_TYPE_OPTIONS.map((option) => (
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

              {/* Wine Profile */}
              <Grid item xs={12} sm={6}>
                <RHFSelect name="wineProfile" label="Wine Profile" sx={FORM_INPUT_SX}>
                  {WINE_PROFILE_OPTIONS.map((option) => (
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
            </Grid>
          </Card>
        </Grid>

        {/* Tags */}
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
              Tags
            </Typography>

            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={[
                    'House Favorite',
                    'By the Glass',
                    'Popular',
                    'Premium',
                    'Special Occasion',
                    'Celebration',
                    'Dessert Wine',
                    'Seasonal',
                  ]}
                  value={field.value || []}
                  onChange={(_, newValue) => {
                    setValue('tags', newValue);
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        size="small"
                        sx={{
                          fontSize: { xs: '0.75rem', md: '0.8125rem' },
                          height: { xs: 24, md: 28 },
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Add tags (e.g., House Favorite, By the Glass)"
                      sx={FORM_INPUT_SX}
                    />
                  )}
                />
              )}
            />
          </Card>
        </Grid>

        {/* Inventory - Bottle Sizes & Stock */}
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
              Inventory – Bottle Sizes & Stock
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {Object.entries(BOTTLE_SIZE_LABELS).map(([size, label]) => (
                <Grid item xs={12} sm={6} md={4} key={size}>
                  <Controller
                    name={`inventory.${size}` as any}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label={label}
                        type="number"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                        value={field.value !== null && field.value !== undefined ? field.value : ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          field.onChange(value);
                        }}
                        InputProps={{
                          inputProps: { min: 0 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:hash-outline" width={20} />
                            </InputAdornment>
                          ),
                        }}
                        sx={FORM_INPUT_SX}
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        {/* Inventory Thresholds */}
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
              Inventory Thresholds
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Minimum Stock Level */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="minStockLevel"
                  label="Minimum Stock Level"
                  type="number"
                  placeholder="e.g., 100"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    inputProps: { min: 0 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:alert-circle-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Maximum Stock Level */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="maxStockLevel"
                  label="Maximum Stock Level"
                  type="number"
                  placeholder="e.g., 500"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    inputProps: { min: 0 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:checkmark-circle-2-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Stock */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="stock"
                  label="Stock"
                  type="number"
                  placeholder="e.g., 250"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    inputProps: { min: 0 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:hash-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Business Information */}
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
              Business Information
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Purchase Price */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="purchasePrice"
                  label="Purchase Price"
                  type="number"
                  placeholder="e.g., 22.50"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:credit-card-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Supplier Name */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="supplierName"
                  label="Supplier Name"
                  placeholder="e.g., Global Wine Distributors"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:people-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Restaurant Location */}
              {showBranchSelect && (
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="locationId"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      // Convert field value to number for BranchSelect if it's a numeric string
                      const branchValue =
                        typeof field.value === 'string' && /^\d+$/.test(field.value)
                          ? parseInt(field.value, 10)
                          : typeof field.value === 'number'
                          ? field.value
                          : field.value || '';
                      return (
                        <BranchSelect
                          value={branchValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === '' ? '' : /^\d+$/.test(value) ? parseInt(value, 10) : value
                            );
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
                          }}
                        />
                      );
                    }}
                  />
                </Grid>
              )}
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
              onClick={() => navigate(PATH_DASHBOARD.wineInventory.list)}
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
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting || isCreating || isUpdating}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
            >
              {isEdit ? 'Update Wine' : 'Create Wine'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
