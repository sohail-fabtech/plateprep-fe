import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const TaskValidationSchema = Yup.object().shape({
  // ===== REQUIRED FIELDS =====
  taskType: Yup.string()
    .required('Task type is required')
    .trim(),
  
  taskName: Yup.string()
    .when('taskType', {
      is: 'other',
      then: (schema) => schema
        .required('Task name is required')
        .trim()
        .min(2, 'Task name must be at least 2 characters')
        .max(100, 'Task name must not exceed 100 characters'),
      otherwise: (schema) => schema.nullable(),
    }),
  
  dishSelection: Yup.string()
    .when('taskType', {
      is: (val: string) => val !== 'other',
      then: (schema) => schema.required('Dish selection is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  
  kitchenStation: Yup.string()
    .required('Kitchen station is required')
    .trim(),
  
  assignTo: Yup.string()
    .required('Assignment is required')
    .trim(),
  
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority'),

  // ===== OPTIONAL FIELDS WITH VALIDATION =====
  
  email: Yup.string()
    .email('Please enter a valid email address')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  
  taskStartTime: Yup.date()
    .nullable()
    .typeError('Please enter a valid date and time')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .test(
      'not-past',
      'Start time cannot be in the past',
      function (value) {
        if (!value) return true; // Allow null/empty
        const now = new Date();
        // Allow 5 minutes buffer for clock differences
        const buffer = 5 * 60 * 1000; // 5 minutes in milliseconds
        return value.getTime() >= (now.getTime() - buffer);
      }
    )
    .test(
      'not-too-far-future',
      'Start time cannot be more than 1 year in the future',
      function (value) {
        if (!value) return true; // Allow null/empty
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return value.getTime() <= oneYearFromNow.getTime();
      }
    ),
  
  taskCompletionTime: Yup.date()
    .nullable()
    .typeError('Please enter a valid date and time')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .when('taskStartTime', {
      is: (val: Date) => val instanceof Date && !isNaN(val.getTime()),
      then: (schema) => schema
        .required('Completion time is required when start time is set')
        .min(
          Yup.ref('taskStartTime'),
          'Completion time must be after start time'
        )
        .test(
          'reasonable-duration',
          'Task duration cannot exceed 24 hours',
          function (value) {
            if (!value || !this.parent.taskStartTime) return true;
            const startTime = new Date(this.parent.taskStartTime);
            const completionTime = new Date(value);
            const durationMs = completionTime.getTime() - startTime.getTime();
            const maxDurationMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            return durationMs <= maxDurationMs;
          }
        )
        .test(
          'minimum-duration',
          'Task must have a minimum duration of 1 minute',
          function (value) {
            if (!value || !this.parent.taskStartTime) return true;
            const startTime = new Date(this.parent.taskStartTime);
            const completionTime = new Date(value);
            const durationMs = completionTime.getTime() - startTime.getTime();
            const minDurationMs = 60 * 1000; // 1 minute in milliseconds
            return durationMs >= minDurationMs;
          }
        ),
      otherwise: (schema) => schema,
    })
    .test(
      'start-time-required',
      'Start time must be set before completion time',
      function (value) {
        if (!value) return true; // Allow null/empty
        return !!this.parent.taskStartTime;
      }
    ),
  
  dueDate: Yup.date()
    .nullable()
    .typeError('Please enter a valid date and time')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .test(
      'not-past',
      'Due date cannot be in the past',
      function (value) {
        if (!value) return true; // Allow null/empty
        const now = new Date();
        // Allow 5 minutes buffer for clock differences
        const buffer = 5 * 60 * 1000; // 5 minutes in milliseconds
        return value.getTime() >= (now.getTime() - buffer);
      }
    )
    .test(
      'not-too-far-future',
      'Due date cannot be more than 1 year in the future',
      function (value) {
        if (!value) return true; // Allow null/empty
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return value.getTime() <= oneYearFromNow.getTime();
      }
    )
    .when('taskStartTime', {
      is: (val: Date) => val instanceof Date && !isNaN(val.getTime()),
      then: (schema) => schema
        .min(
          Yup.ref('taskStartTime'),
          'Due date must be after or equal to start time'
        ),
      otherwise: (schema) => schema,
    })
    .when('taskCompletionTime', {
      is: (val: Date) => val instanceof Date && !isNaN(val.getTime()),
      then: (schema) => schema
        .min(
          Yup.ref('taskCompletionTime'),
          'Due date must be after or equal to completion time'
        ),
      otherwise: (schema) => schema,
    }),
  
  videoLink: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .test(
      'valid-url',
      'Please enter a valid URL',
      function (value) {
        if (!value) return true; // Allow null/empty
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    )
    .test(
      'url-format',
      'URL must start with http:// or https://',
      function (value) {
        if (!value) return true; // Allow null/empty
        return value.startsWith('http://') || value.startsWith('https://');
      }
    ),
  
  description: Yup.string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters'),
  
  // File upload
  video: Yup.mixed()
    .nullable(),
  
  status: Yup.string()
    .oneOf(['draft', 'pending', 'in-progress', 'completed', 'cancelled'], 'Invalid status'),
});

// ----------------------------------------------------------------------

// Export validation schema
export default TaskValidationSchema;

