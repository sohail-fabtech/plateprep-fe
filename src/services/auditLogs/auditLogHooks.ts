import { useQuery } from '@tanstack/react-query';
import {
  getAuditLogs,
  getAuditLogById,
  AuditLogQueryParams,
  AuditLogListResponse,
} from './auditLogService';

// ----------------------------------------------------------------------

/**
 * Query key factory for audit logs
 */
export const auditLogKeys = {
  all: ['auditLogs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (params?: AuditLogQueryParams) => [...auditLogKeys.lists(), params] as const,
  details: () => [...auditLogKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...auditLogKeys.details(), id] as const,
};

/**
 * Hook to fetch list of audit logs
 * Note: staleTime is set to 0 to always refetch (no cache)
 */
export function useAuditLogs(params?: AuditLogQueryParams, enabled: boolean = true) {
  return useQuery<AuditLogListResponse>({
    queryKey: auditLogKeys.list(params),
    queryFn: () => getAuditLogs(params),
    enabled, // Only fetch when enabled
    staleTime: 0, // Always refetch - no cache
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

/**
 * Hook to fetch single audit log by ID
 * Note: staleTime is set to 0 to always refetch (no cache)
 */
export function useAuditLog(id: string | number | undefined) {
  return useQuery({
    queryKey: auditLogKeys.detail(id!),
    queryFn: () => getAuditLogById(id!),
    enabled: !!id,
    staleTime: 0, // Always refetch - no cache
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// Re-export types
export type { AuditLogQueryParams, AuditLogListResponse } from './auditLogService';

