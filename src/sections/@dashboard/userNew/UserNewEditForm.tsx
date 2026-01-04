import { useEffect, useMemo, useCallback, useState } from 'react';
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
  InputAdornment,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
// utils
import { fData } from '../../../utils/formatNumber';
import { generateFileKey, uploadFileWithPresignedUrl } from '../../../services/presignedUrl/presignedUrlService';
import { parseUserError, getFieldErrors } from '../../../utils/userErrorHandler';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IUser } from '../../../@types/user';
import { IUserDetail } from '../../../@types/userApi';
// services
import { useCreateUser, useUpdateUser } from '../../../services';
import { useBranches } from '../../../services/branches/branchHooks';
import { useRoles } from '../../../services/roles/roleHooks';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect, RHFUploadAvatar } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import { ProcessingDialog } from '../../../components/processing-dialog';
// assets
import { countries } from '../../../assets/data';
// validation
import UserValidationSchema from './UserValidation';

// ----------------------------------------------------------------------

type IUserForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  email: string;
  phoneNumber: string;
  password: string | null;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  isActive: boolean;
  role: string;
  userRoleId: number;
  branchId: number;
  profileImage: File | string | null;
};

type Props = {
  isEdit?: boolean;
  currentUser?: IUser | IUserDetail;
};

// ----------------------------------------------------------------------

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

