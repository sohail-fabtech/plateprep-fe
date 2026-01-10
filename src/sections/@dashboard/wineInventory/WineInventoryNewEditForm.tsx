import { useEffect, useMemo, useState, useRef } from 'react';
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
import { ProcessingDialog } from 'src/components/processing-dialog';
// services
import { uploadFileWithPresignedUrl, generateFileKey } from '../../../services/presignedUrl/presignedUrlService';

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
  currentWine?: IWineInventory;
};

// ----------------------------------------------------------------------

type InventoryItem = {
  bottle_size: number;
  quantity: number | null;
  purchase_price: number | null;
  menu_price: number | null;
};

type WineInventoryApiPayload = {
  wine_name: string;
  producer: string | null;
  vintage: number | null;
  country: string;
  region: string;
  wine_type: string;
  wine_profile: string;
  description: string | null;
  tags: string[];
  inventory: InventoryItem[];
  per_glass_price: number | null;
  stock: number;
  min_stock_level: number;
  max_stock_level: number;
  supplier_name: string | null;
  branch: number | null;
  image_url?: string | null;
};

// Bottle size configuration - Enterprise-level approach
const BOTTLE_SIZES = [
  { key: '187.5', label: 'Split / Piccolo (187.5ml)', quantityField: 'bottle187', purchaseField: 'purchasePrice187', menuField: 'menuPrice187' },
  { key: '375', label: 'Demi / Half (375ml)', quantityField: 'bottle375', purchaseField: 'purchasePrice375', menuField: 'menuPrice375' },
  { key: '750', label: 'Standard (750ml)', quantityField: 'bottle750', purchaseField: 'purchasePrice750', menuField: 'menuPrice750' },
  { key: '1500', label: 'Magnum (1.5L)', quantityField: 'bottle1500', purchaseField: 'purchasePrice1500', menuField: 'menuPrice1500' },
  { key: '3000', label: 'Jeroboam (3L)', quantityField: 'bottle3000', purchaseField: 'purchasePrice3000', menuField: 'menuPrice3000' },
] as const;

