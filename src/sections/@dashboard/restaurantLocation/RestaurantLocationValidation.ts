import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const RestaurantLocationValidationSchema = Yup.object().shape({
  // ===== REQUIRED FIELDS =====
  branchName: Yup.string()
    .required('Location name is required')
    .trim()
    .min(1, 'Location name is required')
    .max(255, 'Location name must not exceed 255 characters'),
  
  // ===== OPTIONAL FIELDS WITH VALIDATION =====
  branchLocation: Yup.string()
    .nullable()
    .trim()
    .max(255, 'Address must not exceed 255 characters')
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  phoneNumber: Yup.string()
    .nullable()
    .trim()
    .matches(/^[\d\s\-\+\(\)]*$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must not exceed 20 characters')
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  email: Yup.string()
    .nullable()
    .email('Please enter a valid email address')
    .trim()
    .max(254, 'Email must not exceed 254 characters')
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  socialMedia: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .required('Social media name is required')
          .trim()
          .max(50, 'Social media name must not exceed 50 characters'),
        url: Yup.string()
          .required('URL is required')
          .url('Please enter a valid URL')
          .trim()
          .max(500, 'URL must not exceed 500 characters'),
      })
    )
    .nullable()
    .default([]),
});

// ----------------------------------------------------------------------

// Export validation schema
export default RestaurantLocationValidationSchema;

