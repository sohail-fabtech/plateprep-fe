import { useEffect, useMemo, useCallback } from 'react';
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
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IUser } from '../../../@types/user';
// _mock
import { _restaurantLocationList } from '../../../_mock/arrays';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect, RHFUploadAvatar } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
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
  currentUser?: IUser;
};

// ----------------------------------------------------------------------

// Role Options (A = Admin, M = Manager, S = Staff)
const ROLE_OPTIONS = [
  { value: 'A', label: 'Admin' },
  { value: 'M', label: 'Manager' },
  { value: 'S', label: 'Staff' },
];

// User Role Options (mock - should come from API)
const USER_ROLE_OPTIONS = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Manager' },
  { id: 4, name: 'Staff' },
  { id: 5, name: 'Viewer' },
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

export default function UserNewEditForm({ isEdit = false, currentUser }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Parse currentUser data if editing
  const parsedUser = useMemo(() => {
    if (!currentUser || !isEdit) return null;
    
    // Split name into first and last name
    const nameParts = currentUser.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      firstName,
      lastName,
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || '',
      streetAddress: currentUser.address || '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: '',
      role: currentUser.role || 'S',
      userRoleId: 4, // Default
      branchId: 1, // Default
      isActive: currentUser.status === 'active',
      profileImage: currentUser.avatarUrl || null,
    };
  }, [currentUser, isEdit]);

  const defaultValues = useMemo<IUserForm>(
    () => ({
      firstName: parsedUser?.firstName || '',
      lastName: parsedUser?.lastName || '',
      dateOfBirth: null,
      email: parsedUser?.email || '',
      phoneNumber: parsedUser?.phoneNumber || '',
      password: null,
      streetAddress: parsedUser?.streetAddress || '',
      city: parsedUser?.city || '',
      stateProvince: parsedUser?.stateProvince || '',
      postalCode: parsedUser?.postalCode || '',
      country: parsedUser?.country || '',
      isActive: parsedUser?.isActive ?? true,
      role: parsedUser?.role || 'S',
      userRoleId: parsedUser?.userRoleId || 4,
      branchId: parsedUser?.branchId || 1,
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
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentUser, reset, defaultValues]);

  const onSubmit = async (data: IUserForm) => {
    try {
      // Transform to API payload format
      const apiPayload = {
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : null,
        email: data.email,
        phone_number: data.phoneNumber,
        ...(data.password && { password: data.password }),
        street_address: data.streetAddress,
        city: data.city,
        state_province: data.stateProvince,
        postal_code: data.postalCode,
        country: data.country,
        is_active: data.isActive,
        role: data.role,
        user_role_id: data.userRoleId,
        branch_id: data.branchId,
        profile_image_url: typeof data.profileImage === 'string' ? data.profileImage : null,
      };

      console.log('USER API PAYLOAD:', apiPayload);

      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar(!isEdit ? 'User created successfully!' : 'User updated successfully!');
      navigate(PATH_DASHBOARD.users.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('profileImage', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
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
              Role & Branch
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Role */}
              <Grid item xs={12} sm={6}>
                <RHFSelect name="role" label="Role" sx={FORM_INPUT_SX}>
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* User Role */}
              {/* <Grid item xs={12} sm={6}>
                <RHFSelect name="userRoleId" label="User Role" sx={FORM_INPUT_SX}>
                  {USER_ROLE_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.id}
                      value={option.id}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {option.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid> */}

              {/* Branch */}
              <Grid item xs={12} sm={6}>
                <RHFSelect name="branchId" label="Branch" sx={FORM_INPUT_SX}>
                  {_restaurantLocationList.map((branch) => (
                    <MenuItem
                      key={branch.id}
                      value={branch.id}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Active Status */}
              {/* <Grid item xs={12} sm={6}>
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
              </Grid> */}
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
                  role: 'S',
                  userRoleId: 4,
                  branchId: 1,
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
              loading={isSubmitting}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
            >
              {isEdit ? 'Update User' : 'Create User'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
