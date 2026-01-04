import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const SchedulingValidationSchema = Yup.object().shape({
  dishId: Yup.number()
    .typeError('Please select a valid dish')
    .transform((value, originalValue) => {
      // Handle empty string, null, undefined - return undefined so required() can catch it
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      // Convert to number
      const num = Number(originalValue);
      // Return undefined if conversion results in NaN
      return isNaN(num) ? undefined : num;
    })
    .required('Dish selection is required')
    .positive('Please select a valid dish')
    .integer('Please select a valid dish'),
  
  scheduleDatetime: Yup.date()
    .required('Release date & time is required')
    .typeError('Please select a valid date and time')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
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