function transformToPayload(data: IWineInventoryForm, branchIdForApi: number | null): WineInventoryApiPayload {
  const regionValue = data.region === 'Other' ? data.regionOther || '' : data.region;

  const parseNumberOrNull = (value: unknown) => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  // Enterprise-level: Dynamic inventory array construction
  const inventory: InventoryItem[] = BOTTLE_SIZES.map(({ key, quantityField, purchaseField, menuField }) => ({
    bottle_size: Number(key),
    quantity: parseNumberOrNull(data[quantityField as keyof IWineInventoryForm]),
    purchase_price: parseNumberOrNull(data[purchaseField as keyof IWineInventoryForm]),
    menu_price: parseNumberOrNull(data[menuField as keyof IWineInventoryForm]),
  }));

  return {
    wine_name: data.wineName,
    producer: data.producer || null,
    vintage: parseNumberOrNull(data.vintage),
    country: data.country,
    region: regionValue,
    wine_type: data.wineType,
    wine_profile: data.wineProfile,
    description: data.description || null,
    tags: data.tags || [],
    inventory,
    per_glass_price: parseNumberOrNull(data.perGlassPrice),
    stock: Number(data.stock || 0),
    min_stock_level: Number(data.minStockLevel),
    max_stock_level: Number(data.maxStockLevel),
    supplier_name: data.supplierName || null,
    branch: branchIdForApi,
  };
}

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
      // Enterprise-level: Dynamic bottle size defaults
      bottle187: currentWine?.inventory?.['187.5'] ?? null,
      bottle375: currentWine?.inventory?.['375'] ?? null,
      bottle750: currentWine?.inventory?.['750'] ?? null,
      bottle1500: currentWine?.inventory?.['1500'] ?? null,
      bottle3000: currentWine?.inventory?.['3000'] ?? null,
      purchasePrice187: currentWine?.purchasePrices?.['187.5'] ?? null,
      purchasePrice375: currentWine?.purchasePrices?.['375'] ?? null,
      purchasePrice750: currentWine?.purchasePrices?.['750'] ?? null,
      purchasePrice1500: currentWine?.purchasePrices?.['1500'] ?? null,
      purchasePrice3000: currentWine?.purchasePrices?.['3000'] ?? null,
      menuPrice187: currentWine?.menuPrices?.['187.5'] ?? null,
      menuPrice375: currentWine?.menuPrices?.['375'] ?? null,
      menuPrice750: currentWine?.menuPrices?.['750'] ?? null,
      menuPrice1500: currentWine?.menuPrices?.['1500'] ?? null,
      menuPrice3000: currentWine?.menuPrices?.['3000'] ?? null,
      perGlassPrice: currentWine?.perGlassPrice ?? null,
      minStockLevel: currentWine?.minStockLevel || 0,
      maxStockLevel: currentWine?.maxStockLevel || 0,
      stock: currentWine?.totalStock || 0,
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
    // Show processing dialog
    setProcessingDialog({
      open: true,
      state: 'processing',
      message: isEdit ? 'Updating wine...' : 'Creating wine...',
    });

    try {
      let uploadedImageUrl: string | null = null;

      // Upload image file to S3 if new file selected
      if (imageFileRef.current) {
        setProcessingDialog({
          open: true,
          state: 'processing',
          message: 'Uploading image...',
        });
        const fileKey = generateFileKey('wine_images', imageFileRef.current.name);
        uploadedImageUrl = await uploadFileWithPresignedUrl(imageFileRef.current, fileKey, imageFileRef.current.type);
      } else if (data.image && data.image.startsWith('http')) {
        // Use existing image URL if it's already an HTTP URL
        uploadedImageUrl = data.image;
      }

      // Update processing message
      setProcessingDialog({
        open: true,
        state: 'processing',
        message: isEdit ? 'Updating wine...' : 'Creating wine...',
      });

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

      const apiPayload = transformToPayload(data, locationIdForApi);

      // Add image_url to payload if uploaded
      if (uploadedImageUrl) {
        apiPayload.image_url = uploadedImageUrl;
      }

      if (isEdit && currentWine?.id) {
        await updateWineInventory({
          id: currentWine.id,
          data: apiPayload,
        });
        enqueueSnackbar('Wine updated successfully!');
      } else {
        await createWineInventory({
          data: apiPayload,
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

      // Show error in processing dialog
      setProcessingDialog({
        open: true,
        state: 'error',
        message,
      });
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

  const handleClear = () => {
    imageFileRef.current = null;

    // Enterprise-level: Dynamic bottle size clear defaults
    const bottleClearDefaults: Record<string, null> = {};
    BOTTLE_SIZES.forEach(({ quantityField, purchaseField, menuField }) => {
      bottleClearDefaults[quantityField] = null;
      bottleClearDefaults[purchaseField] = null;
      bottleClearDefaults[menuField] = null;
    });

    reset({
      wineName: '',
      producer: null,
      vintage: null,
      country: '',
      region: '',
      regionOther: null,
      description: null,
      image: null,
      wineType: 'Red',
      wineProfile: 'Dry – Ripe Fruits & Spices',
      tags: [],
      ...bottleClearDefaults,
      perGlassPrice: null,
      minStockLevel: 0,
      maxStockLevel: 0,
      stock: 0,
      supplierName: null,
      locationId: initialBranchId ? String(initialBranchId) : '',
    });
  };

  // Check if "Other" is selected for region
  const isRegionOther = values.region === 'Other';

  return (
    <>
      <ProcessingDialog
        open={processingDialog.open}
        state={processingDialog.state}
        message={processingDialog.message}
        onClose={() => setProcessingDialog({ open: false, state: 'processing', message: '' })}
      />
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

        {/* Inventory - Bottle Sizes, Pricing & Stock - Enterprise-level dynamic rendering */}
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
              Inventory – Bottle Sizes, Pricing & Stock
            </Typography>

            <Stack spacing={{ xs: 3, md: 4 }}>
              {/* Dynamic rendering of bottle sizes */}
              {BOTTLE_SIZES.map(({ key, label, quantityField, purchaseField, menuField }) => (
                <Box key={key}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                    {label}
                  </Typography>
                  <Grid container spacing={{ xs: 2, md: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <RHFTextField
                        name={quantityField}
                        label="Quantity"
                        type="number"
                        placeholder="e.g., 0"
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
                    <Grid item xs={12} sm={4}>
                      <RHFTextField
                        name={purchaseField}
                        label="Purchase Price"
                        type="number"
                        placeholder="e.g., 12.00"
                        sx={FORM_INPUT_SX}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 },
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <RHFTextField
                        name={menuField}
                        label="Menu Price"
                        type="number"
                        placeholder="e.g., 18.00"
                        sx={FORM_INPUT_SX}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 },
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {/* Per Glass Price */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                  Per Glass Pricing
                </Typography>
                <Grid container spacing={{ xs: 2, md: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="perGlassPrice"
                      label="Per Glass Price"
                      type="number"
                      placeholder="e.g., 8.00"
                      sx={FORM_INPUT_SX}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 },
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
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
              onClick={handleClear}
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
    </>
  );
}