export default function UserNewEditForm({ isEdit = false, currentUser }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Fetch branches and roles from API
  const { data: branchesData } = useBranches({
    page: 1,
    page_size: 1000,
    is_archived: false,
  });

  const { data: rolesData } = useRoles({
    page: 1,
    page_size: 1000,
    is_archived: false,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // Transform branches to dropdown options
  const branchOptions = useMemo(() => {
    if (!branchesData?.results) return [];
    return branchesData.results.map((branch) => ({
      id: branch.id,
      name: branch.branchName,
    }));
  }, [branchesData]);

  // Transform roles to dropdown options
  const roleOptions = useMemo(() => {
    if (!rolesData?.results) return [];
    return rolesData.results.map((role) => ({
      id: role.id,
      name: role.role_name,
    }));
  }, [rolesData]);

  // Parse currentUser data if editing
  const parsedUser = useMemo(() => {
    if (!currentUser || !isEdit) return null;

    // Handle IUserDetail (from API)
    if ('first_name' in currentUser) {
      const apiUser = currentUser as IUserDetail;
      return {
        firstName: apiUser.first_name || '',
        lastName: apiUser.last_name || '',
        email: apiUser.email || '',
        phoneNumber: apiUser.phone_number || '',
        dateOfBirth: apiUser.date_of_birth ? new Date(apiUser.date_of_birth) : null,
        streetAddress: apiUser.street_address || '',
        city: apiUser.city || '',
        stateProvince: apiUser.state_province || '',
        postalCode: apiUser.postal_code || '',
        country: apiUser.country || '',
        role: apiUser.role || 'A',
        userRoleId: apiUser.user_role?.id || 0,
        branchId: apiUser.branch?.id || 0,
        isActive: apiUser.is_active ?? true,
        profileImage: apiUser.profile_image_url || apiUser.profile || null,
      };
    }

    // Handle IUser (legacy format)
    const nameParts = (currentUser as IUser).name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      firstName,
      lastName,
      email: (currentUser as IUser).email || '',
      phoneNumber: (currentUser as IUser).phoneNumber || '',
      streetAddress: (currentUser as IUser).address || '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: '',
      role: (currentUser as IUser).role || 'A',
      userRoleId: 0,
      branchId: 0,
      isActive: (currentUser as IUser).status === 'active',
      profileImage: (currentUser as IUser).avatarUrl || null,
    };
  }, [currentUser, isEdit]);

  const defaultValues = useMemo<IUserForm>(
    () => ({
      firstName: parsedUser?.firstName || '',
      lastName: parsedUser?.lastName || '',
      dateOfBirth: parsedUser?.dateOfBirth || null,
      email: parsedUser?.email || '',
      phoneNumber: parsedUser?.phoneNumber || '',
      password: null,
      streetAddress: parsedUser?.streetAddress || '',
      city: parsedUser?.city || '',
      stateProvince: parsedUser?.stateProvince || '',
      postalCode: parsedUser?.postalCode || '',
      country: parsedUser?.country || '',
      isActive: parsedUser?.isActive ?? true,
      role: 'A', // Always default to "A" (Admin)
      userRoleId: parsedUser?.userRoleId || 0,
      branchId: parsedUser?.branchId || 0,
      profileImage: parsedUser?.profileImage || null,
    }),
    [parsedUser]
  );

  const methods = useForm<IUserForm>({
    resolver: yupResolver(UserValidationSchema),
    defaultValues,
    context: { isEdit },
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

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
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentUser, reset, defaultValues]);

  const onSubmit = async (data: IUserForm) => {
    // Show processing dialog
    setProcessingDialog({
      open: true,
      state: 'processing',
      message: isEdit ? 'Updating user...' : 'Creating user...',
    });

    try {
      // Clear previous errors
      clearErrors();

      // Step 1: Upload profile image if new file is selected
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
          return; // Don't proceed if image upload fails
        }
      } else if (typeof data.profileImage === 'string' && data.profileImage.startsWith('http')) {
        // Use existing image URL if it's already an HTTP URL
        profileImageUrl = data.profileImage;
      }

      // Step 2: Transform to API payload format
      const apiPayload: any = {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim(),
        role: 'A', // Always set to "A" (Admin) as default
        ...(data.dateOfBirth && { date_of_birth: data.dateOfBirth.toISOString().split('T')[0] }),
        ...(data.phoneNumber && data.phoneNumber.trim() && { phone_number: data.phoneNumber.trim() }),
        ...(data.streetAddress && data.streetAddress.trim() && { street_address: data.streetAddress.trim() }),
        ...(data.city && data.city.trim() && { city: data.city.trim() }),
        ...(data.stateProvince && data.stateProvince.trim() && { state_province: data.stateProvince.trim() }),
        ...(data.postalCode && data.postalCode.trim() && { postal_code: data.postalCode.trim() }),
        ...(data.country && data.country.trim() && { country: data.country.trim() }),
        ...(data.userRoleId && data.userRoleId > 0 && { user_role_id: data.userRoleId }),
        ...(data.branchId && data.branchId > 0 && { branch_id: data.branchId }),
        ...(profileImageUrl && { profile_image_url: profileImageUrl }),
      };

      // Add password only for create mode
      if (!isEdit && data.password) {
        apiPayload.password = data.password;
      } else if (isEdit && data.password) {
        // Allow password update in edit mode
        apiPayload.password = data.password;
      }

      // Add is_active for edit mode
      if (isEdit) {
        apiPayload.is_active = data.isActive;
      }

      // Step 3: Call API
      setProcessingDialog({
        open: true,
        state: 'processing',
        message: isEdit ? 'Updating user...' : 'Creating user...',
      });

      if (isEdit && currentUser && 'id' in currentUser) {
        await updateUserMutation.mutateAsync({
          id: (currentUser as IUserDetail).id,
          data: apiPayload,
        });
        setProcessingDialog({
          open: true,
          state: 'success',
          message: 'User updated successfully!',
        });
        setTimeout(() => {
          navigate(PATH_DASHBOARD.users.root);
        }, 1500);
      } else {
        await createUserMutation.mutateAsync(apiPayload);
        setProcessingDialog({
          open: true,
          state: 'success',
          message: 'User created successfully!',
        });
        setTimeout(() => {
          navigate(PATH_DASHBOARD.users.root);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      console.error('Error response data:', error?.response?.data);

      // Parse error and set field-level errors
      const parsedError = parseUserError(error);
      const fieldErrors = getFieldErrors(error);

      console.log('Parsed error:', parsedError);
      console.log('Field errors:', fieldErrors);

      // Set field-level errors using react-hook-form's setError
      Object.keys(fieldErrors).forEach((fieldName) => {
        const errorMessage = fieldErrors[fieldName];
        // Map API field names to form field names
        const formFieldName =
          fieldName === 'first_name' || fieldName === 'firstName'
            ? 'firstName'
            : fieldName === 'last_name' || fieldName === 'lastName'
            ? 'lastName'
            : fieldName === 'phone_number' || fieldName === 'phoneNumber'
            ? 'phoneNumber'
            : fieldName === 'date_of_birth' || fieldName === 'dateOfBirth'
            ? 'dateOfBirth'
            : fieldName === 'street_address' || fieldName === 'streetAddress'
            ? 'streetAddress'
            : fieldName === 'state_province' || fieldName === 'stateProvince'
            ? 'stateProvince'
            : fieldName === 'postal_code' || fieldName === 'postalCode'
            ? 'postalCode'
            : fieldName === 'user_role_id' || fieldName === 'userRoleId'
            ? 'userRoleId'
            : fieldName === 'branch_id' || fieldName === 'branchId'
            ? 'branchId'
            : fieldName === 'profile_image_url' || fieldName === 'profileImage'
            ? 'profileImage'
            : fieldName; // Keep as-is for fields like 'email', 'password', 'role'

        setError(formFieldName as any, {
          type: 'server',
          message: errorMessage,
        });
      });

      // Show general error message in processing dialog
      const errorMessage = parsedError.general || 
        (Object.keys(fieldErrors).length > 0 
          ? 'Please correct the errors below and try again.' 
          : 'Failed to save user. Please try again.');
      
      setProcessingDialog({
        open: true,
        state: 'error',
        message: errorMessage,
      });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setProfileImageFile(file);
        setValue('profileImage', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

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
        {/* Profile Image */}
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
              Profile Image
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
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
              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="firstName"
                  label="First Name"
                  placeholder="e.g., John"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:person-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="lastName"
                  label="Last Name"
                  placeholder="e.g., Doe"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:person-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Date of Birth */}
              <Grid item xs={12} sm={6}>
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
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="e.g., john.doe@example.com"
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

              {/* Password (only for create) */}
              {!isEdit && (
                <Grid item xs={12} sm={6}>
                  <RHFTextField
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Enter password (min 8 characters)"
                    sx={FORM_INPUT_SX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:lock-outline" width={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        {/* Address Information */}
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
              Address Information
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Street Address */}
              <Grid item xs={12}>
                <RHFTextField
                  name="streetAddress"
                  label="Street Address"
                  placeholder="e.g., 123 Main Street"
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

              {/* City */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="city"
                  label="City"
                  placeholder="e.g., New York"
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

              {/* State/Province */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="stateProvince"
                  label="State/Province"
                  placeholder="e.g., New York"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:map-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Postal Code */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="postalCode"
                  label="Postal Code"
                  placeholder="e.g., 10001"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:hash-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12} sm={6}>
                <RHFSelect name="country" label="Country" sx={FORM_INPUT_SX}>
                  <MenuItem value="" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                    Select Country
                  </MenuItem>
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
            </Grid>
          </Card>
        </Grid>

        {/* Role & Branch */}
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
              Assignment
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* User Role */}
              <Grid item xs={12} sm={6}>
                <RHFSelect name="userRoleId" label="User Role" sx={FORM_INPUT_SX}>
                  <MenuItem value={0} sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                    Select Role
                  </MenuItem>
                  {roleOptions.map((option) => (
                    <MenuItem
                      key={option.id}
                      value={option.id}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {option.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Branch */}
              <Grid item xs={12} sm={6}>
                <RHFSelect name="branchId" label="Restaurant Location" sx={FORM_INPUT_SX}>
                  <MenuItem value={0} sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                    Select Location
                  </MenuItem>
                  {branchOptions.map((branch) => (
                    <MenuItem
                      key={branch.id}
                      value={branch.id}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {branch.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Active Status */}
              {isEdit && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: theme.palette.primary.main,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            }}
                          >
                            Active Status
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    )}
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
              onClick={() => navigate(PATH_DASHBOARD.users.root)}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                const emptyValues: IUserForm = {
                  firstName: '',
                  lastName: '',
                  dateOfBirth: null,
                  email: '',
                  phoneNumber: '',
                  password: null,
                  streetAddress: '',
                  city: '',
                  stateProvince: '',
                  postalCode: '',
                  country: '',
                  isActive: true,
                  role: 'A',
                  userRoleId: 0,
                  branchId: 0,
                  profileImage: null,
                };
                reset(emptyValues);
              }}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
            >
              Clear
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting || createUserMutation.isPending || updateUserMutation.isPending}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
            >
              {isEdit ? 'Update User' : 'Create User'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
      </FormProvider>
    </>
  );
}
