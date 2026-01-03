import { useQuery } from '@tanstack/react-query';
import {
  getAccessLogs,
  getAccessLogById,
  AccessLogQueryParams,
  AccessLogListResponse,
} from './accessLogService';

// ----------------------------------------------------------------------

/**
 * Query key factory for access logs
 */
export const accessLogKeys = {
  all: ['accessLogs'] as const,
  lists: () => [...accessLogKeys.all, 'list'] as const,
  list: (params?: AccessLogQueryParams) => [...accessLogKeys.lists(), params] as const,
  details: () => [...accessLogKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...accessLogKeys.details(), id] as const,
};

/**
 * Hook to fetch list of access logs
 * Note: staleTime is set to 0 to always refetch (no cache)
 */
export function useAccessLogs(params?: AccessLogQueryParams, enabled: boolean = true) {
  return useQuery<AccessLogListResponse>({
    queryKey: accessLogKeys.list(params),
    queryFn: () => getAccessLogs(params),
    enabled, // Only fetch when enabled
    staleTime: 0, // Always refetch - no cache
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

/**
 * Hook to fetch single access log by ID
 * Note: staleTime is set to 0 to always refetch (no cache)
 */
export function useAccessLog(id: string | number | undefined) {
  return useQuery({
    queryKey: accessLogKeys.detail(id!),
    queryFn: () => getAccessLogById(id!),
    enabled: !!id,
    staleTime: 0, // Always refetch - no cache
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// Re-export types
export type { AccessLogQueryParams, AccessLogListResponse } from './accessLogService';

