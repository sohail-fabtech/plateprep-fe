import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const DictionaryCategoryValidationSchema = Yup.object().shape({
  // ===== REQUIRED FIELDS =====
  name: Yup.string()
    .required('Category name is required')
    .trim()
    .min(1, 'Category name is required')
    .max(255, 'Category name must not exceed 255 characters'),
  
  // ===== OPTIONAL FIELDS WITH VALIDATION =====
  description: Yup.string()
    .nullable()
    .trim()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
});

// ----------------------------------------------------------------------

// Export validation schema
export default DictionaryCategoryValidationSchema;

