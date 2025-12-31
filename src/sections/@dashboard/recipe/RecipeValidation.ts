import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const RecipeValidationSchema = Yup.object().shape({
  // ===== REQUIRED FIELDS =====
  dishName: Yup.string()
    .required('Dish name is required')
    .trim()
    .min(2, 'Dish name must be at least 2 characters')
    .max(100, 'Dish name must not exceed 100 characters'),
  
  cuisineType: Yup.array()
    .min(1, 'At least one cuisine type is required')
    .required('Cuisine type is required'),
  
  centerOfPlate: Yup.string()
    .required('Center of plate is required')
    .trim(),
  
  menuClass: Yup.string()
    .required('Menu class is required')
    .trim(),

  // ===== OPTIONAL FIELDS WITH SANITIZATION =====
  
  // Numeric Fields
  preparationTime: Yup.number()
    .min(1, 'Preparation time must be at least 1 minute')
    .max(1440, 'Preparation time must not exceed 24 hours')
    .integer('Preparation time must be a whole number')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  menuPrice: Yup.number()
    .min(0, 'Menu price must be positive')
    .max(100000, 'Menu price seems too high')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  caseCost: Yup.number()
    .min(0, 'Case cost must be positive')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  caseWeight: Yup.number()
    .min(0, 'Case weight must be positive')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  servingWeight: Yup.number()
    .min(0, 'Serving weight must be positive')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  servingsInCase: Yup.number()
    .min(1, 'Servings in case must be at least 1')
    .integer('Servings must be a whole number')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  foodCostWanted: Yup.number()
    .min(0, 'Food cost percentage must be positive')
    .max(100, 'Food cost percentage cannot exceed 100%')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  
  // String Fields
  station: Yup.string()
    .trim()
    .max(100, 'Station name must not exceed 100 characters'),
  
  description: Yup.string()
    .trim()
    .max(2000, 'Description must not exceed 2000 characters'),
  
  youtubeUrl: Yup.string()
    .url('Please enter a valid URL')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  
  restaurantLocation: Yup.string()
    .trim()
    .max(200, 'Location must not exceed 200 characters'),
  
  starchTitle: Yup.string()
    .trim()
    .max(100, 'Title must not exceed 100 characters'),
  
  // Array Fields - Tags
  tags: Yup.array()
    .of(Yup.string().trim().max(50, 'Tag must not exceed 50 characters'))
    .max(20, 'Maximum 20 tags allowed'),
  
  // Array Fields - Ingredients
  ingredients: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().trim().max(100, 'Ingredient name too long'),
        quantity: Yup.number().min(0, 'Quantity must be positive'),
        unit: Yup.string().trim(),
      })
    )
    .max(100, 'Maximum 100 ingredients allowed'),
  
  essentials: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().trim().max(100, 'Essential name too long'),
        quantity: Yup.number().min(0, 'Quantity must be positive'),
        unit: Yup.string().trim(),
      })
    )
    .max(50, 'Maximum 50 essentials allowed'),
  
  // Array Fields - Steps
  starchSteps: Yup.array()
    .of(Yup.string().trim().max(500, 'Step description too long'))
    .max(50, 'Maximum 50 steps allowed'),
  
  designYourPlate: Yup.array()
    .of(Yup.string().trim().max(500, 'Step description too long'))
    .max(50, 'Maximum 50 steps allowed'),
  
  // Array Fields - Comments
  cookingDeviationComments: Yup.array()
    .of(Yup.string().trim().max(500, 'Comment too long'))
    .max(20, 'Maximum 20 comments allowed'),
  
  realtimeVariableComments: Yup.array()
    .of(Yup.string().trim().max(500, 'Comment too long'))
    .max(20, 'Maximum 20 comments allowed'),
  
  // Array Fields - Predefined Selections
  predefinedStarch: Yup.array()
    .of(Yup.string().trim())
    .max(10, 'Maximum 10 selections allowed'),
  
  predefinedVegetable: Yup.array()
    .of(Yup.string().trim())
    .max(10, 'Maximum 10 selections allowed'),
  
  predefinedIngredients: Yup.array()
    .of(Yup.string().trim())
    .max(10, 'Maximum 10 selections allowed'),
  
  // Status Fields
  availability: Yup.string()
    .oneOf(['available', 'low', 'out'], 'Invalid availability status'),
  
  status: Yup.string()
    .oneOf(['draft', 'active', 'archived'], 'Invalid status'),
});

// ----------------------------------------------------------------------

// Export validation schema
export default RecipeValidationSchema;

