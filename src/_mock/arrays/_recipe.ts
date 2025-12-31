import _mock from '../_mock';
import { randomNumberRange, randomInArray } from '../utils';

// ----------------------------------------------------------------------

const CUISINE_TYPES = ['Italian', 'Chinese', 'French', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Mediterranean'];
const STATIONS = ['Grill', 'Sauté', 'Garde Manger', 'Fry', 'Roast', 'Pastry'];
const STATUSES: Array<'draft' | 'active' | 'archived'> = ['draft', 'active', 'archived'];
const TAGS = ['spicy', 'vegan', 'gluten-free', 'vegetarian', 'dairy-free', 'nut-free', 'organic', 'keto'];

export const _recipeList = [...Array(24)].map((_, index) => ({
  id: _mock.id(index),
  dishName: _mock.text.title(index),
  cuisineType: randomInArray(CUISINE_TYPES),
  preparationTime: randomNumberRange(15, 120),
  foodCost: randomNumberRange(5, 50),
  station: randomInArray(STATIONS),
  youtubeUrl: `https://www.youtube.com/watch?v=${_mock.id(index).substring(0, 11)}`,
  description: _mock.text.description(index),
  tags: [randomInArray(TAGS), randomInArray(TAGS)],
  
  // Media
  imageFiles: [
    _mock.image.product(index),
    _mock.image.product(index + 1),
    _mock.image.product(index + 2),
  ],
  videoFile: `https://www.youtube.com/watch?v=${_mock.id(index).substring(0, 11)}`,
  
  // Ingredients
  ingredients: [
    {
      id: `ing-${index}-1`,
      title: 'Fresh Tomatoes',
      quantity: randomNumberRange(2, 10),
      unit: 'pieces',
    },
    {
      id: `ing-${index}-2`,
      title: 'Olive Oil',
      quantity: randomNumberRange(1, 5),
      unit: 'tbsp',
    },
    {
      id: `ing-${index}-3`,
      title: 'Garlic',
      quantity: randomNumberRange(2, 6),
      unit: 'cloves',
    },
  ],
  
  essentialIngredients: [
    {
      id: `ess-${index}-1`,
      title: 'Salt',
      quantity: randomNumberRange(1, 3),
      unit: 'tsp',
    },
    {
      id: `ess-${index}-2`,
      title: 'Black Pepper',
      quantity: randomNumberRange(1, 2),
      unit: 'tsp',
    },
  ],
  
  steps: [
    {
      id: `step-${index}-1`,
      stepNumber: 1,
      description: 'Prepare all ingredients by washing and cutting vegetables',
      duration: 10,
    },
    {
      id: `step-${index}-2`,
      stepNumber: 2,
      description: 'Heat oil in a large pan over medium heat',
      duration: 5,
    },
    {
      id: `step-${index}-3`,
      stepNumber: 3,
      description: 'Cook main ingredients until tender',
      duration: 20,
    },
  ],
  
  starchPreparation: {
    type: 'Rice',
    steps: [
      {
        id: `starch-${index}-1`,
        stepNumber: 1,
        description: 'Rinse rice thoroughly',
        duration: 2,
      },
      {
        id: `starch-${index}-2`,
        stepNumber: 2,
        description: 'Cook rice in boiling water',
        duration: 18,
      },
    ],
    cookingTime: 20,
    temperature: 212,
  },
  
  plateDesign: {
    centerOfPlate: {
      category: 'Protein',
      subcategory: 'Grilled',
    },
    platingSteps: [
      {
        id: `plate-${index}-1`,
        stepNumber: 1,
        description: 'Place protein in center of plate',
      },
      {
        id: `plate-${index}-2`,
        stepNumber: 2,
        description: 'Arrange vegetables around protein',
      },
      {
        id: `plate-${index}-3`,
        stepNumber: 3,
        description: 'Drizzle sauce artistically',
      },
    ],
    garnish: ['Fresh Herbs', 'Microgreens', 'Edible Flowers'],
  },
  
  // Comments
  cookingDeviationComments: [
    {
      id: `cook-comment-${index}-1`,
      step: 'Cooking Deviation Comment 1',
    },
    {
      id: `cook-comment-${index}-2`,
      step: 'Cooking Deviation Comment 2',
    },
    {
      id: `cook-comment-${index}-3`,
      step: 'Cooking Deviation Comment 3',
    },
    {
      id: `cook-comment-${index}-4`,
      step: 'Cooking Deviation Comment 4',
    },
  ],
  
  realtimeVariableComments: [
    {
      id: `realtime-comment-${index}-1`,
      step: 'Real-time Variable Comment 1',
    },
    {
      id: `realtime-comment-${index}-2`,
      step: 'Real-time Variable Comment 2',
    },
  ],
  
  // Wine Pairings
  winePairings: [
    {
      id: `wine-${index}-1`,
      wine_name: 'Chardonnay',
      wine_type: 'White Wine',
      flavor: 'buttery, creamy',
      profile: 'full-bodied, rich',
      reason_for_pairing: 'The creamy texture of Chardonnay complements the richness of the cream sauce and butter in the dish, enhancing its smooth and savory flavors.',
      proteins: 'chicken',
      region_name: 'France',
    },
    {
      id: `wine-${index}-2`,
      wine_name: 'Pinot Noir',
      wine_type: 'Red Wine',
      flavor: 'fruity, earthy',
      profile: 'light, delicate',
      reason_for_pairing: 'The light and fruity profile of Pinot Noir complements the umami flavors, enhancing the overall taste experience.',
      proteins: 'duck',
      region_name: 'France',
    },
  ],
  
  // Costing
  costing: {
    caseCost: randomNumberRange(50, 200),
    caseWeightLb: randomNumberRange(10, 50),
    servingWeightOz: randomNumberRange(6, 16),
    costPerServing: randomNumberRange(3, 15),
    manualCostPerServing: randomNumberRange(3, 15),
    salePrice: randomNumberRange(15, 45),
    foodCostPct: randomNumberRange(25, 35),
  },
  
  // Availability and Status
  isAvailable: _mock.boolean(index),
  isPublic: _mock.boolean(index),
  status: randomInArray(STATUSES),
  
  // Location
  branchId: `branch-${randomNumberRange(1, 5)}`,
  
  // Additional Info
  comments: index % 3 === 0 ? 'Special dietary considerations noted' : undefined,
  feedback: index % 4 === 0 ? 'Customer feedback: Excellent presentation' : undefined,
  
  // Metadata
  createdAt: _mock.time(index),
  updatedAt: _mock.time(index),
  createdBy: _mock.name.fullName(index),
  updatedBy: index % 2 === 0 ? _mock.name.fullName(index + 1) : undefined,
}));

// ----------------------------------------------------------------------

export const _predefinedIngredients = [...Array(50)].map((_, index) => ({
  id: `pred-ing-${index}`,
  name: _mock.text.title(index),
  category: randomInArray(['Protein', 'Vegetable', 'Spice', 'Dairy', 'Grain']),
  unit: randomInArray(['lb', 'oz', 'cup', 'tbsp', 'tsp', 'pieces']),
  defaultQuantity: randomNumberRange(1, 10),
}));

export const _predefinedStarches = [...Array(10)].map((_, index) => ({
  id: `pred-starch-${index}`,
  name: randomInArray(['Rice', 'Pasta', 'Potatoes', 'Quinoa', 'Couscous']),
  defaultCookingTime: randomNumberRange(15, 30),
  defaultTemperature: 212,
}));

export const _predefinedVegetables = [...Array(30)].map((_, index) => ({
  id: `pred-veg-${index}`,
  name: _mock.text.title(index),
  season: randomInArray(['Spring', 'Summer', 'Fall', 'Winter', 'Year-round']),
  preparationMethod: randomInArray(['Raw', 'Grilled', 'Steamed', 'Roasted', 'Sautéed']),
}));

