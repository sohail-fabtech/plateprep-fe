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
  const starchSteps: IPreparationStep[] = apiResponse.starch_preparation.steps.map((step, index) => ({
    id: String(step.id || index + 1),
    stepNumber: index + 1,
    description: step.step,
  }));

  // Transform design your plate steps to IPreparationStep[]
  const plateDesignSteps: IPreparationStep[] = apiResponse.design_your_plate.steps.map((step, index) => ({
    id: String(step.id || index + 1),
    stepNumber: index + 1,
    description: step.step,
  }));

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
    dishName: apiResponse.dish_name,
    cuisineType: apiResponse.cusinie_type.category_name,
    preparationTime: parseTimeString(apiResponse.preparation_time),
    foodCost: parseNumber(apiResponse.food_cost),
    station: apiResponse.station_to_prepare_dish,
    youtubeUrl: apiResponse.youtube_url || '',
    description: apiResponse.description,
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
      type: apiResponse.starch_preparation.title,
      steps: starchSteps,
      cookingTime: 30, // Default, can be calculated if available in API
    },
    
    // Costing (without servingsInCase - not in ICostingInfo type)
    costing: {
      caseCost: parseNumber(apiResponse.caseCost),
      caseWeightLb: parseNumber(apiResponse.caseWeightLb),
      servingWeightOz: parseNumber(apiResponse.servingWeightOz),
      costPerServing: parseNumber(apiResponse.costPerServing),
      foodCostPct: parseNumber(apiResponse.foodCostPct),
      salePrice: parseNumber(apiResponse.salePrice),
      manualCostPerServing: parseNumber(apiResponse.manualCostPerServing),
    },
    
    // Plate Design (with required platingSteps)
    plateDesign: {
      centerOfPlate: {
        category: apiResponse.center_of_plate,
        subcategory: apiResponse.main_dish,
      },
      platingSteps: plateDesignSteps,
    },
    
    // Status & Availability
    status,
    isAvailable,
    isPublic: apiResponse.status.value === 'P',
    
    // Branch
    branchId: apiResponse.branch.id,
    
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
      proteins: wine.proteins,
      region_name: wine.region_name,
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
 */
export function transformRecipeToApiRequest(recipe: Partial<IRecipe>): Partial<IRecipeApiResponse> {
  // Helper: Format number to string with 2 decimals
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return '0.00';
    return value.toFixed(2);
  };

  const apiRequest: Partial<IRecipeApiResponse> = {};

  // Basic fields
  if (recipe.dishName !== undefined) apiRequest.dish_name = recipe.dishName;
  if (recipe.description !== undefined) apiRequest.description = recipe.description;
  if (recipe.station !== undefined) apiRequest.station_to_prepare_dish = recipe.station;
  if (recipe.youtubeUrl !== undefined) apiRequest.youtube_url = recipe.youtubeUrl;
  if (recipe.preparationTime !== undefined) {
    apiRequest.preparation_time = `${recipe.preparationTime} mint`;
  }

  // Cuisine Type (needs to be object, but we only have the name - backend should handle this)
  if (recipe.cuisineType !== undefined) {
    // This would typically be handled by sending just the ID or name
    // The backend should map it to the full object
    // For now, we'll send it as-is and let the backend handle it
  }

  // Center of Plate
  if (recipe.plateDesign?.centerOfPlate?.category !== undefined) {
    apiRequest.center_of_plate = recipe.plateDesign.centerOfPlate.category;
  }
  if (recipe.plateDesign?.centerOfPlate?.subcategory !== undefined) {
    apiRequest.main_dish = recipe.plateDesign.centerOfPlate.subcategory;
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

  // Status (map internal to API format)
  if (recipe.status !== undefined) {
    const statusValueMap: Record<string, string> = {
      'draft': 'D',
      'active': 'P',
      'archived': 'A',
    };
    const statusValue = statusValueMap[recipe.status] || 'D';
    apiRequest.status = {
      name: recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1),
      value: statusValue,
    };
  }

  // Availability
  if (recipe.isAvailable !== undefined) {
    const availValue = recipe.isAvailable ? 'A' : 'O';
    const availName = recipe.isAvailable ? 'Available' : 'Out of Stock';
    apiRequest.availability = {
      name: availName,
      value: availValue,
    };
  }

  return apiRequest;
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

