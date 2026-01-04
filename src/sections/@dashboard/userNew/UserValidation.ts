import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const UserValidationSchema = Yup.object().shape({
  // ===== REQUIRED FIELDS =====
  firstName: Yup.string()
    .required('First name is required')
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  
  lastName: Yup.string()
    .required('Last name is required')
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .trim()
    .max(100, 'Email must not exceed 100 characters'),
  
  phoneNumber: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .when('$isEdit', {
      is: false,
      then: (schema) =>
        schema
          .required('Phone number is required')
          .trim()
          .matches(/^[\d\s\-\+\(\)]+$/, 'Phone number can only contain digits, +, -, (), and spaces.')
          .min(10, 'Phone number must be at least 10 characters')
          .max(20, 'Phone number must not exceed 20 characters'),
      otherwise: (schema) =>
        schema
          .trim()
          .matches(/^[\d\s\-\+\(\)]*$/, 'Phone number can only contain digits, +, -, (), and spaces.')
          .max(20, 'Phone number must not exceed 20 characters'),
    }),
  
  streetAddress: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .trim()
    .max(256, 'Street address must not exceed 256 characters'),
  
  city: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .trim()
    .max(256, 'City must not exceed 256 characters'),
  
  stateProvince: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .trim()
    .max(256, 'State/Province must not exceed 256 characters'),
  
  postalCode: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .trim()
    .max(20, 'Postal code must not exceed 20 characters'),
  
  country: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .trim()
    .max(256, 'Country must not exceed 256 characters'),
  
  role: Yup.string()
    .default('A')
    .oneOf(['SA', 'A', 'HF', 'S'], 'Invalid role'),
  
  userRoleId: Yup.number()
    .nullable()
    .transform((value) => (value === '' || value === 0 ? null : value))
    .test('min-value', 'User role ID must be greater than 0', function (value) {
      if (value === null || value === undefined) return true; // Allow null/undefined
      return value >= 1;
    }),
  
  branchId: Yup.number()
    .nullable()
    .transform((value) => (value === '' || value === 0 ? null : value))
    .test('min-value', 'Branch ID must be greater than 0', function (value) {
      if (value === null || value === undefined) return true; // Allow null/undefined
      return value >= 1;
    }),

  // ===== OPTIONAL FIELDS WITH VALIDATION =====
  
  dateOfBirth: Yup.date()
    .nullable()
    .max(new Date(), 'Date of birth cannot be in the future')
    .test('age', 'User must be at least 18 years old to work here', function (value) {
      if (!value) return true; // Allow null/empty dates
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    })
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  password: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .when('$isEdit', {
      is: false,
      then: (schema) => schema
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must not exceed 100 characters'),
      otherwise: (schema) => schema
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must not exceed 100 characters'),
    }),
  
  isActive: Yup.boolean()
    .default(true),
  
  profileImage: Yup.mixed()
    .nullable(),
});

// ----------------------------------------------------------------------

// Export validation schema
export default UserValidationSchema;
