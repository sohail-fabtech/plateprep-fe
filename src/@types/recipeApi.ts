// API Response Types (matching backend structure)

export interface IRecipeApiResponse {
  id: number | string;
  dish_name: string | null;
  cusinie_type: {
    id: number;
    category_name: string | null;
  } | null;
  preparation_time: string | null;
  station_to_prepare_dish: string | null;
  youtube_url: string | null;
  description: string | null;
  food_cost: string | null;
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
  center_of_plate: string | null;
  main_dish: string | null;
  
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
    image_url: string | null;
    steps: Array<{
      id: number;
      step: string;
    }>;
  } | null;
  
  // Design Your Plate
  design_your_plate: {
    id: number;
    image: string | null;
    image_url: string | null;
    steps: Array<{
      id: number;
      step: string;
    }>;
  } | null;
  
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
  caseCost: string | null;
  caseWeightLb: string | null;
  servingWeightOz: string | null;
  servingsInCase: string | null;
  costPerServing: string | null;
  foodCostPct: string | null;
  salePrice: string | null;
  manualCostPerServing: string | null;
  
  // Predefined Items
  predefined_ingredients: Array<{
    id: number;
    name: string;
    type: string | null;
  }>;
  
  predefined_starch: Array<{
    id: number;
    name: string;
    type: string | null;
  }>;
  
  predefined_vegetables: Array<{
    id: number;
    name: string;
    type: string | null;
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
    proteins: string | null;
    region_name: string | null;
  }>;
  
  // Branch
  branch: {
    id: string;
    branch_name: string;
    branch_location: string;
    phone_number: string;
    email: string;
    social_media: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      [key: string]: string | undefined;
    };
    restaurant_name: string;
    total_social_links?: string[];
    created_at: string;
    updated_at: string;
  } | null;
  
  // Rating
  rating: {
    average_rating: number;
    total_count: number;
  } | null;
  
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

