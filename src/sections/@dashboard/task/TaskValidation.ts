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
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  taskCompletionTime: Yup.date()
    .nullable()
    .when('taskStartTime', {
      is: (val: Date) => val instanceof Date && !isNaN(val.getTime()),
      then: (schema) => schema
        .min(Yup.ref('taskStartTime'), 'Completion time must be after start time'),
      otherwise: (schema) => schema,
    })
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  dueDate: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  videoLink: Yup.string()
    .url('Please enter a valid URL')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  
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

