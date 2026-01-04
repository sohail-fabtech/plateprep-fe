import * as Yup from 'yup';

// ----------------------------------------------------------------------

export interface AIRecipeGenerationFormValues {
  cuisine_style: string;
  menu_class: string;
  seasonalIngredients: string;
  dietary_preferences?: string;
  dietary_restrictions: string;
  available_ingredients: string;
  price_range: number;
  target_audience: string;
  theme?: string;
  status: string;
  priority: string;
}

export const AIRecipeGenerationValidationSchema = Yup.object().shape({
  cuisine_style: Yup.string().required('Cuisine Type is required'),
  menu_class: Yup.string().required('Menu Class is required'),
  seasonalIngredients: Yup.string().required('Seasonal Ingredients is required'),
  dietary_preferences: Yup.string().optional(),
  dietary_restrictions: Yup.string().required('Dietary Restrictions is required'),
  available_ingredients: Yup.string().required('Available Ingredients is required'),
  price_range: Yup.number()
    .min(0, 'Price range must be at least 0')
    .max(100, 'Price range must be at most 100')
    .required('Menu Price is required'),
  target_audience: Yup.string().required('Target Audience is required'),
  theme: Yup.string().optional(),
  status: Yup.string().default('not_started'),
  priority: Yup.string().default('normal'),
});

