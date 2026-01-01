import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const WineInventoryValidationSchema = Yup.object().shape({
  // ===== BASIC WINE INFORMATION =====
  wineName: Yup.string()
    .required('Wine name is required')
    .trim()
    .min(2, 'Wine name must be at least 2 characters')
    .max(100, 'Wine name must not exceed 100 characters'),

  producer: Yup.string()
    .trim()
    .max(100, 'Producer name must not exceed 100 characters')
    .nullable()
    .transform((value) => (value === '' ? null : value)),

  vintage: Yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(1900, 'Vintage must be after 1900')
    .max(new Date().getFullYear() + 1, 'Vintage cannot be in the future')
    .integer('Vintage must be a whole number'),

  country: Yup.string()
    .required('Country is required')
    .trim(),

  region: Yup.string()
    .required('Region is required')
    .trim(),

  regionOther: Yup.string()
    .when('region', {
      is: 'Other',
      then: (schema) => schema
        .required('Please specify the region')
        .trim()
        .min(2, 'Region must be at least 2 characters')
        .max(100, 'Region must not exceed 100 characters'),
      otherwise: (schema) => schema.nullable(),
    }),

  description: Yup.string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters')
    .nullable()
    .transform((value) => (value === '' ? null : value)),

  // ===== CLASSIFICATION =====
  wineType: Yup.string()
    .required('Wine type is required')
    .oneOf(['Red', 'White', 'Rosé', 'Sparkling', 'Fortified', 'Dessert'], 'Invalid wine type'),

  wineProfile: Yup.string()
    .required('Wine profile is required')
    .oneOf([
      'Bone Dry – Bold Bitter Finish',
      'Bone Dry – Savory',
      'Dry – Vegetables & Herbs',
      'Dry – Tart Fruits & Flowers',
      'Dry – Ripe Fruits & Spices',
      'Dry – Fruit Sauce & Vanilla',
      'Semi-Sweet – Candied Fruit & Flowers',
      'Sweet – Fruit Jam & Chocolate',
      'Very Sweet – Figs, Raisins & Dates',
    ], 'Invalid wine profile'),

  // ===== TAGS =====
  tags: Yup.array()
    .of(Yup.string().trim().max(50, 'Tag must not exceed 50 characters'))
    .nullable()
    .default([]),

  // ===== INVENTORY - BOTTLE SIZES =====
  inventory: Yup.object().shape({
    '187.5': Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Quantity cannot be negative')
      .integer('Quantity must be a whole number'),
    '375': Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Quantity cannot be negative')
      .integer('Quantity must be a whole number'),
    '750': Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Quantity cannot be negative')
      .integer('Quantity must be a whole number'),
    '1500': Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Quantity cannot be negative')
      .integer('Quantity must be a whole number'),
    '3000': Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Quantity cannot be negative')
      .integer('Quantity must be a whole number'),
  })
    .nullable()
    .default({}),

  // ===== INVENTORY THRESHOLDS =====
  minStockLevel: Yup.number()
    .required('Minimum stock level is required')
    .min(0, 'Minimum stock level cannot be negative')
    .integer('Minimum stock level must be a whole number'),

  maxStockLevel: Yup.number()
    .required('Maximum stock level is required')
    .min(0, 'Maximum stock level cannot be negative')
    .integer('Maximum stock level must be a whole number')
    .when('minStockLevel', {
      is: (val: number) => val !== null && val !== undefined,
      then: (schema) => schema.min(Yup.ref('minStockLevel'), 'Maximum stock level must be greater than or equal to minimum stock level'),
      otherwise: (schema) => schema,
    }),

  // ===== BUSINESS INFORMATION =====
  purchasePrice: Yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(0, 'Purchase price cannot be negative'),

  supplierName: Yup.string()
    .trim()
    .max(100, 'Supplier name must not exceed 100 characters')
    .nullable()
    .transform((value) => (value === '' ? null : value)),

  locationId: Yup.string()
    .required('Restaurant location is required')
    .trim(),

  // ===== IMAGE =====
  image: Yup.mixed()
    .nullable(),
});

// ----------------------------------------------------------------------

// Export validation schema
export default WineInventoryValidationSchema;

