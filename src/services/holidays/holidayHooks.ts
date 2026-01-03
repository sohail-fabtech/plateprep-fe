import { useQuery } from '@tanstack/react-query';
import {
  getHolidays,
  HolidayQueryParams,
  HolidayListResponse,
} from './holidayService';

// Re-export types for use in other modules
export type { HolidayQueryParams, HolidayListResponse };

// ----------------------------------------------------------------------

export const holidayKeys = {
  all: ['holidays'] as const,
  lists: () => [...holidayKeys.all, 'list'] as const,
  list: (params?: HolidayQueryParams) => [...holidayKeys.lists(), params] as const,
};

/**
 * Hook to fetch holidays list
 */
export function useHolidays(params?: HolidayQueryParams) {
  return useQuery<HolidayListResponse>({
    queryKey: holidayKeys.list(params),
    queryFn: () => getHolidays(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

