import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const SchedulingValidationSchema = Yup.object().shape({
  dishId: Yup.number()
    .required('Dish selection is required')
    .positive('Please select a valid dish'),
  
  scheduleDatetime: Yup.date()
    .required('Release date & time is required')
    .min(new Date(), 'Release date & time must be in the future'),
  
  season: Yup.string()
    .required('Season is required')
    .oneOf(['Spring', 'Summer', 'Autumn', 'Winter'], 'Please select a valid season'),
  
  holidayId: Yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value))
    .when('$holidayId', {
      is: (val: number | null) => val !== null && val !== undefined,
      then: (schema) => schema.positive('Please select a valid holiday'),
      otherwise: (schema) => schema.nullable(),
    }),
});

// ----------------------------------------------------------------------

export default SchedulingValidationSchema;

