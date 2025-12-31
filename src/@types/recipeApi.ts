// API Response Types (matching backend structure)

export interface IRecipeApiResponse {
  id: number | string;
  dish_name: string;
  cusinie_type: {
    id: number;
    category_name: string;
  };
  preparation_time: string;
  station_to_prepare_dish: string;
  youtube_url: string;
  description: string;
  food_cost: string;
  video: string | null;
  manual_video: string | null;
  video_id: string | null;
  
  // Status & Availability
  status: {
    name: string;
    value: string; // P=Public, D=Draft, A=Archived
  };
  availability: {
    name: string;
    value: string; // A=Available, L=Low, O=Out
  };
  
  // Center of Plate
  center_of_plate: string;
  main_dish: string;
  
  // Tags (array of objects)
  tags: Array<{
    id: number;
    name: string;
  }>;
  
  // Ingredients
  ingredient: Array<{
    id: number;
    title: string;
    quantity: string;
    unit: string;
    recipe: number;
  }>;
  
  // Essentials
  essential: Array<{
    id: number;
    title: string;
    quantity: string;
    unit: string;
  }>;
  
  // Preparation Steps
  steps: Array<{
    id: number;
    title: string;
  }>;
  
  // Starch Preparation
  starch_preparation: {
    id: number;
    title: string;
    image: string | null;
    image_url: string;
    steps: Array<{
      id: number;
      step: string;
    }>;
  };
  
  // Design Your Plate
  design_your_plate: {
    id: number;
    image: string | null;
    image_url: string;
    steps: Array<{
      id: number;
      step: string;
    }>;
  };
  
  // Comments
  Cooking_Deviation_Comment: Array<{
    id: number;
    step: string;
  }>;
  
  Real_time_Variable_Comment: Array<{
    id: number;
    step: string;
  }>;
  
  // Costing
  caseCost: string;
  caseWeightLb: string;
  servingWeightOz: string;
  servingsInCase: string;
  costPerServing: string;
  foodCostPct: string;
  salePrice: string;
  manualCostPerServing: string;
  
  // Predefined Items
  predefined_ingredients: Array<{
    id: number;
    name: string;
    type: string;
  }>;
  
  predefined_starch: Array<{
    id: number;
    name: string;
    type: string;
  }>;
  
  predefined_vegetables: Array<{
    id: number;
    name: string;
    type: string;
  }>;
  
  // Images
  recipe_image: Array<{
    id: number;
    image_url: string;
  }>;
  
  // Wine Pairing
  wine_pairing: Array<{
    id: number;
    wine_name: string;
    wine_type: string;
    flavor: string;
    profile: string;
    reason_for_pairing: string;
    proteins: string;
    region_name: string;
  }>;
  
  // Branch
  branch: {
    id: string;
    branch_name: string;
    branch_location: string;
    phone_number: string;
    email: string;
    social_media: string;
    restaurant_name: string;
    created_at: string;
    updated_at: string;
  };
  
  // Rating
  rating: {
    average_rating: number;
    total_count: number;
  };
  
  // Meta
  resturant: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_draft: boolean;
  is_schedule: boolean;
}

// Status mapping
export const STATUS_MAP: Record<string, 'draft' | 'active' | 'archived'> = {
  'D': 'draft',
  'P': 'active',
  'A': 'archived',
};

// Availability mapping
export const AVAILABILITY_MAP: Record<string, boolean> = {
  'A': true,  // Available
  'L': true,  // Low stock (still available)
  'O': false, // Out of stock
};

