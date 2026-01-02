import { useState, useEffect, useRef } from 'react';
import * as Yup from 'yup';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { styled } from '@mui/material/styles';
import {
  Stack,
  Alert,
  Button,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  Grid,
  MenuItem,
  Box,
  Typography,
  StepperProps,
  StepConnector as MUIStepConnector,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// utils
import { parseRegisterError } from '../../utils/registerErrorHandler';
// components
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField, RHFSelect } from '../../components/hook-form';
// assets
import { countries } from '../../assets/data';

// ----------------------------------------------------------------------

const STEPS = ['Personal Information', 'Restaurant Information'];

// Custom Step Connector - Matching existing system
const StepConnector = styled(MUIStepConnector)(({ theme }) => ({
  top: 10,
  left: 'calc(-50% + 20px)',
  right: 'calc(50% + 20px)',
  '& .MuiStepConnector-line': {
    borderTopWidth: 2,
    borderColor: theme.palette.divider,
  },
  '&.Mui-active, &.Mui-completed': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

// Custom Step Icon - Matching existing system
type StepIconProps = {
  active: boolean;
  completed: boolean;
};

function StepIcon({ active, completed }: StepIconProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        width: 24,
        height: 24,
        color: 'text.disabled',
        ...(active && {
          color: 'primary.main',
        }),
      }}
    >
      {completed ? (
        <Iconify icon="eva:checkmark-fill" sx={{ color: 'primary.main' }} width={18} />
      ) : (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
          }}
        />
      )}
    </Stack>
  );
}

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

type RestaurantInfo = {
  restaurant_name: string; // Frontend uses correct spelling
  street_address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  phone?: string;
  email?: string;
  social_media?: Record<string, any>;
};

type FormValuesProps = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  restaurant: RestaurantInfo;
  afterSubmit?: string;
};

