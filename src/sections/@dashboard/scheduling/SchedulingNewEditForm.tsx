import { useEffect, useMemo, useState } from 'react';
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  useTheme,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IScheduling, ISchedulingForm, IDishOption, IHolidayOption } from '../../../@types/scheduling';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFSelect } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import { ProcessingDialog } from '../../../components/processing-dialog';
// validation
import SchedulingValidationSchema from './SchedulingValidation';
// services
import {
  useRecipes,
  useHolidays,
  useScheduleDishMutation,
  useUpdateScheduleDish,
  useScheduleDish,
  RecipeQueryParams,
} from '../../../services';
// hooks
import { usePermissions } from '../../../hooks/usePermissions';
import { useSubscription } from '../../../hooks/useSubscription';

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
  currentScheduling?: IScheduling;
};

// ----------------------------------------------------------------------

// Season Options
const SEASON_OPTIONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

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

export default function SchedulingNewEditForm({ isEdit = false, currentScheduling }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { hasPermission } = usePermissions();
  const { hasSubscription } = useSubscription();

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

  // Fetch recipes (non-public, non-deleted) for dropdown
  // API requires non-public dishes, so we fetch all and filter out public ones
  const recipeQueryParams: RecipeQueryParams = useMemo(() => ({
    page: 1,
    page_size: 1000,
    is_deleted: false,
  }), []);

  const { data: recipesData, isLoading: isLoadingRecipes } = useRecipes(recipeQueryParams);

  // Fetch holidays
  const { data: holidaysData, isLoading: isLoadingHolidays } = useHolidays({ page_size: 1000 });

  // Mutations
  const scheduleMutation = useScheduleDishMutation();
  const updateMutation = useUpdateScheduleDish();

  // Fetch schedule detail if editing
  const { data: scheduleDetail } = useScheduleDish(isEdit && currentScheduling ? currentScheduling.id : undefined);

  // Transform recipes to IDishOption format
  const dishes: IDishOption[] = useMemo(() => {
    if (!recipesData?.results) return [];
    // Filter out public recipes (isPublic !== true) as API requires non-public dishes
    // Also filter out deleted recipes
    return recipesData.results
      .filter((recipe) => {
        // Exclude public recipes (status === 'active' means status === 'P' in API)
        // API requires non-public dishes, so we exclude 'active' status
        // Also exclude archived/deleted recipes
        return recipe.status !== 'active' && recipe.status !== 'archived';
      })
      .map((recipe) => ({
        id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : Number(recipe.id),
        dish_name: recipe.dishName,
      }))
      .filter((dish) => !isNaN(dish.id) && dish.id > 0); // Filter out invalid IDs
  }, [recipesData]);

  // Transform holidays to IHolidayOption format
  const holidays: IHolidayOption[] = useMemo(() => {
    if (!holidaysData?.results) return [];
    return holidaysData.results
      .filter((holiday) => !holiday.isDeleted)
      .map((holiday) => ({
        id: holiday.id,
        holiday: holiday.holiday,
        created_at: holiday.createdAt,
        updated_at: holiday.updatedAt,
        is_deleted: holiday.isDeleted,
      }));
  }, [holidaysData]);

  // Use scheduleDetail if editing, otherwise use currentScheduling
  const scheduleData = isEdit && scheduleDetail ? scheduleDetail : currentScheduling;

  const defaultValues = useMemo<ISchedulingForm>(
    () => {
      const scheduleDatetimeValue = scheduleData?.scheduleDatetime || (scheduleData as any)?.schedule_datetime;
      const holidayValue = scheduleData?.holiday;
      
      // Safely parse date - ensure it's a valid Date object
      let parsedDate: Date | null = null;
      if (scheduleDatetimeValue) {
        const date = new Date(scheduleDatetimeValue);
        // Only use the date if it's valid
        if (!isNaN(date.getTime())) {
          parsedDate = date;
        }
      }
      
      // Safely get dishId - ensure it's a valid number or null
      let dishIdValue: number | null = null;
      if (scheduleData?.dish?.id) {
        const id = typeof scheduleData.dish.id === 'number' 
          ? scheduleData.dish.id 
          : parseInt(String(scheduleData.dish.id), 10);
        if (!isNaN(id) && id > 0) {
          dishIdValue = id;
        }
      }
      
      // Safely get holidayId - handle both object and number formats
      let holidayIdValue: number | null = null;
      if (holidayValue) {
        if (typeof holidayValue === 'number') {
          // Already a number
          holidayIdValue = holidayValue;
        } else if (typeof holidayValue === 'object' && holidayValue !== null) {
          // It's an object with an id property (from API response)
          const holidayObj = holidayValue as { id?: number | string };
          if ('id' in holidayObj && holidayObj.id !== undefined && holidayObj.id !== null) {
            const id = typeof holidayObj.id === 'number' 
              ? holidayObj.id 
              : parseInt(String(holidayObj.id), 10);
            if (!isNaN(id) && id > 0) {
              holidayIdValue = id;
            }
          }
        }
      }
      
      return {
        dishId: dishIdValue,
        scheduleDatetime: parsedDate,
        season: scheduleData?.season || '',
        holidayId: holidayIdValue,
      };
    },
    [scheduleData]
  );

  const methods = useForm<ISchedulingForm>({
    resolver: yupResolver(SchedulingValidationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentScheduling) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentScheduling, reset, defaultValues]);

  const onSubmit = async (data: ISchedulingForm) => {
    // Permission check
    // if (!hasPermission(isEdit ? 'edit_schedule_dish' : 'create_schedule_dish')) {
    //   enqueueSnackbar('You do not have permission to perform this action.', { variant: 'error' });
    //   return;
    // }

    // Subscription check
    if (!hasSubscription()) {
      enqueueSnackbar('You need an active subscription to perform this action.', { variant: 'error' });
      navigate(PATH_DASHBOARD.subscription);
      return;
    }

    try {
      // Clear previous errors before submission
      clearErrors();

      setProcessingDialog({
        open: true,
        state: 'processing',
        message: isEdit ? 'Updating schedule...' : 'Creating schedule...',
      });

      if (isEdit && scheduleData) {
        // Update existing schedule
        // API requires all three fields (dish, schedule_datetime, holiday) to be present
        const updatePayload: any = {
          dish: data.dishId,
          schedule_datetime: data.scheduleDatetime ? data.scheduleDatetime.toISOString() : scheduleData.scheduleDatetime,
          holiday: data.holidayId,
        };

        // Add optional fields only if they changed
        if (data.season !== scheduleData.season) {
          updatePayload.season = data.season || null;
        }

        await updateMutation.mutateAsync({
          id: scheduleData.id,
          data: updatePayload,
        });
      } else {
        // Create new schedule
        if (!data.dishId || !data.scheduleDatetime || !data.holidayId) {
          throw new Error('Dish, schedule datetime, and holiday are required.');
        }

        await scheduleMutation.mutateAsync({
          dish: data.dishId,
          schedule_datetime: data.scheduleDatetime.toISOString(),
          holiday: data.holidayId,
          season: data.season || null,
        });
      }

      setProcessingDialog({
        open: true,
        state: 'success',
        message: isEdit ? 'Schedule updated successfully!' : 'Schedule created successfully!',
      });

      setTimeout(() => {
        setProcessingDialog({ open: false, state: 'processing', message: '' });
        navigate(PATH_DASHBOARD.scheduling.list);
      }, 1500);
    } catch (error: any) {
      // Extract error data - handle both axios interceptor format and original error format
      // ScheduleDishError preserves responseData, axios interceptor returns error.response.data directly
      const errorData = error?.responseData || error?.response?.data || error?.data || error;
      let errorMessage = isEdit ? 'Failed to update schedule. Please try again.' : 'Failed to create schedule. Please try again.';

      // Handle field-specific errors and set them on form fields
      if (errorData?.dish) {
        const dishError = Array.isArray(errorData.dish) ? errorData.dish[0] : errorData.dish;
        if (dishError) {
          errorMessage = dishError;
          setError('dishId', { type: 'server', message: dishError });
        }
      } else if (errorData?.schedule_datetime) {
        const datetimeError = Array.isArray(errorData.schedule_datetime) 
          ? errorData.schedule_datetime[0] 
          : errorData.schedule_datetime;
        if (datetimeError) {
          errorMessage = datetimeError;
          setError('scheduleDatetime', { type: 'server', message: datetimeError });
        }
      } else if (errorData?.holiday) {
        const holidayError = Array.isArray(errorData.holiday) 
          ? errorData.holiday[0] 
          : errorData.holiday;
        if (holidayError) {
          errorMessage = holidayError;
          setError('holidayId', { type: 'server', message: holidayError });
        }
      } else if (errorData?.season) {
        const seasonError = Array.isArray(errorData.season) 
          ? errorData.season[0] 
          : errorData.season;
        if (seasonError) {
          errorMessage = seasonError;
          setError('season', { type: 'server', message: seasonError });
        }
      } else if (errorData?.non_field_errors) {
        const nonFieldError = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors[0] 
          : errorData.non_field_errors;
        if (nonFieldError) {
          errorMessage = nonFieldError;
        }
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setProcessingDialog({
        open: true,
        state: 'error',
        message: errorMessage,
      });

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Organize holidays into columns (3 columns)
  const holidaysPerColumn = Math.ceil(holidays.length / 3);
  const holidayColumns = [
    holidays.slice(0, holidaysPerColumn),
    holidays.slice(holidaysPerColumn, holidaysPerColumn * 2),
    holidays.slice(holidaysPerColumn * 2),
  ];

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
        {/* Select Dish & Release Date */}
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
              Schedule Information
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Select Dish */}
              <Grid item xs={12} sm={6}>
                <RHFSelect
                  name="dishId"
                  label="Select Dish"
                  disabled={isLoadingRecipes}
                  sx={FORM_INPUT_SX}
                >
                  <MenuItem value="" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                    Select Dish
                  </MenuItem>
                  {dishes.map((dish) => (
                    <MenuItem
                      key={dish.id}
                      value={dish.id}
                      sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                    >
                      {dish.dish_name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Release Date & Time */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="scheduleDatetime"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      label="Release Date & Time"
                      minDateTime={new Date()}
                      value={field.value || null}
                      onChange={(newValue) => {
                        // Only set valid dates - check if it's a valid Date object
                        if (newValue && newValue instanceof Date && !isNaN(newValue.getTime())) {
                          field.onChange(newValue);
                        } else {
                          // Set null for invalid dates
                          field.onChange(null);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          sx={FORM_INPUT_SX}
                          placeholder="dd/mm/yyyy, --:-- --"
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Seasons For Dish */}
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
              Seasons For Dish
            </Typography>

            <Controller
              name="season"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl error={!!error} fullWidth>
                  <RadioGroup
                    {...field}
                    row
                    sx={{
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      gap: { xs: 1, md: 2 },
                    }}
                  >
                    {SEASON_OPTIONS.map((season) => (
                      <FormControlLabel
                        key={season}
                        value={season}
                        control={
                          <Radio
                            sx={{
                              '& .MuiSvgIcon-root': {
                                fontSize: { xs: 20, md: 24 },
                              },
                            }}
                          />
                        }
                        label={season}
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontSize: { xs: '0.8125rem', md: '0.875rem' },
                          },
                        }}
                      />
                    ))}
                  </RadioGroup>
                  {error && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'error.main',
                        mt: 0.5,
                        fontSize: { xs: '0.75rem', md: '0.75rem' },
                      }}
                    >
                      {error.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Card>
        </Grid>

        {/* Select Holiday */}
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
              Select Holiday
            </Typography>

            <Controller
              name="holidayId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl error={!!error} fullWidth>
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    {holidayColumns.map((column, colIndex) => (
                      <Grid item xs={12} sm={6} md={4} key={colIndex}>
                        <RadioGroup
                          value={field.value?.toString() || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                        >
                          {column.map((holiday) => (
                            <FormControlLabel
                              key={holiday.id}
                              value={holiday.id.toString()}
                              control={
                                <Radio
                                  sx={{
                                    '& .MuiSvgIcon-root': {
                                      fontSize: { xs: 20, md: 24 },
                                    },
                                  }}
                                />
                              }
                              label={holiday.holiday}
                              sx={{
                                '& .MuiFormControlLabel-label': {
                                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                                },
                              }}
                            />
                          ))}
                        </RadioGroup>
                      </Grid>
                    ))}
                  </Grid>
                  {error && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'error.main',
                        mt: 0.5,
                        fontSize: { xs: '0.75rem', md: '0.75rem' },
                      }}
                    >
                      {error.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate(PATH_DASHBOARD.scheduling.list)}
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                px: { xs: 2, md: 3 },
                py: { xs: 0.75, md: 1 },
              }}
            >
              Cancel
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                px: { xs: 2, md: 3 },
                py: { xs: 0.75, md: 1 },
              }}
            >
              Schedule
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
      </FormProvider>
    </>
  );
}

