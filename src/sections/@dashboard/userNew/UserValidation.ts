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
    .required('Phone number is required')
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must not exceed 20 characters'),
  
  streetAddress: Yup.string()
    .required('Street address is required')
    .trim()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must not exceed 200 characters'),
  
  city: Yup.string()
    .required('City is required')
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),
  
  stateProvince: Yup.string()
    .required('State/Province is required')
    .trim()
    .min(2, 'State/Province must be at least 2 characters')
    .max(100, 'State/Province must not exceed 100 characters'),
  
  postalCode: Yup.string()
    .required('Postal code is required')
    .trim()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must not exceed 20 characters'),
  
  country: Yup.string()
    .required('Country is required')
    .trim(),
  
  role: Yup.string()
    .required('Role is required')
    .oneOf(['A', 'M', 'S'], 'Invalid role'),
  
  userRoleId: Yup.number()
    .required('User role is required')
    .min(1, 'User role is required'),
  
  branchId: Yup.number()
    .required('Branch is required')
    .min(1, 'Branch is required'),

  // ===== OPTIONAL FIELDS WITH VALIDATION =====
  
  dateOfBirth: Yup.date()
    .nullable()
    .max(new Date(), 'Date of birth cannot be in the future')
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
