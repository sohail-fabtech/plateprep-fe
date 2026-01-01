import { IRestaurantLocation, IRestaurantLocationApiResponse, IRestaurantLocationApiItem, ISocialMedia } from '../@types/restaurantLocation';

// ----------------------------------------------------------------------
// Restaurant Location Data Adapter - Transform API response to UI format
// ----------------------------------------------------------------------

/**
 * Parse social media JSON string to array
 */
function parseSocialMedia(socialMediaString: string): ISocialMedia[] {
  try {
    if (!socialMediaString || socialMediaString === '[]') {
      return [];
    }
    return JSON.parse(socialMediaString) as ISocialMedia[];
  } catch (error) {
    console.error('Error parsing social media:', error);
    return [];
  }
}

/**
 * Transform API item to internal UI format
 */
export function transformApiItemToLocation(apiItem: IRestaurantLocationApiItem): IRestaurantLocation {
  return {
    id: apiItem.id,
    branchName: apiItem.branch_name,
    branchLocation: apiItem.branch_location,
    phoneNumber: apiItem.phone_number,
    email: apiItem.email,
    socialMedia: parseSocialMedia(apiItem.social_media),
    restaurantName: apiItem.restaurant_name,
    createdAt: apiItem.created_at,
    updatedAt: apiItem.updated_at,
    isDeleted: apiItem.is_deleted,
  };
}

/**
 * Transform API response to internal UI format
 */
export function transformApiResponseToLocations(apiResponse: IRestaurantLocationApiResponse): IRestaurantLocation[] {
  return apiResponse.results.map(transformApiItemToLocation);
}

/**
 * Fetch restaurant locations from API
 */
export async function fetchRestaurantLocations(): Promise<IRestaurantLocation[]> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/restaurant-locations/');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.statusText}`);
    }
    
    const apiData: IRestaurantLocationApiResponse = await response.json();
    return transformApiResponseToLocations(apiData);
  } catch (error) {
    console.error('Error fetching restaurant locations:', error);
    throw error;
  }
}

/**
 * Fetch restaurant location by ID from API
 */
export async function fetchRestaurantLocationById(id: string | number): Promise<IRestaurantLocation> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/restaurant-locations/${id}/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch location: ${response.statusText}`);
    }
    
    const apiItem: IRestaurantLocationApiItem = await response.json();
    return transformApiItemToLocation(apiItem);
  } catch (error) {
    console.error('Error fetching restaurant location:', error);
    throw error;
  }
}

