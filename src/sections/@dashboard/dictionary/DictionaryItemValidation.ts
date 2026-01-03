import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const DictionaryItemValidationSchema = Yup.object().shape({
  // ===== REQUIRED FIELDS =====
  term: Yup.string()
    .required('Term is required')
    .trim()
    .min(1, 'Term is required')
    .max(255, 'Term must not exceed 255 characters'),
  
  category: Yup.number()
    .required('Category is required')
    .integer('Category must be a valid ID')
    .positive('Category must be a valid ID'),
  
  // ===== OPTIONAL FIELDS WITH VALIDATION =====
  definition: Yup.string()
    .nullable()
    .trim()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  description: Yup.string()
    .nullable()
    .trim()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
});

// ----------------------------------------------------------------------

// Export validation schema
export default DictionaryItemValidationSchema;

