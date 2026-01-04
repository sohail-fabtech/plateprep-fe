import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Card, Stack, TextField, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// utils
import { parseUserError, getFieldErrors } from '../../../../utils/userErrorHandler';
// assets
import { countries } from '../../../../assets/data';
// components
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../../components/hook-form';
import { ProcessingDialog } from '../../../../components/processing-dialog';
// services
import { useUpdateProfile } from '../../../../services';

// ----------------------------------------------------------------------

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

type FormValuesProps = {
  restaurantName: string;
  email: string;
  phoneNumber: string;
  location: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  facebookLink: string;
  instagramLink: string;
};

const UpdateRestaurantSchema = Yup.object().shape({
  restaurantName: Yup.string().required('Restaurant name is required').trim(),
  email: Yup.string().required('Email is required').email('Email must be a valid email address').trim(),
  phoneNumber: Yup.string().nullable().trim(),
  location: Yup.string().nullable().trim().max(256, 'Location must not exceed 256 characters'),
  city: Yup.string().nullable().trim().max(256, 'City must not exceed 256 characters'),
  state: Yup.string().nullable().trim().max(256, 'State must not exceed 256 characters'),
  zipcode: Yup.string().nullable().trim().max(20, 'Zipcode must not exceed 20 characters'),
  country: Yup.string().nullable().trim().max(256, 'Country must not exceed 256 characters'),
  facebookLink: Yup.string().nullable().url('Facebook link must be a valid URL').trim(),
  instagramLink: Yup.string().nullable().url('Instagram link must be a valid URL').trim(),
});

export default function AccountRestaurant() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const updateProfileMutation = useUpdateProfile();

  const [processingDialog, setProcessingDialog] = useState<{
    open: boolean;
    state: 'processing' | 'success' | 'error';
    message: string;
  }>({
    open: false,
    state: 'processing',
    message: '',
  });

  const defaultValues = useMemo<FormValuesProps>(
    () => ({
      restaurantName: user?.resturant?.resturant_name || '',
      email: user?.resturant?.email || '',
      phoneNumber: user?.resturant?.phone || '',
      location: user?.resturant?.street_address || '',
      city: user?.resturant?.city || '',
      state: user?.resturant?.state || '',
      zipcode: user?.resturant?.zipcode || '',
      country: user?.resturant?.country || '',
      facebookLink: user?.resturant?.social_media?.facebook || '',
      instagramLink: user?.resturant?.social_media?.instagram || '',
    }),
    [user]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateRestaurantSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    if (!user?.id || !user?.resturant?.id) {
      enqueueSnackbar('Restaurant not found', { variant: 'error' });
      return;
    }

    setProcessingDialog({
      open: true,
      state: 'processing',
      message: 'Updating restaurant...',
    });

    try {
      clearErrors();

      // Prepare social media object
      const socialMedia: Record<string, string> = {};
      if (data.facebookLink?.trim()) {
        socialMedia.facebook = data.facebookLink.trim();
      }
      if (data.instagramLink?.trim()) {
        socialMedia.instagram = data.instagramLink.trim();
      }

      // API payload uses "resturant" spelling (wrong spelling as per API)
      const apiPayload: any = {
        resturant: {
          id: user.resturant.id,
          resturant_name: data.restaurantName.trim(),
          email: data.email.trim(),
          phone: data.phoneNumber?.trim() || null,
          street_address: data.location?.trim() || null,
          city: data.city?.trim() || null,
          state: data.state?.trim() || null,
          zipcode: data.zipcode?.trim() || null,
          country: data.country?.trim() || null,
          social_media: Object.keys(socialMedia).length > 0 ? socialMedia : null,
        },
      };

      setProcessingDialog({
        open: true,
        state: 'processing',
        message: 'Updating restaurant...',
      });

      await updateProfileMutation.mutateAsync({
        id: user.id,
        data: apiPayload,
      });

      setProcessingDialog({
        open: true,
        state: 'success',
        message: 'Restaurant updated successfully!',
      });

      setTimeout(() => {
        setProcessingDialog({ open: false, state: 'processing', message: '' });
      }, 1500);
    } catch (error: any) {
      console.error('Error updating restaurant:', error);

      const parsedError = parseUserError(error);
      const fieldErrors = getFieldErrors(error);

      Object.keys(fieldErrors).forEach((fieldName) => {
        const errorMessage = fieldErrors[fieldName];
        // Map API field names to form field names
        const mappedFieldName =
          fieldName === 'resturant_name' || fieldName === 'resturant.resturant_name'
            ? 'restaurantName'
            : fieldName === 'resturant.email' || fieldName === 'email'
            ? 'email'
            : fieldName === 'resturant.phone' || fieldName === 'phone'
            ? 'phoneNumber'
            : fieldName === 'resturant.street_address' || fieldName === 'street_address'
            ? 'location'
            : fieldName === 'resturant.city' || fieldName === 'city'
            ? 'city'
            : fieldName === 'resturant.state' || fieldName === 'state'
            ? 'state'
            : fieldName === 'resturant.zipcode' || fieldName === 'zipcode'
            ? 'zipcode'
            : fieldName === 'resturant.country' || fieldName === 'country'
            ? 'country'
            : fieldName === 'resturant.social_media.facebook' || fieldName === 'social_media.facebook'
            ? 'facebookLink'
            : fieldName === 'resturant.social_media.instagram' || fieldName === 'social_media.instagram'
            ? 'instagramLink'
            : fieldName;

        setError(mappedFieldName as any, {
          type: 'server',
          message: errorMessage,
        });
      });

      const errorMessage =
        parsedError?.general ||
        error?.message ||
        'Failed to update restaurant. Please try again.';

      setProcessingDialog({
        open: true,
        state: 'error',
        message: errorMessage,
      });

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <>
      <ProcessingDialog
        open={processingDialog.open}
        state={processingDialog.state}
        message={processingDialog.message}
        onClose={() => {
          if (processingDialog.state !== 'processing') {
            setProcessingDialog({ open: false, state: 'processing', message: '' });
          }
        }}
      />

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(3, 1fr)',
            }}
          >
            <RHFTextField name="restaurantName" label="Restaurant Name" sx={FORM_INPUT_SX} />

            <RHFTextField name="email" label="Email" type="email" sx={FORM_INPUT_SX} />

            <RHFTextField name="phoneNumber" label="Phone Number" sx={FORM_INPUT_SX} />
          </Box>

          <Box sx={{ mt: 3 }}>
            <RHFTextField
              name="location"
              label="Location"
              multiline
              rows={4}
              sx={{
                ...FORM_INPUT_SX,
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                },
              }}
            />
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            sx={{ mt: 3 }}
          >
            <RHFTextField name="city" label="City" sx={FORM_INPUT_SX} />

            <RHFTextField name="state" label="State" sx={FORM_INPUT_SX} />

            <RHFTextField name="zipcode" label="Zipcode" sx={FORM_INPUT_SX} />

            <RHFSelect name="country" label="Country" sx={FORM_INPUT_SX}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.label}>
                  {country.label}
                </MenuItem>
              ))}
            </RHFSelect>
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            sx={{ mt: 3 }}
          >
            <RHFTextField name="facebookLink" label="Facebook Link (Optional)" sx={FORM_INPUT_SX} />

            <RHFTextField name="instagramLink" label="Instagram Link (Optional)" sx={FORM_INPUT_SX} />
          </Box>

          <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
            <Stack direction="row" spacing={2}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Update
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </FormProvider>
    </>
  );
}

