// Recipe API Adapter - Transforms API response to UI format

import { IRecipe, IIngredient, IPreparationStep } from '../@types/recipe';
import { IRecipeApiResponse, STATUS_MAP, AVAILABILITY_MAP } from '../@types/recipeApi';

/**
 * Transforms API response to internal IRecipe format
 * Handles snake_case to camelCase conversion and nested object mapping
 */
export function transformApiResponseToRecipe(apiResponse: IRecipeApiResponse): IRecipe {
  // Helper: Parse numeric string to number
  const parseNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper: Extract numeric value from time string (e.g., "30 mint" → 30)
  const parseTimeString = (timeStr: string): number => {
    const match = timeStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Transform ingredients (need id, title, quantity, unit)
  const ingredients: IIngredient[] = apiResponse.ingredient.map((ing, index) => ({
    id: String(ing.id || index + 1),
    title: ing.title,
    quantity: parseNumber(ing.quantity),
    unit: ing.unit || '',
  }));

  // Transform essentials (no unit in API)
  const essentialIngredients: IIngredient[] = apiResponse.essential.map((ess, index) => ({
    id: String(ess.id || index + 1),
    title: ess.title,
    quantity: parseNumber(ess.quantity),
    unit: '', // Essentials don't have units as per requirement
  }));

  // Transform preparation steps (need id, stepNumber, description)
  const steps: IPreparationStep[] = apiResponse.steps.map((step, index) => ({
    id: String(step.id || index + 1),
    stepNumber: index + 1,
    description: step.title,
  }));

  // Transform starch preparation steps to IPreparationStep[]
  const starchSteps: IPreparationStep[] = apiResponse.starch_preparation?.steps?.map((step, index) => ({
    id: String(step.id || index + 1),
    stepNumber: index + 1,
    description: step.step,
  })) || [];

  // Transform design your plate steps to IPreparationStep[]
  const plateDesignSteps: IPreparationStep[] = apiResponse.design_your_plate?.steps?.map((step, index) => ({
    id: String(step.id || index + 1),
    stepNumber: index + 1,
    description: step.step,
  })) || [];

  // Transform tags (extract just the names)
  const tags: string[] = apiResponse.tags.map((tag) => tag.name);

  // Transform images (extract URLs)
  const imageFiles: string[] = apiResponse.recipe_image.map((img) => img.image_url);

  // Transform predefined items (extract names)
  const predefinedIngredients: string[] = apiResponse.predefined_ingredients.map((item) => item.name);
  const predefinedStarch: string[] = apiResponse.predefined_starch.map((item) => item.name);
  const predefinedVegetable: string[] = apiResponse.predefined_vegetables.map((item) => item.name);

  // Map status from API format (P/D/A) to internal format (active/draft/archived)
  const status = STATUS_MAP[apiResponse.status.value] || 'draft';

  // Map availability
  const isAvailable = AVAILABILITY_MAP[apiResponse.availability.value] ?? true;

  // Build the IRecipe object
  const recipe: IRecipe = {
    id: String(apiResponse.id),
    dishName: apiResponse.dish_name || '',
    cuisineType: apiResponse.cusinie_type?.category_name || 'N/A',
    preparationTime: parseTimeString(apiResponse.preparation_time || '0'),
    foodCost: parseNumber(apiResponse.food_cost || '0'),
    station: apiResponse.station_to_prepare_dish || '',
    youtubeUrl: apiResponse.youtube_url || '',
    description: apiResponse.description || '',
    tags,
    imageFiles,
    videoFile: apiResponse.manual_video || apiResponse.video || '',
    
    // Ingredients & Essentials
    ingredients,
    essentialIngredients,
    
    // Preparation Steps
    steps,
    
    // Starch Preparation
    starchPreparation: {
      type: apiResponse.starch_preparation?.title || '',
      steps: starchSteps,
      cookingTime: 30, // Default, can be calculated if available in API
    },
    
    // Costing (without servingsInCase - not in ICostingInfo type)
    costing: {
      caseCost: parseNumber(apiResponse.caseCost || '0'),
      caseWeightLb: parseNumber(apiResponse.caseWeightLb || '0'),
      servingWeightOz: parseNumber(apiResponse.servingWeightOz || '0'),
      costPerServing: parseNumber(apiResponse.costPerServing || '0'),
      foodCostPct: parseNumber(apiResponse.foodCostPct || '0'),
      salePrice: parseNumber(apiResponse.salePrice || '0'),
      manualCostPerServing: parseNumber(apiResponse.manualCostPerServing || '0'),
    },
    
    // Plate Design (with required platingSteps)
    plateDesign: {
      centerOfPlate: {
        category: apiResponse.center_of_plate || '',
        subcategory: apiResponse.main_dish || '',
      },
      platingSteps: plateDesignSteps,
    },
    
    // Status & Availability
    status,
    isAvailable,
    isPublic: apiResponse.status.value === 'P',
    
    // Branch
    branchId: apiResponse.branch?.id || '',
    
    // Comments (keep as arrays with IDs for individual editing)
    cookingDeviationComments: apiResponse.Cooking_Deviation_Comment.map((comment) => ({
      id: String(comment.id),
      step: comment.step,
    })),
    realtimeVariableComments: apiResponse.Real_time_Variable_Comment.map((comment) => ({
      id: String(comment.id),
      step: comment.step,
    })),
    
    // Wine Pairings (keep as arrays with IDs for individual editing)
    winePairings: apiResponse.wine_pairing.map((wine) => ({
      id: String(wine.id),
      wine_name: wine.wine_name,
      wine_type: wine.wine_type,
      flavor: wine.flavor,
      profile: wine.profile,
      reason_for_pairing: wine.reason_for_pairing,
      proteins: wine.proteins || '',
      region_name: wine.region_name || '',
    })),
    
    // Meta
    createdAt: apiResponse.created_at,
    updatedAt: apiResponse.updated_at,
    createdBy: `User-${apiResponse.resturant}`, // Placeholder
    updatedBy: `User-${apiResponse.resturant}`, // Placeholder
  };

  return recipe;
}

/**
 * Transforms internal IRecipe format to API request format
 * Used when saving/updating recipes
 * @param recipe - Recipe data in internal format
 * @param menuCategories - Optional menu categories for cuisine type conversion
 */
// API Request type (different from response - uses different field names)
export interface IRecipeApiRequest {
  dish_name?: string;
  description?: string;
  preparation_time?: string;
  station_to_prepare_dish?: string;
  youtube_url?: string;
  manual_video?: string;
  center_of_plate?: string;
  main_dish?: string;
  cusinie_type?: string;
  availability?: string;
  status?: string;
  is_draft?: boolean;
  is_schedule?: boolean;
  caseCost?: string;
  caseWeightLb?: string;
  servingWeightOz?: string;
  servingsInCase?: string;
  costPerServing?: string;
  foodCostPct?: string;
  salePrice?: string;
  manualCostPerServing?: string;
  food_cost?: string;
  ingredients?: Array<{
    id?: number;
    title: string;
    quantity: string;
    unit: string;
  }>;
  essential?: Array<{
    id?: number;
    title: string;
    quantity: string;
    unit: string;
  }>;
  steps?: Array<{
    id?: number;
    title: string;
  }>;
  tags?: Array<{
    id?: number;
    name: string;
  }>;
  starch_preparation?: {
    id?: number;
    title: string;
    steps: Array<{
      id?: number;
      step: string;
    }>;
  };
  starch_preparation_image?: string;
  design_your_plate?: {
    id?: number;
    steps: Array<{
      id?: number;
      step: string;
    }>;
  };
  plate_design_image?: string;
  cooking_deviation_comment?: Array<{
    id?: number;
    step: string;
  }>;
  real_time_variable_comment?: Array<{
    id?: number;
    step: string;
  }>;
  recipe_image?: string[];
  wine_pairing?: number[];
}

export function transformRecipeToApiRequest(
  recipe: Partial<IRecipe>,
  menuCategories?: Array<{ id: number; categoryName: string }>
): IRecipeApiRequest {
  // Helper: Format number to string with 2 decimals
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return '0.00';
    return value.toFixed(2);
  };

  const apiRequest: IRecipeApiRequest = {};

  // Basic fields
  if (recipe.dishName !== undefined) apiRequest.dish_name = recipe.dishName;
  if (recipe.description !== undefined) apiRequest.description = recipe.description;
  if (recipe.station !== undefined) apiRequest.station_to_prepare_dish = recipe.station;
  if (recipe.youtubeUrl !== undefined) apiRequest.youtube_url = recipe.youtubeUrl;
  if (recipe.preparationTime !== undefined) {
    apiRequest.preparation_time = `${recipe.preparationTime} mint`;
  }

  // Cuisine Type - Convert name to ID using menu categories
  if (recipe.cuisineType !== undefined && menuCategories) {
    const category = menuCategories.find(
      (cat) => cat.categoryName.toLowerCase() === (recipe.cuisineType || '').toLowerCase()
    );
    if (category) {
      // API expects cusinie_type as string ID
      apiRequest.cusinie_type = String(category.id);
    }
  } else if (recipe.cuisineType !== undefined) {
    // If menu categories not provided, backend should handle mapping the name to ID
    // This maintains backward compatibility
  }

  // Center of Plate
  if (recipe.plateDesign?.centerOfPlate?.category !== undefined) {
    apiRequest.center_of_plate = recipe.plateDesign.centerOfPlate.category;
  }
  if (recipe.plateDesign?.centerOfPlate?.subcategory !== undefined) {
    apiRequest.main_dish = recipe.plateDesign.centerOfPlate.subcategory;
  }

  // Ingredients array
  if (recipe.ingredients !== undefined) {
    apiRequest.ingredients = recipe.ingredients.map((ing) => ({
      ...(ing.id && { id: parseInt(ing.id, 10) }),
      title: ing.title,
      quantity: String(ing.quantity),
      unit: ing.unit || '',
    }));
  }

  // Essential tools array
  if (recipe.essentialIngredients !== undefined) {
    apiRequest.essential = recipe.essentialIngredients.map((ess) => ({
      ...(ess.id && { id: parseInt(ess.id, 10) }),
      title: ess.title,
      quantity: String(ess.quantity),
      unit: ess.unit || '',
    }));
  }

  // Preparation steps array
  if (recipe.steps !== undefined) {
    apiRequest.steps = recipe.steps.map((step) => ({
      ...(step.id && { id: parseInt(step.id, 10) }),
      title: step.description,
    }));
  }

  // Tags array
  if (recipe.tags !== undefined) {
    // Tags are stored as strings in IRecipe, but API expects objects with id and name
    // For updates, we'll need to preserve existing tag IDs if available
    // For now, we'll create new tags (backend will handle duplicates)
    apiRequest.tags = recipe.tags.map((tag) => ({
      name: tag,
    }));
  }

  // Starch preparation object
  if (recipe.starchPreparation !== undefined) {
    const starchPrep = recipe.starchPreparation;
    // Only include if there are steps or a title
    if (starchPrep.steps?.length > 0 || starchPrep.type) {
      apiRequest.starch_preparation = {
        title: starchPrep.type || '',
        steps: (starchPrep.steps || []).map((step) => ({
          ...(step.id && { id: parseInt(step.id, 10) }),
          step: step.description,
        })),
      };
    }
  }

  // Design your plate object
  if (recipe.plateDesign?.platingSteps !== undefined) {
    const plateDesign = recipe.plateDesign;
    // Only include if there are steps
    if (plateDesign.platingSteps?.length > 0) {
      apiRequest.design_your_plate = {
        steps: plateDesign.platingSteps.map((step) => ({
          ...(step.id && { id: parseInt(step.id, 10) }),
          step: step.description,
        })),
      };
    }
  }

  // Cooking deviation comments array
  if (recipe.cookingDeviationComments !== undefined) {
    apiRequest.cooking_deviation_comment = recipe.cookingDeviationComments.map((comment) => ({
      ...(comment.id && { id: parseInt(comment.id, 10) }),
      step: comment.step,
    }));
  }

  // Real-time variable comments array
  if (recipe.realtimeVariableComments !== undefined) {
    apiRequest.real_time_variable_comment = recipe.realtimeVariableComments.map((comment) => ({
      ...(comment.id && { id: parseInt(comment.id, 10) }),
      step: comment.step,
    }));
  }

  // Wine pairings array (API expects array of wine IDs)
  if (recipe.winePairings !== undefined) {
    apiRequest.wine_pairing = recipe.winePairings
      .map((wine) => (wine.id ? parseInt(wine.id, 10) : null))
      .filter((id): id is number => id !== null);
  }

  // Recipe images array (API expects array of URLs)
  if (recipe.imageFiles !== undefined) {
    apiRequest.recipe_image = recipe.imageFiles;
  }

  // Costing
  if (recipe.costing) {
    if (recipe.costing.caseCost !== undefined) {
      apiRequest.caseCost = formatNumber(recipe.costing.caseCost);
    }
    if (recipe.costing.caseWeightLb !== undefined) {
      apiRequest.caseWeightLb = formatNumber(recipe.costing.caseWeightLb);
    }
    if (recipe.costing.servingWeightOz !== undefined) {
      apiRequest.servingWeightOz = formatNumber(recipe.costing.servingWeightOz);
    }
    // servingsInCase not in ICostingInfo, calculate if needed
    // You can add this to the API request if your backend requires it
    if (recipe.costing.costPerServing !== undefined) {
      apiRequest.costPerServing = formatNumber(recipe.costing.costPerServing);
    }
    if (recipe.costing.foodCostPct !== undefined) {
      apiRequest.foodCostPct = formatNumber(recipe.costing.foodCostPct);
    }
    if (recipe.costing.salePrice !== undefined) {
      apiRequest.salePrice = formatNumber(recipe.costing.salePrice);
    }
    if (recipe.costing.manualCostPerServing !== undefined) {
      apiRequest.manualCostPerServing = formatNumber(recipe.costing.manualCostPerServing);
    }
  }

  // Food Cost
  if (recipe.foodCost !== undefined) {
    apiRequest.food_cost = formatNumber(recipe.foodCost);
  }

  // Status (map internal to API format - API expects string "P" or "PR")
  if (recipe.status !== undefined) {
    const statusValueMap: Record<string, string> = {
      'draft': 'D',
      'active': 'P',
      'private': 'PR',
      'archived': 'A',
    };
    apiRequest.status = statusValueMap[recipe.status] || 'D';
  }

  // Availability (API expects string "A", "LS", or "OOS")
  if (recipe.isAvailable !== undefined) {
    apiRequest.availability = recipe.isAvailable ? 'A' : 'OOS';
  }

  // Draft and schedule flags
  if (recipe.status === 'draft') {
    apiRequest.is_draft = true;
  } else if (recipe.status !== undefined) {
    apiRequest.is_draft = false;
  }

  return apiRequest;
}

