import { IDictionaryCategory, IDictionaryTerm } from '../../@types/dictionary';

// ----------------------------------------------------------------------

export const _dictionaryCategories: IDictionaryCategory[] = [
  {
    id: 1,
    name: 'Dietary',
    description: 'Types of eating patterns and food restrictions in relation to health and nutrition.',
  },
  {
    id: 2,
    name: 'Kitchen Terms',
    description: 'Common culinary techniques and terminology used in the kitchen.',
  },
  {
    id: 3,
    name: 'Kitchen Stations',
    description: 'Distinct sections of a professional kitchen responsible for specific tasks.',
  },
  {
    id: 4,
    name: 'Five Mother Sauces',
    description: 'The five foundational sauces of classical French cuisine.',
  },
  {
    id: 5,
    name: 'Chef Positions',
    description: 'Key roles and hierarchy within a professional kitchen.',
  },
  {
    id: 23,
    name: 'test service',
    description: 'r32r342r23',
  },
];

export const _dictionaryTerms: Record<number, IDictionaryTerm[]> = {
  3: [
    {
      id: 27,
      term: 'Garde Manger (Cold Station)',
      definition: 'Prepares cold dishes and presentations.',
      description:
        'Responsible for salads, cold appetizers, charcuterie, and dressings, often handling final plating of these items.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 28,
      term: 'Grill Station',
      definition: 'Handles grilling and broiling of proteins and vegetables.',
      description: 'Works with grills, broilers, and planchas to prepare meats and vegetables over direct heat.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 29,
      term: 'Sauté Station',
      definition: 'Prepares pan-fried dishes and sauces.',
      description: 'Specializes in quick-cooking methods like pan-frying and sautéing, as well as finishing sauces.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 30,
      term: 'Fry Station',
      definition: 'Deep-fries foods to crisp perfection.',
      description: 'Manages fryers for items such as fries, chicken, and seafood to ensure proper texture and doneness.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 31,
      term: 'Roast Station',
      definition: 'Roasts large cuts of meat and baked dishes.',
      description: 'In charge of roasting meats, whole animals, and sometimes preparing gratins or similar oven-baked items.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 32,
      term: 'Pastry Station',
      definition: 'Bakes pastries, breads, and desserts.',
      description: 'Focused on dessert and bread production including pastries, cakes, and relevant sauces or fillings.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 33,
      term: 'Soup and Sauce (Saucier) Station',
      definition: 'Prepares stocks, soups, and sauces.',
      description: 'Creates foundational liquids and sauces used throughout service, often regarded as a senior station role.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 34,
      term: 'Expeditor (Expo) Station',
      definition: 'Coordinates and inspects final dishes.',
      description:
        'Acts as the communication hub between front-of-house and kitchen, checking tickets and ensuring timely, correct service.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 35,
      term: 'Butcher Station',
      definition: 'Portions and readies meats and poultry.',
      description: 'Responsible for breaking down, portioning, and preparing all cuts of meat, fish, and poultry.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 36,
      term: 'Prep Station',
      definition: 'Prepares ingredients before service.',
      description: 'Handles washing, chopping, and portioning ingredients needed by all other stations, often before opening.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
    {
      id: 37,
      term: 'Beverage Station',
      definition: 'Manages drink service.',
      description: 'Prepares all beverages, including cocktails, coffee, tea, and other non-alcoholic drinks.',
      category: {
        id: 3,
        name: 'Kitchen Stations',
      },
    },
  ],
  2: [
    {
      id: 10,
      term: 'Mise en Place',
      definition: 'Everything in its place.',
      description: 'The practice of preparing and organizing ingredients before cooking begins.',
      category: {
        id: 2,
        name: 'Kitchen Terms',
      },
    },
    {
      id: 11,
      term: 'Deglaze',
      definition: 'To add liquid to a pan to loosen browned bits.',
      description: 'A technique used to create pan sauces by adding wine, stock, or other liquids to a hot pan.',
      category: {
        id: 2,
        name: 'Kitchen Terms',
      },
    },
  ],
  1: [
    {
      id: 20,
      term: 'Vegan',
      definition: 'No animal products whatsoever.',
      description: 'A diet that excludes all animal products including meat, dairy, eggs, and honey.',
      category: {
        id: 1,
        name: 'Dietary',
      },
    },
    {
      id: 21,
      term: 'Vegetarian',
      definition: 'No meat, but may include dairy and eggs.',
      description: 'A diet that excludes meat but may include dairy products and eggs.',
      category: {
        id: 1,
        name: 'Dietary',
      },
    },
  ],
};

