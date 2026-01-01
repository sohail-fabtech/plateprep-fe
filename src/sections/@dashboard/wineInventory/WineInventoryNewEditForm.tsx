import { useEffect, useMemo } from 'react';
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
// validation
import WineInventoryValidationSchema from './WineInventoryValidation';
// sections
import { SingleImageUpload } from '../recipe/form';
// assets
import { countries } from '../../../assets/data';

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
  currentWine?: IWineInventory;
};

// ----------------------------------------------------------------------

// Dropdown Options
const WINE_TYPE_OPTIONS: IWineInventory['wineType'][] = ['Red', 'White', 'Rosé', 'Sparkling', 'Fortified', 'Dessert'];

const WINE_PROFILE_OPTIONS: IWineInventory['wineProfile'][] = [
  'Bone Dry – Bold Bitter Finish',
  'Bone Dry – Savory',
  'Dry – Vegetables & Herbs',
  'Dry – Tart Fruits & Flowers',
  'Dry – Ripe Fruits & Spices',
  'Dry – Fruit Sauce & Vanilla',
  'Semi-Sweet – Candied Fruit & Flowers',
  'Sweet – Fruit Jam & Chocolate',
  'Very Sweet – Figs, Raisins & Dates',
];

const REGION_OPTIONS = [
  'Napa Valley',
  'Burgundy',
  'Bordeaux',
  'Tuscany',
  'Rioja',
  'Barossa Valley',
  'Marlborough',
  'Champagne',
  'Mosel',
  'Mendoza',
  'Other',
];

const LOCATION_OPTIONS = ['Main Restaurant', 'Wine Cellar', 'Bar Area', 'Storage Room'];

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
      inventory: currentWine?.inventory || {
        '187.5': null,
        '375': null,
        '750': null,
        '1500': null,
        '3000': null,
      },
      minStockLevel: currentWine?.minStockLevel || 0,
      maxStockLevel: currentWine?.maxStockLevel || 0,
      purchasePrice: currentWine?.purchasePrice || null,
      supplierName: currentWine?.supplierName || null,
      locationId: currentWine?.locationId || '',
    };
  }, [currentWine]);

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

  useEffect(() => {
    if (isEdit && currentWine) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentWine, reset, defaultValues]);

  const onSubmit = async (data: IWineInventoryForm) => {
    try {
      // Transform to API payload format
      const apiPayload = {
        wine_name: data.wineName,
        producer: data.producer || null,
        vintage: data.vintage || null,
        country: data.country,
        region: {
          type: data.region === 'Other' ? 'CUSTOM' : 'STANDARD',
          value: data.region === 'Other' ? data.regionOther : data.region,
        },
        wine_type: data.wineType,
        wine_profile: data.wineProfile,
        description: data.description || null,
        tags: data.tags,
        inventory: {
          '187.5': data.inventory['187.5'] || 0,
          '375': data.inventory['375'] || 0,
          '750': data.inventory['750'] || 0,
          '1500': data.inventory['1500'] || 0,
          '3000': data.inventory['3000'] || 0,
        },
        min_stock_level: data.minStockLevel,
        max_stock_level: data.maxStockLevel,
        purchase_price: data.purchasePrice || null,
        supplier_name: data.supplierName || null,
        location_id: data.locationId,
      };

      console.log('WINE INVENTORY API PAYLOAD:', apiPayload);

      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar(!isEdit ? 'Wine created successfully!' : 'Wine updated successfully!');
      navigate(PATH_DASHBOARD.wineInventory.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  };

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setValue('image', url);
  };

  const handleImageRemove = () => {
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
                  options={['House Favorite', 'By the Glass', 'Popular', 'Premium', 'Special Occasion', 'Celebration', 'Dessert Wine', 'Seasonal']}
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
                        value={field.value || ''}
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="locationId" label="Restaurant Location" sx={FORM_INPUT_SX}>
                  {LOCATION_OPTIONS.map((option, index) => (
                    <MenuItem
                      key={option}
                      value={`loc_${index + 1}`}
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
              loading={isSubmitting}
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

