import axiosInstance from '../../utils/axios';
import { IRestaurantLocation, IRestaurantLocationApiResponse, IRestaurantLocationApiItem } from '../../@types/restaurantLocation';
import { transformApiItemToLocation, transformApiResponseToLocations } from '../../utils/restaurantLocationAdapter';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface LocationQueryParams extends QueryParams {
  search?: string;
  isDeleted?: boolean;
}

/**
 * Fetch all locations
 */
export async function getLocations(params?: LocationQueryParams): Promise<IRestaurantLocation[]> {
  const response = await axiosInstance.get<IRestaurantLocationApiResponse>('/api/restaurant-locations/', {
    params,
  });
  return transformApiResponseToLocations(response.data);
}

/**
 * Fetch location by ID
 */
export async function getLocationById(id: string | number): Promise<IRestaurantLocation> {
  const response = await axiosInstance.get<IRestaurantLocationApiItem>(`/api/restaurant-locations/${id}/`);
  return transformApiItemToLocation(response.data);
}

/**
 * Create new location
 */
export async function createLocation(location: Partial<IRestaurantLocation>): Promise<IRestaurantLocation> {
  const apiRequest = {
    branch_name: location.branchName,
    branch_location: location.branchLocation,
    phone_number: location.phoneNumber,
    email: location.email,
    social_media: JSON.stringify(location.socialMedia || []),
  };
  const response = await axiosInstance.post<IRestaurantLocationApiItem>('/api/restaurant-locations/', apiRequest);
  return transformApiItemToLocation(response.data);
}

/**
 * Update location
 */
export async function updateLocation(
  id: string | number,
  location: Partial<IRestaurantLocation>
): Promise<IRestaurantLocation> {
  const apiRequest: Partial<IRestaurantLocationApiItem> = {};
  
  if (location.branchName !== undefined) apiRequest.branch_name = location.branchName;
  if (location.branchLocation !== undefined) apiRequest.branch_location = location.branchLocation;
  if (location.phoneNumber !== undefined) apiRequest.phone_number = location.phoneNumber;
  if (location.email !== undefined) apiRequest.email = location.email;
  if (location.socialMedia !== undefined) apiRequest.social_media = JSON.stringify(location.socialMedia);

  const response = await axiosInstance.patch<IRestaurantLocationApiItem>(
    `/api/restaurant-locations/${id}/`,
    apiRequest
  );
  return transformApiItemToLocation(response.data);
}

/**
 * Delete location
 */
export async function deleteLocation(id: string | number): Promise<void> {
  await axiosInstance.delete(`/api/restaurant-locations/${id}/`);
}

