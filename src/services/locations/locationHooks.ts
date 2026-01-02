import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IRestaurantLocation } from '../../@types/restaurantLocation';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  LocationQueryParams,
} from './locationService';

// ----------------------------------------------------------------------

/**
 * Query key factory for locations
 */
export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (params?: LocationQueryParams) => [...locationKeys.lists(), params] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...locationKeys.details(), id] as const,
};

/**
 * Hook to fetch all locations
 */
export function useLocations(params?: LocationQueryParams) {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: () => getLocations(params),
  });
}

/**
 * Hook to fetch a single location by ID
 */
export function useLocation(id: string | number | undefined) {
  return useQuery({
    queryKey: locationKeys.detail(id!),
    queryFn: () => getLocationById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new location
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (location: Partial<IRestaurantLocation>) => createLocation(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
  });
}

/**
 * Hook to update a location
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<IRestaurantLocation> }) =>
      updateLocation(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
  });
}

/**
 * Hook to delete a location
 */
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteLocation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.removeQueries({ queryKey: locationKeys.detail(id) });
    },
  });
}