// Step 1: Personal Information Schema
const PersonalInfoSchema = Yup.object().shape({
  first_name: Yup.string()
    .required('First name is required')
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  last_name: Yup.string()
    .required('Last name is required')
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Email must be a valid email address')
    .trim()
    .max(100, 'Email must not exceed 100 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

// Step 2: Restaurant Information Schema
const RestaurantInfoSchema = Yup.object().shape({
  restaurant: Yup.object().shape({
    restaurant_name: Yup.string()
      .required('Restaurant name is required')
      .trim()
      .min(2, 'Restaurant name must be at least 2 characters')
      .max(100, 'Restaurant name must not exceed 100 characters'),
    street_address: Yup.string().trim().max(200, 'Street address must not exceed 200 characters'),
    city: Yup.string().trim().max(100, 'City must not exceed 100 characters'),
    state: Yup.string().trim().max(100, 'State must not exceed 100 characters'),
    zipcode: Yup.string().trim().max(20, 'Zipcode must not exceed 20 characters'),
    country: Yup.string().trim(),
    phone: Yup.string()
      .trim()
      .matches(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
      .max(20, 'Phone number must not exceed 20 characters'),
    email: Yup.string()
      .trim()
      .email('Email must be a valid email address')
      .max(100, 'Email must not exceed 100 characters'),
    social_media: Yup.object().nullable(),
  }),
});

export default function AuthRegisterForm() {
  const { register } = useAuthContext();

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const formValuesRef = useRef<FormValuesProps | null>(null);
  const apiErrorsRef = useRef<Record<string, string>>({});

  const defaultValues: FormValuesProps = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    restaurant: {
      restaurant_name: '',
      street_address: '',
      city: '',
      state: '',
      zipcode: '',
      country: '',
      phone: '',
      email: '',
      social_media: {},
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(
      activeStep === 0 ? PersonalInfoSchema : RestaurantInfoSchema
    ),
    defaultValues: formValuesRef.current || defaultValues,
    mode: 'onChange',
    shouldUnregister: false,
  });

  const {
    reset,
    setValue,
    setError,
    trigger,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  // Watch all form values to persist them
  const watchedValues = watch();

  // Persist form values in ref whenever they change
  useEffect(() => {
    if (watchedValues) {
      formValuesRef.current = watchedValues as FormValuesProps;
    }
  }, [watchedValues]);

  // Restore API errors when step changes
  useEffect(() => {
    Object.entries(apiErrorsRef.current).forEach(([field, message]) => {
      setError(field as any, {
        type: 'manual',
        message,
      });
    });
  }, [activeStep, setError]);

  // Sync Chrome autofill values when step changes
  useEffect(() => {
    if (formValuesRef.current) {
      // Restore persisted values
      Object.entries(formValuesRef.current).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'restaurant' && typeof value === 'object') {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== undefined && nestedValue !== null) {
                setValue(`restaurant.${nestedKey}` as any, nestedValue, { shouldValidate: false });
              }
            });
          } else {
            setValue(key as keyof FormValuesProps, value, { shouldValidate: false });
          }
        }
      });
    }

    // Sync Chrome autofill values from DOM after a short delay
    const syncAutofill = setTimeout(() => {
      if (activeStep === 0) {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
        const firstNameInput = document.querySelector('input[name="first_name"]') as HTMLInputElement;
        const lastNameInput = document.querySelector('input[name="last_name"]') as HTMLInputElement;

        if (emailInput?.value && emailInput.value !== watchedValues.email) {
          setValue('email', emailInput.value, { shouldValidate: false });
        }
        if (passwordInput?.value && passwordInput.value !== watchedValues.password) {
          setValue('password', passwordInput.value, { shouldValidate: false });
        }
        if (firstNameInput?.value && firstNameInput.value !== watchedValues.first_name) {
          setValue('first_name', firstNameInput.value, { shouldValidate: false });
        }
        if (lastNameInput?.value && lastNameInput.value !== watchedValues.last_name) {
          setValue('last_name', lastNameInput.value, { shouldValidate: false });
        }
      } else if (activeStep === 1) {
        const restaurantNameInput = document.querySelector('input[name="restaurant.restaurant_name"]') as HTMLInputElement;
        const streetAddressInput = document.querySelector('input[name="restaurant.street_address"]') as HTMLInputElement;
        const cityInput = document.querySelector('input[name="restaurant.city"]') as HTMLInputElement;
        const stateInput = document.querySelector('input[name="restaurant.state"]') as HTMLInputElement;
        const zipcodeInput = document.querySelector('input[name="restaurant.zipcode"]') as HTMLInputElement;

        if (restaurantNameInput?.value && restaurantNameInput.value !== watchedValues.restaurant?.restaurant_name) {
          setValue('restaurant.restaurant_name', restaurantNameInput.value, { shouldValidate: false });
        }
        if (streetAddressInput?.value && streetAddressInput.value !== watchedValues.restaurant?.street_address) {
          setValue('restaurant.street_address', streetAddressInput.value, { shouldValidate: false });
        }
        if (cityInput?.value && cityInput.value !== watchedValues.restaurant?.city) {
          setValue('restaurant.city', cityInput.value, { shouldValidate: false });
        }
        if (stateInput?.value && stateInput.value !== watchedValues.restaurant?.state) {
          setValue('restaurant.state', stateInput.value, { shouldValidate: false });
        }
        if (zipcodeInput?.value && zipcodeInput.value !== watchedValues.restaurant?.zipcode) {
          setValue('restaurant.zipcode', zipcodeInput.value, { shouldValidate: false });
        }
      }
    }, 100);

    return () => clearTimeout(syncAutofill);
  }, [activeStep, setValue, watchedValues]);

  // Clear only validation errors when step changes, preserve API errors
  useEffect(() => {
    // Only clear validation errors, not API errors
    const fieldsToClear: (keyof FormValuesProps)[] = [];
    if (activeStep === 0) {
      // Don't clear errors for step 0 fields when on step 0
    } else {
      // Clear step 0 validation errors when moving to step 1
      fieldsToClear.push('first_name', 'last_name', 'email', 'password');
    }
    
    fieldsToClear.forEach((field) => {
      if (!apiErrorsRef.current[field as string]) {
        methods.clearErrors(field);
      }
    });
  }, [activeStep, methods]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValuesProps)[] = [];
    
    if (activeStep === 0) {
      fieldsToValidate = ['first_name', 'last_name', 'email', 'password'];
    } else {
      fieldsToValidate = ['restaurant'];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      // Clear only validation errors for current step, preserve API errors
      fieldsToValidate.forEach((field) => {
        if (!apiErrorsRef.current[field as string]) {
          methods.clearErrors(field);
        }
      });
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    // Don't clear errors - preserve both validation and API errors
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      if (register) {
        // Transform data: use correct spelling on frontend, but send misspelled version to backend
        const payload = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password,
          resturant: {
            // Backend expects "resturant" (misspelled)
            resturant_name: data.restaurant.restaurant_name,
            street_address: data.restaurant.street_address || undefined,
            city: data.restaurant.city || undefined,
            state: data.restaurant.state || undefined,
            zipcode: data.restaurant.zipcode || undefined,
            country: data.restaurant.country || undefined,
            phone: data.restaurant.phone || undefined,
            email: data.restaurant.email || undefined,
            social_media: data.restaurant.social_media || undefined,
          },
        };

        await register(payload);
      }
    } catch (error: any) {
      console.error(error);
      const parsedError = parseRegisterError(error);

      // Store API errors in ref for persistence
      apiErrorsRef.current = {};

      // Preserve ALL form values including password
      reset(
        {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password, // Preserve password, don't clear it
          restaurant: data.restaurant,
        },
        { keepErrors: false }
      );

      // Set user field-specific errors and store in ref
      if (parsedError.first_name) {
        apiErrorsRef.current.first_name = parsedError.first_name;
        setError('first_name', {
          type: 'manual',
          message: parsedError.first_name,
        });
      }

      if (parsedError.last_name) {
        apiErrorsRef.current.last_name = parsedError.last_name;
        setError('last_name', {
          type: 'manual',
          message: parsedError.last_name,
        });
      }

      if (parsedError.email) {
        apiErrorsRef.current.email = parsedError.email;
        setError('email', {
          type: 'manual',
          message: parsedError.email,
        });
      }

      if (parsedError.password) {
        apiErrorsRef.current.password = parsedError.password;
        setError('password', {
          type: 'manual',
          message: parsedError.password,
        });
      }

      // Set restaurant field-specific errors and store in ref
      if (parsedError.restaurant) {
        if (parsedError.restaurant.restaurant_name) {
          apiErrorsRef.current['restaurant.restaurant_name'] = parsedError.restaurant.restaurant_name;
          setError('restaurant.restaurant_name', {
            type: 'manual',
            message: parsedError.restaurant.restaurant_name,
          });
        }

        if (parsedError.restaurant.street_address) {
          apiErrorsRef.current['restaurant.street_address'] = parsedError.restaurant.street_address;
          setError('restaurant.street_address', {
            type: 'manual',
            message: parsedError.restaurant.street_address,
          });
        }

        if (parsedError.restaurant.city) {
          apiErrorsRef.current['restaurant.city'] = parsedError.restaurant.city;
          setError('restaurant.city', {
            type: 'manual',
            message: parsedError.restaurant.city,
          });
        }

        if (parsedError.restaurant.state) {
          apiErrorsRef.current['restaurant.state'] = parsedError.restaurant.state;
          setError('restaurant.state', {
            type: 'manual',
            message: parsedError.restaurant.state,
          });
        }

        if (parsedError.restaurant.zipcode) {
          apiErrorsRef.current['restaurant.zipcode'] = parsedError.restaurant.zipcode;
          setError('restaurant.zipcode', {
            type: 'manual',
            message: parsedError.restaurant.zipcode,
          });
        }

        if (parsedError.restaurant.country) {
          apiErrorsRef.current['restaurant.country'] = parsedError.restaurant.country;
          setError('restaurant.country', {
            type: 'manual',
            message: parsedError.restaurant.country,
          });
        }

        if (parsedError.restaurant.phone) {
          apiErrorsRef.current['restaurant.phone'] = parsedError.restaurant.phone;
          setError('restaurant.phone', {
            type: 'manual',
            message: parsedError.restaurant.phone,
          });
        }

        if (parsedError.restaurant.email) {
          apiErrorsRef.current['restaurant.email'] = parsedError.restaurant.email;
          setError('restaurant.email', {
            type: 'manual',
            message: parsedError.restaurant.email,
          });
        }
      }

      // Set general error
      if (parsedError.general) {
        setError('afterSubmit', {
          type: 'manual',
          message: parsedError.general,
        });
      }

      // Navigate to step with errors if needed
      if (parsedError.first_name || parsedError.last_name || parsedError.email || parsedError.password) {
        setActiveStep(0);
      } else if (parsedError.restaurant) {
        setActiveStep(1);
      }
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="first_name"
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

              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="last_name"
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

              <Grid item xs={12}>
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

              <Grid item xs={12}>
                <RHFTextField
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password (min 8 characters)"
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:lock-outline" width={20} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} width={20} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={0}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RHFTextField
                  name="restaurant.restaurant_name"
                  label="Restaurant Name"
                  placeholder="e.g., My Restaurant"
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

              <Grid item xs={12}>
                <RHFTextField
                  name="restaurant.street_address"
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

              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="restaurant.city"
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

              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="restaurant.state"
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

              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="restaurant.zipcode"
                  label="Zip/Postal Code"
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

              <Grid item xs={12} sm={6}>
                <RHFSelect name="restaurant.country" label="Country" sx={FORM_INPUT_SX}>
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

              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="restaurant.phone"
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

              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="restaurant.email"
                  label="Restaurant Email (Optional)"
                  type="email"
                  placeholder="e.g., info@restaurant.com"
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
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        {/* Stepper */}
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          connector={<StepConnector />}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            '& .MuiStepLabel-root': {
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                fontWeight: 600,
                typography: 'subtitle2',
              },
            },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ 
          // minHeight: { xs: 280, sm: 320 }, // Commented out to reduce spacing
          mb: { xs: 0.5, sm: 1 } 
        }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: { xs: 0.5, sm: 1 } }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.25 },
            }}
          >
            Back
          </Button>

          {activeStep === STEPS.length - 1 ? (
        <LoadingButton
              fullWidth={activeStep === 0}
          type="submit"
          variant="contained"
          loading={isSubmitSuccessful || isSubmitting}
          sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                fontWeight: 600,
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.25 },
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            },
          }}
        >
              Create Account
        </LoadingButton>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                fontWeight: 600,
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.25 },
                bgcolor: 'text.primary',
                color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                '&:hover': {
                  bgcolor: 'text.primary',
                  color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                },
              }}
            >
              Next
            </Button>
          )}
        </Stack>
      </Stack>
    </FormProvider>
  );
}
