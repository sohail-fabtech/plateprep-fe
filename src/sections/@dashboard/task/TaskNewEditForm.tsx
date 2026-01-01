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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { ITask, ITaskForm } from '../../../@types/task';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
// validation
import TaskValidationSchema from './TaskValidation';
// sections
import VideoUploadZone from './form/VideoUploadZone';

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
  currentTask?: ITask;
};

// ----------------------------------------------------------------------

// Dropdown Options
const TASK_TYPE_OPTIONS = ['Prep Mise En Place', 'Cook Dish', 'Plate Dish', 'Clean Station', 'Other'];
const DISH_OPTIONS = ['Garden Breeze', 'Event On A Budget', 'Don\'t Waste Time', 'Mediterranean Delight'];
const KITCHEN_STATION_OPTIONS = [
  'Baking/Pastry Station',
  'Grill Station',
  'Sauté Station',
  'Fry Station',
  'Cold Station',
  'Prep Station',
];
const STAFF_OPTIONS = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Chef Robert'];

// Consistent Form Styling System (Matching Recipe Form)
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

export default function TaskNewEditForm({ isEdit = false, currentTask }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const defaultValues = useMemo<ITaskForm>(
    () => ({
      taskType: currentTask?.taskName || '',
      taskName: '',
      dishSelection: '',
      kitchenStation: '',
      assignTo: currentTask?.staffName || '',
      email: '',
      taskStartTime: null,
      taskCompletionTime: null,
      dueDate: currentTask?.dueDate ? new Date(currentTask.dueDate) : null,
      videoLink: '',
      video: null,
      priority: currentTask?.priority || 'medium',
      description: currentTask?.taskDescription || '',
      status: currentTask?.status || 'draft',
    }),
    [currentTask]
  );

  const methods = useForm<ITaskForm>({
    resolver: yupResolver(TaskValidationSchema),
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
    if (isEdit && currentTask) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentTask, reset, defaultValues]);

  const onSubmit = async (data: ITaskForm) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('TASK DATA', data);
      enqueueSnackbar(!isEdit ? 'Task created successfully!' : 'Task updated successfully!');
      navigate(PATH_DASHBOARD.tasks.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  };

  const onSaveDraft = async () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handleVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setValue('video', { url, name: file.name, type: 'preparation' });
  };

  const handleVideoRemove = () => {
    setValue('video', null);
  };

  const handleVideoTypeChange = (type: 'preparation' | 'presentation') => {
    if (values.video) {
      setValue('video', { ...values.video, type });
    }
  };

  // Check if "Other" is selected to show custom task name input
  const isOtherSelected = values.taskType === 'Other';

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Basic Task Information */}
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
              Basic Task Information
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Task Type */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="taskType" label="Task Type" sx={FORM_INPUT_SX}>
                  {TASK_TYPE_OPTIONS.map((option) => (
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

              {/* Conditional Rendering: Show Dish Selection OR Task Name Input */}
              {!isOtherSelected ? (
                <Grid item xs={12} sm={6} md={4}>
                  <RHFSelect name="dishSelection" label="Select Dish" sx={FORM_INPUT_SX}>
                    {DISH_OPTIONS.map((option) => (
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
              ) : (
                <Grid item xs={12} sm={6} md={4}>
                  <RHFTextField
                    name="taskName"
                    label="Enter Task Name"
                    placeholder="Enter your custom task name"
                    sx={FORM_INPUT_SX}
                  />
                </Grid>
              )}

              {/* Kitchen Station */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="kitchenStation" label="Kitchen Station" sx={FORM_INPUT_SX}>
                  {KITCHEN_STATION_OPTIONS.map((option) => (
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

              {/* Assign To */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFSelect name="assignTo" label="Assign To" sx={FORM_INPUT_SX}>
                  {STAFF_OPTIONS.map((option) => (
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

              {/* Email Address */}
              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField
                  name="email"
                  label="Email Address (Optional)"
                  type="email"
                  placeholder="staff@restaurant.com"
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

        {/* Task Scheduling */}
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
              Task Scheduling
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Task Start Time */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="taskStartTime"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      {...field}
                      label="Task Start Time"
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

              {/* Task Completion Time */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="taskCompletionTime"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      {...field}
                      label="Task Completion Time"
                      minDateTime={values.taskStartTime || undefined}
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

              {/* Due Date */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      {...field}
                      label="Due Date & Time"
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
            </Grid>
          </Card>
        </Grid>

        {/* Priority & Description */}
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
              Priority & Description
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Priority */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel
                    component="legend"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    Priority Level
                  </FormLabel>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value="low"
                          control={<Radio size="small" />}
                          label="Low"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel
                          value="medium"
                          control={<Radio size="small" />}
                          label="Medium"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel
                          value="high"
                          control={<Radio size="small" />}
                          label="High"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                        <FormControlLabel
                          value="urgent"
                          control={<Radio size="small" />}
                          label="Urgent"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            },
                          }}
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              {/* Task Description */}
              <Grid item xs={12}>
                <RHFTextField
                  name="description"
                  label="Task Description"
                  multiline
                  rows={6}
                  placeholder="Enter detailed task description, instructions, or special notes..."
                  sx={FORM_INPUT_SX}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Additional Resources */}
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
              Additional Resources (Optional)
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Video Link */}
              <Grid item xs={12}>
                <RHFTextField
                  name="videoLink"
                  label="Add Video Link"
                  placeholder="https://youtube.com/watch?v=..."
                  sx={FORM_INPUT_SX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:link-2-outline" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Upload Video - Using VideoUploadZone */}
              <Grid item xs={12}>
                <Controller
                  name="video"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <VideoUploadZone
                      video={field.value}
                      onUpload={handleVideoUpload}
                      onRemove={handleVideoRemove}
                      onTypeChange={handleVideoTypeChange}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
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
              onClick={() => navigate(PATH_DASHBOARD.tasks.list)}
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

            {/* <LoadingButton
              variant="outlined"
              size="large"
              loading={isSubmitting}
              onClick={onSaveDraft}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }}
            >
              Save as Draft
            </LoadingButton> */}

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
            >
              {isEdit ? 'Update Task' : 'Create Task'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

