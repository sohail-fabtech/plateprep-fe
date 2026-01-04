import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Grid, Card, Stack, Typography, TextField, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// utils
import { fData } from '../../../../utils/formatNumber';
import { generateFileKey, uploadFileWithPresignedUrl } from '../../../../services/presignedUrl/presignedUrlService';
import { parseUserError, getFieldErrors } from '../../../../utils/userErrorHandler';
// assets
import { countries } from '../../../../assets/data';
// components
import { CustomFile } from '../../../../components/upload';
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFUploadAvatar,
} from '../../../../components/hook-form';
import Iconify from '../../../../components/iconify';
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
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date | null;
  streetAddress: string;
  city: string;
  stateProvince: string;
  country: string;
  profileImage: CustomFile | string | null;
};

const UpdateUserSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').trim(),
  lastName: Yup.string().required('Last name is required').trim(),
  email: Yup.string().required('Email is required').email('Email must be a valid email address').trim(),
  phoneNumber: Yup.string().nullable().trim(),
  dateOfBirth: Yup.date()
    .nullable()
    .max(new Date(), 'Date of birth cannot be in the future')
    .test('age', 'User must be at least 18 years old to work here', function (value) {
      if (!value) return true;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    })
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  streetAddress: Yup.string().nullable().trim().max(256, 'Street address must not exceed 256 characters'),
  city: Yup.string().nullable().trim().max(256, 'City must not exceed 256 characters'),
  stateProvince: Yup.string().nullable().trim().max(256, 'State/Province must not exceed 256 characters'),
  country: Yup.string().nullable().trim().max(256, 'Country must not exceed 256 characters'),
  profileImage: Yup.mixed().nullable(),
});

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const updateProfileMutation = useUpdateProfile();

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const defaultValues = useMemo<FormValuesProps>(
    () => ({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      phoneNumber: user?.phone_number || '',
      dateOfBirth: user?.date_of_birth ? new Date(user.date_of_birth) : null,
      streetAddress: user?.street_address || '',
      city: user?.city || '',
      stateProvince: user?.state_province || '',
      country: user?.country || '',
      profileImage: user?.profile_image_url || user?.profile || null,
    }),
    [user]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    control,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const [processingDialog, setProcessingDialog] = useState<{
    open: boolean;
    state: 'processing' | 'success' | 'error';
    message: string;
  }>({
    open: false,
    state: 'processing',
    message: '',
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setProfileImageFile(file);
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue('profileImage', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = async (data: FormValuesProps) => {
    if (!user?.id) {
      enqueueSnackbar('User not found', { variant: 'error' });
      return;
    }

    setProcessingDialog({
      open: true,
      state: 'processing',
      message: 'Updating profile...',
    });

    try {
      clearErrors();

      let profileImageUrl: string | null = null;
      if (profileImageFile) {
        try {
          setProcessingDialog({
            open: true,
            state: 'processing',
            message: 'Uploading profile image...',
          });
          const fileKey = generateFileKey('user_profile_images', profileImageFile.name);
          profileImageUrl = await uploadFileWithPresignedUrl(profileImageFile, fileKey, profileImageFile.type);
        } catch (imageError) {
          console.error('Error uploading profile image:', imageError);
          setProcessingDialog({
            open: true,
            state: 'error',
            message: 'Failed to upload profile image. Please try again.',
          });
          return;
        }
      } else if (typeof data.profileImage === 'string' && data.profileImage.startsWith('http')) {
        profileImageUrl = data.profileImage;
      }

      const apiPayload: any = {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim(),
        ...(data.dateOfBirth && { date_of_birth: data.dateOfBirth.toISOString().split('T')[0] }),
        ...(data.phoneNumber && data.phoneNumber.trim() && { phone_number: data.phoneNumber.trim() }),
        ...(data.streetAddress && data.streetAddress.trim() && { street_address: data.streetAddress.trim() }),
        ...(data.city && data.city.trim() && { city: data.city.trim() }),
        ...(data.stateProvince && data.stateProvince.trim() && { state_province: data.stateProvince.trim() }),
        ...(data.country && data.country.trim() && { country: data.country.trim() }),
        ...(profileImageUrl && { profile_image_url: profileImageUrl }),
      };

      setProcessingDialog({
        open: true,
        state: 'processing',
        message: 'Updating profile...',
      });

      await updateProfileMutation.mutateAsync({
        id: user.id,
        data: apiPayload,
      });

      setProcessingDialog({
        open: true,
        state: 'success',
        message: 'Profile updated successfully!',
      });

      setTimeout(() => {
        setProcessingDialog({ open: false, state: 'processing', message: '' });
      }, 1500);
    } catch (error: any) {
      console.error('Error updating profile:', error);

      const parsedError = parseUserError(error);
      const fieldErrors = getFieldErrors(error);

      Object.keys(fieldErrors).forEach((fieldName) => {
        const errorMessage = fieldErrors[fieldName];
        const mappedFieldName =
          fieldName === 'first_name'
            ? 'firstName'
            : fieldName === 'last_name'
            ? 'lastName'
            : fieldName === 'phone_number'
            ? 'phoneNumber'
            : fieldName === 'date_of_birth'
            ? 'dateOfBirth'
            : fieldName === 'street_address'
            ? 'streetAddress'
            : fieldName === 'state_province'
            ? 'stateProvince'
            : fieldName === 'profile_image_url'
            ? 'profileImage'
            : fieldName;

        setError(mappedFieldName as any, {
          type: 'server',
          message: errorMessage,
        });
      });

      const errorMessage =
        parsedError?.general ||
        error?.message ||
        'Failed to update profile. Please try again.';

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
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ py: 10, px: 3, textAlign: 'center', position: 'relative' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <RHFUploadAvatar
                  name="profileImage"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 2,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.secondary',
                        fontSize: { xs: '0.6875rem', md: '0.75rem' },
                      }}
                    >
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br /> max size of {fData(3145728)}
                    </Typography>
                  }
                />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="firstName" label="First Name" sx={FORM_INPUT_SX} />

                <RHFTextField name="lastName" label="Last Name" sx={FORM_INPUT_SX} />

                <RHFTextField name="email" label="Email" type="email" disabled sx={FORM_INPUT_SX} />

                <RHFTextField name="phoneNumber" label="Phone" sx={FORM_INPUT_SX} />

                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label="Date of Birth"
                      maxDate={new Date()}
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

                <RHFTextField name="streetAddress" label="Street Address" sx={FORM_INPUT_SX} />

                <RHFTextField name="city" label="City" sx={FORM_INPUT_SX} />

                <RHFTextField name="stateProvince" label="State/Province" sx={FORM_INPUT_SX} />

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

              <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
                <Stack direction="row" spacing={2}>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    Update
                  </LoadingButton>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}