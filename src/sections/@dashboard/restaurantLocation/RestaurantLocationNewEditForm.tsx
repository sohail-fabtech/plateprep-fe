import { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DragDropContext, DropResult, Draggable, Droppable } from '@hello-pangea/dnd';
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
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IRestaurantLocation, IRestaurantLocationForm, ISocialMedia } from '../../../@types/restaurantLocation';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import { ProcessingDialog } from '../../../components/processing-dialog';
// validation
import RestaurantLocationValidationSchema from './RestaurantLocationValidation';
// services
import { useCreateBranch, useUpdateBranch } from '../../../services';
import { transformSocialMediaToApiFormat } from '../../../services/branches/branchService';

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
  currentLocation?: IRestaurantLocation;
};

// ----------------------------------------------------------------------

// Social Media Platform Options
const SOCIAL_MEDIA_OPTIONS = [
  'Facebook',
  'Instagram',
  'Twitter',
  'LinkedIn',
  'WhatsApp',
  'YouTube',
  'TikTok',
  'Yelp',
  'Google Business',
  'Other',
];

// Consistent Form Styling System (Matching Task & Recipe Forms)
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

export default function RestaurantLocationNewEditForm({ isEdit = false, currentLocation }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();

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

  const defaultValues = useMemo<IRestaurantLocationForm>(
    () => ({
      branchName: currentLocation?.branchName || '',
      branchLocation: currentLocation?.branchLocation || '',
      phoneNumber: currentLocation?.phoneNumber || '',
      email: currentLocation?.email || '',
      socialMedia: currentLocation?.socialMedia || [],
    }),
    [currentLocation]
  );

  const methods = useForm<IRestaurantLocationForm>({
    resolver: yupResolver(RestaurantLocationValidationSchema),
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
    if (isEdit && currentLocation) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentLocation, reset, defaultValues]);

  const onSubmit = async (data: IRestaurantLocationForm) => {
    // Show processing dialog
    setProcessingDialog({
      open: true,
      state: 'processing',
      message: isEdit ? 'Updating location...' : 'Creating location...',
    });

    try {
      // Transform social media from array to object format
      const socialMediaObject = transformSocialMediaToApiFormat(data.socialMedia);

      // Transform to API payload format
      // Convert empty strings to null for optional fields
      const apiPayload = {
        branch_name: data.branchName.trim(),
        branch_location: data.branchLocation?.trim() || null,
        phone_number: data.phoneNumber?.trim() || null,
        email: data.email?.trim() || null,
        social_media: socialMediaObject,
      };

      if (isEdit && currentLocation?.id) {
        // Update existing branch
        await updateBranchMutation.mutateAsync({
          id: currentLocation.id,
          data: apiPayload,
        });
        // Show success
        setProcessingDialog({
          open: true,
          state: 'success',
          message: 'Location updated successfully!',
        });
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate(PATH_DASHBOARD.restaurantLocation.list);
        }, 1500);
      } else {
        // Create new branch
        await createBranchMutation.mutateAsync(apiPayload);
        // Show success
        setProcessingDialog({
          open: true,
          state: 'success',
          message: 'Location created successfully!',
        });
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate(PATH_DASHBOARD.restaurantLocation.list);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error saving location:', error);
      
      // Extract error data - handle both axios interceptor format and direct error
      const errorData = error?.response?.data || error?.data || error;
      let errorMessage = 'Failed to save location. Please try again.';
      
      // Handle different error formats
      if (typeof errorData === 'string') {
        // Direct string error
        errorMessage = errorData;
      } else if (errorData && typeof errorData === 'object') {
        // Check for detail field (general error)
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } 
        // Check for non_field_errors (general validation errors)
        else if (errorData.non_field_errors) {
          const nonFieldErrors = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors
            : [errorData.non_field_errors];
          errorMessage = nonFieldErrors[0];
        }
        // Handle field-specific errors
        else {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join(', ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show error in processing dialog
      setProcessingDialog({
        open: true,
        state: 'error',
        message: errorMessage,
      });
    }
  };

  const handleAddSocialMedia = () => {
    const newSocialMedia = [...values.socialMedia, { name: '', url: '' }];
    setValue('socialMedia', newSocialMedia);
  };

  const handleRemoveSocialMedia = (index: number) => {
    const newSocialMedia = values.socialMedia.filter((_, i) => i !== index);
    setValue('socialMedia', newSocialMedia);
  };

  const handleSocialMediaChange = (index: number, field: keyof ISocialMedia, value: string) => {
    const newSocialMedia = [...values.socialMedia];
    newSocialMedia[index] = { ...newSocialMedia[index], [field]: value };
    setValue('socialMedia', newSocialMedia);
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

    if (source.droppableId === 'socialMedia') {
      const reordered = reorder(values.socialMedia, source.index, destination.index);
      setValue('socialMedia', reordered);
    }
  }, [values.socialMedia, setValue]);

  return (
    <>
      <ProcessingDialog
        open={processingDialog.open}
        state={processingDialog.state}
        message={processingDialog.message}
        onClose={() => setProcessingDialog({ open: false, state: 'processing', message: '' })}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Basic Information */}
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
              Basic Information
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Location Name */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="branchName"
                  label="Location Name"
                  placeholder="e.g., Downtown Location"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:home-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="branchLocation"
                  label="Address"
                  placeholder="e.g., 123 Main Street, New York, NY 10001"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:pin-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="e.g., +1 (555) 123-4567"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:phone-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="e.g., location@plateprep.com"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:email-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Social Links (Optional) */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: { xs: 2, md: 3 },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                }}
              >
                Social Links (Optional)
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:plus-fill" width={16} />}
                onClick={handleAddSocialMedia}
                sx={{
                  minWidth: { xs: 40, sm: 120 },
                  px: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0, sm: 0.75 },
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Add Link
                </Box>
              </Button>
            </Box>

            <Droppable droppableId="socialMedia" type="socialMedia">
              {(provided) => (
                <Stack spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
                  {values.socialMedia.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.grey[500], 0.32)}`,
                        bgcolor: alpha(theme.palette.grey[500], 0.04),
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No social links added. Click the + button above to add one.
                      </Typography>
                    </Box>
                  ) : (
                    values.socialMedia.map((social, index) => {
                      const itemId = `socialMedia-${index}`;
                      return (
                        <Draggable key={itemId} draggableId={itemId} index={index}>
                          {(dragProvided, snapshot) => (
                            <Box
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${
                                  snapshot.isDragging
                                    ? theme.palette.primary.main
                                    : alpha(theme.palette.grey[500], 0.2)
                                }`,
                                bgcolor: snapshot.isDragging
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : alpha(theme.palette.grey[500], 0.02),
                                boxShadow: snapshot.isDragging ? theme.customShadows.z20 : 'none',
                                opacity: snapshot.isDragging ? 0.9 : 1,
                                transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                userSelect: 'none',
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                {/* Drag Handle */}
                                <Grid item>
                                  <Box
                                    {...dragProvided.dragHandleProps}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      color: theme.palette.text.disabled,
                                      cursor: 'grab',
                                      '&:active': {
                                        cursor: 'grabbing',
                                      },
                                    }}
                                  >
                                    <Iconify icon="eva:menu-outline" width={20} />
                                  </Box>
                                </Grid>

                                <Grid item xs={12} sm={5}>
                                  <Controller
                                    name={`socialMedia.${index}.name`}
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <TextField
                                        {...field}
                                        fullWidth
                                        size="small"
                                        label="Link Name"
                                        placeholder="e.g., Instagram, Facebook, Yelp, TikTok"
                                        error={!!error}
                                        helperText={error?.message}
                                        sx={FORM_INPUT_SX}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleSocialMediaChange(index, 'name', e.target.value);
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Controller
                                    name={`socialMedia.${index}.url`}
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <TextField
                                        {...field}
                                        fullWidth
                                        size="small"
                                        label="Link URL"
                                        placeholder="https://..."
                                        error={!!error}
                                        helperText={error?.message}
                                        sx={FORM_INPUT_SX}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleSocialMediaChange(index, 'url', e.target.value);
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveSocialMedia(index)}
                                    sx={{
                                      color: theme.palette.error.main,
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                      },
                                    }}
                                  >
                                    <Iconify icon="eva:minus-fill" width={20} />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>
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
              onClick={() => navigate(PATH_DASHBOARD.restaurantLocation.list)}
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
              loading={isSubmitting || createBranchMutation.isPending || updateBranchMutation.isPending}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
            >
              {isEdit ? 'Update Location' : 'Add Location'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
        </FormProvider>
      </DragDropContext>
    </>
  );
}

