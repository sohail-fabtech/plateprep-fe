import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const RestaurantLocationValidationSchema = Yup.object().shape({
  // ===== REQUIRED FIELDS =====
  branchName: Yup.string()
    .required('Location name is required')
    .trim()
    .min(2, 'Location name must be at least 2 characters')
    .max(100, 'Location name must not exceed 100 characters'),
  
  branchLocation: Yup.string()
    .required('Address is required')
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters'),
  
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must not exceed 20 characters'),
  
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .trim()
    .max(100, 'Email must not exceed 100 characters'),

  // ===== OPTIONAL FIELDS WITH VALIDATION =====
  
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

