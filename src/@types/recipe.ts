// ----------------------------------------------------------------------

export type IIngredient = {
  id: string;
  title: string;
  quantity: number;
  unit: string;
};

export type IPreparationStep = {
  id: string;
  stepNumber: number;
  description: string;
  duration?: number; // in minutes
};

export type IComment = {
  id: string;
  step: string;
};

export type IWinePairing = {
  id: string;
  wine_name: string;
  wine_type: string;
  flavor: string;
  profile: string;
  reason_for_pairing: string;
  proteins: string;
  region_name: string;
};

export type IStarchPreparation = {
  type: string;
  steps: IPreparationStep[];
  cookingTime: number;
  temperature?: number;
};

export type IPlateDesign = {
  centerOfPlate: {
    category: string;
    subcategory: string;
  };
  platingSteps: IPreparationStep[];
  garnish?: string[];
};

export type ICostingInfo = {
  caseCost: number;
  caseWeightLb: number;
  servingWeightOz: number;
  costPerServing: number;
  manualCostPerServing?: number;
  salePrice: number;
  foodCostPct: number;
};

// ----------------------------------------------------------------------

export type IRecipe = {
  id: string;
  dishName: string;
  cuisineType: string;
  preparationTime: number; // in minutes
  foodCost: number;
  station: string;
  youtubeUrl?: string;
  description: string;
  tags: string[];
  
  // Media
  imageFiles: string[]; // URLs of images
  videoFile?: string; // URL of video
  
  // Ingredients and Preparation
  ingredients: IIngredient[];
  essentialIngredients: IIngredient[];
  steps: IPreparationStep[];
  starchPreparation?: IStarchPreparation;
  plateDesign?: IPlateDesign;
  
  // Costing
  costing: ICostingInfo;
  
  // Availability and Status
  isAvailable: boolean;
  isPublic: boolean;
  status: 'draft' | 'active' | 'private' | 'archived';
  
  // Location and Organization
  branchId: string;
  
  // Additional Info  
  cookingDeviationComments?: IComment[];
  realtimeVariableComments?: IComment[];
  winePairings?: IWinePairing[];
  comments?: string; // Legacy field
  feedback?: string; // Legacy field
  
  // Metadata
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  createdBy: string;
  updatedBy?: string;
};

// ----------------------------------------------------------------------

export type IRecipeFilterValue = string | string[];

export type IRecipeFilters = {
  cuisineType: string;
  station: string;
  status: string;
  isAvailable: string;
};

// ----------------------------------------------------------------------

export type IPredefinedIngredient = {
  id: string;
  name: string;
  category: string;
  unit: string;
  defaultQuantity?: number;
};

export type IPredefinedStarch = {
  id: string;
  name: string;
  defaultCookingTime: number;
  defaultTemperature: number;
};

export type IPredefinedVegetable = {
  id: string;
  name: string;
  season: string;
  preparationMethod: string;
};

