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
// validation
import SchedulingValidationSchema from './SchedulingValidation';

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

// Mock API data - Replace with actual API calls
const MOCK_DISHES: IDishOption[] = [
  { id: 131, dish_name: 'test' },
  { id: 132, dish_name: 'Garden Breeze' },
  { id: 133, dish_name: 'Spicy Thai Curry' },
  { id: 134, dish_name: 'Mediterranean Delight' },
];

const MOCK_HOLIDAYS: IHolidayOption[] = [
  { id: 11, holiday: 'UFC Events', created_at: '2025-10-03T09:31:49.135470Z', updated_at: '2025-10-03T09:31:49.135489Z', is_deleted: false },
  { id: 10, holiday: 'Super Bowl Sunday', created_at: '2025-10-03T09:31:32.723579Z', updated_at: '2025-10-03T09:31:32.723598Z', is_deleted: false },
  { id: 9, holiday: 'Labor Day', created_at: '2025-10-03T09:31:11.348579Z', updated_at: '2025-10-03T09:31:11.348599Z', is_deleted: false },
  { id: 8, holiday: 'Memorial Day', created_at: '2025-10-03T09:31:01.219719Z', updated_at: '2025-10-03T09:31:01.219749Z', is_deleted: false },
  { id: 7, holiday: '4th of July', created_at: '2025-10-03T09:30:40.701224Z', updated_at: '2025-10-03T09:30:40.701244Z', is_deleted: false },
  { id: 6, holiday: 'Mothers day', created_at: '2025-10-03T09:30:22.887950Z', updated_at: '2025-10-03T09:30:22.887969Z', is_deleted: false },
  { id: 5, holiday: 'Thanksgiving', created_at: '2025-10-03T09:29:57.474172Z', updated_at: '2025-10-03T09:29:57.474193Z', is_deleted: false },
  { id: 4, holiday: 'Easter', created_at: '2025-10-03T09:29:40.074395Z', updated_at: '2025-10-03T09:29:40.074415Z', is_deleted: false },
  { id: 3, holiday: 'NY Eve', created_at: '2025-10-03T09:29:29.899164Z', updated_at: '2025-10-03T09:29:29.899185Z', is_deleted: false },
  { id: 2, holiday: 'Christmas', created_at: '2025-10-03T09:28:06.690754Z', updated_at: '2025-10-03T09:28:06.690776Z', is_deleted: false },
];

export default function SchedulingNewEditForm({ isEdit = false, currentScheduling }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [dishes, setDishes] = useState<IDishOption[]>(MOCK_DISHES);
  const [holidays, setHolidays] = useState<IHolidayOption[]>(MOCK_HOLIDAYS);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  // Fetch dishes from API
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoadingDishes(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/dishes/');
        // const data = await response.json();
        // setDishes(data);
        setDishes(MOCK_DISHES);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        setDishes(MOCK_DISHES);
      } finally {
        setLoadingDishes(false);
      }
    };
    fetchDishes();
  }, []);

  // Fetch holidays from API (with pagination support)
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoadingHolidays(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/select-holiday/');
        // const data = await response.json();
        // setHolidays(data.results);
        setHolidays(MOCK_HOLIDAYS);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        setHolidays(MOCK_HOLIDAYS);
      } finally {
        setLoadingHolidays(false);
      }
    };
    fetchHolidays();
  }, []);

  const defaultValues = useMemo<ISchedulingForm>(
    () => ({
      dishId: currentScheduling?.dish.id || null,
      scheduleDatetime: currentScheduling?.schedule_datetime
        ? new Date(currentScheduling.schedule_datetime)
        : null,
      season: currentScheduling?.season || '',
      holidayId: currentScheduling?.holiday?.id || null,
    }),
    [currentScheduling]
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
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('SCHEDULING DATA', data);
      enqueueSnackbar(!isEdit ? 'Schedule created successfully!' : 'Schedule updated successfully!');
      navigate(PATH_DASHBOARD.scheduling.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
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
                  disabled={loadingDishes}
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
                      {...field}
                      label="Release Date & Time"
                      minDateTime={new Date()}
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
  );
}