/**
 * Minimal recipe list item interface (for list API responses)
 */
export interface IRecipeListItemApiResponse {
  id: number;
  dish_name: string;
  description: string | null;
  is_draft: boolean;
  is_deleted: boolean;
  status?: string; // "P" for Public, "PR" for Private
  recipe_image: Array<{
    id: number;
    image_url: string | null;
  }>;
}

/**
 * Transform minimal list API response to IRecipe format
 * Used for list endpoints that return simplified recipe data
 */
export function transformListApiResponseToRecipe(apiResponse: IRecipeListItemApiResponse): IRecipe {
  // Extract image URLs
  const imageFiles: string[] = (apiResponse.recipe_image || [])
    .map((img) => img.image_url)
    .filter((url): url is string => url !== null && url !== undefined);

  // Map status based on API response
  // Priority: is_deleted > is_draft > status field
  let status: 'draft' | 'active' | 'private' | 'archived';
  if (apiResponse.is_deleted) {
    status = 'archived';
  } else if (apiResponse.is_draft) {
    status = 'draft';
  } else if (apiResponse.status === 'PR') {
    status = 'private';
  } else if (apiResponse.status === 'P') {
    status = 'active';
  } else {
    // Default fallback
    status = apiResponse.is_draft ? 'draft' : 'active';
  }

  // Build minimal IRecipe object with defaults for missing fields
  // Only include fields that exist in IRecipe type
  const recipe: IRecipe = {
    id: String(apiResponse.id),
    dishName: apiResponse.dish_name || '',
    cuisineType: 'N/A', // Not available in list response - show placeholder
    preparationTime: 0,
    foodCost: 0,
    station: '',
    youtubeUrl: '',
    description: apiResponse.description || '',
    tags: [],
    imageFiles,
    videoFile: '',
    ingredients: [],
    essentialIngredients: [],
    steps: [],
    starchPreparation: {
      type: '',
      steps: [],
      cookingTime: 0,
    },
    costing: {
      caseCost: 0,
      caseWeightLb: 0,
      costPerServing: 0,
      servingWeightOz: 0,
      salePrice: 0,
      foodCostPct: 0,
    },
    status,
    isAvailable: !apiResponse.is_deleted, // Available if not deleted
    isPublic: !apiResponse.is_draft, // Public if not draft
    branchId: '', // Not available in list response
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '',
  };

  return recipe;
}

/**
 * Fetches recipe from API and transforms it to internal format
 */
export async function fetchRecipeById(id: string | number): Promise<IRecipe> {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`/api/recipes/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recipe: ${response.statusText}`);
    }
    
    const apiResponse: IRecipeApiResponse = await response.json();
    return transformApiResponseToRecipe(apiResponse);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
}

/**
 * Saves recipe to API (transforms from internal to API format)
 */
export async function saveRecipe(
  recipe: Partial<IRecipe>,
  method: 'POST' | 'PUT' | 'PATCH' = 'PATCH'
): Promise<IRecipe> {
  try {
    const apiRequest = transformRecipeToApiRequest(recipe);
    
    // Replace with your actual API endpoint
    const url = recipe.id ? `/api/recipes/${recipe.id}/` : '/api/recipes/';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequest),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save recipe: ${response.statusText}`);
    }
    
    const apiResponse: IRecipeApiResponse = await response.json();
    return transformApiResponseToRecipe(apiResponse);
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
}

