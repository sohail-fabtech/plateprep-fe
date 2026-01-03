import axiosInstance from '../../utils/axios';
import { IProcessAudit } from '../../@types/tracking';
import { QueryParams } from '../common/types';

// ----------------------------------------------------------------------

export interface AuditLogQueryParams extends QueryParams {
  page_size?: number;
  search?: string;
  model_name?: string;
  action?: string;
  changed_by_email?: string;
  user_email?: string;
  timestamp_from?: string;
  timestamp_to?: string;
  date_from?: string;
  date_to?: string;
  restaurant?: number;
  branch?: number;
  ordering?: string;
}

export interface AuditLogApiResponse {
  id: number;
  model_name: string;
  object_id: string;
  object_repr: string | null;
  changed_by_name: string | null;
  user_role: string | null;
  user_email: string | null;
  action_display: string;
  timestamp: string;
  formatted_changes: string;
  restaurant_name: string | null;
  branch_name: string | null;
}

export interface AuditLogApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: AuditLogApiResponse[];
}

export interface AuditLogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IProcessAudit[]; // Results are transformed to IProcessAudit format
}

/**
 * Transform API response to UI format
 */
function transformApiResponseToAuditLog(apiResponse: AuditLogApiResponse): IProcessAudit {
  return {
    id: apiResponse.id,
    modelName: apiResponse.model_name,
    objectId: apiResponse.object_id,
    objectRepr: apiResponse.object_repr || 'N/A',
    changedByName: apiResponse.changed_by_name || 'Unknown User',
    userRole: apiResponse.user_role || 'N/A',
    userEmail: apiResponse.user_email || 'N/A',
    actionDisplay: apiResponse.action_display,
    timestamp: apiResponse.timestamp,
    formattedChanges: apiResponse.formatted_changes,
    restaurantName: apiResponse.restaurant_name || 'N/A',
  };
}

/**
 * Fetch list of audit logs
 */
export async function getAuditLogs(params?: AuditLogQueryParams): Promise<AuditLogListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.page_size !== undefined && params.page_size !== null) {
    queryParams.page_size = params.page_size;
  }
  if (params?.search) queryParams.search = params.search;
  if (params?.model_name) queryParams.model_name = params.model_name;
  if (params?.action) queryParams.action = params.action;
  if (params?.changed_by_email) queryParams.changed_by_email = params.changed_by_email;
  if (params?.user_email) queryParams.user_email = params.user_email;
  if (params?.timestamp_from) queryParams.timestamp_from = params.timestamp_from;
  if (params?.timestamp_to) queryParams.timestamp_to = params.timestamp_to;
  if (params?.date_from) queryParams.date_from = params.date_from;
  if (params?.date_to) queryParams.date_to = params.date_to;
  if (params?.restaurant !== undefined && params.restaurant !== null) queryParams.restaurant = params.restaurant;
  if (params?.branch !== undefined && params.branch !== null) queryParams.branch = params.branch;
  if (params?.ordering) queryParams.ordering = params.ordering;

  try {
    const response = await axiosInstance.get<AuditLogApiListResponse>('/audit-logs/', {
      params: queryParams,
    });

    // Transform results to UI format
    return {
      ...response.data,
      results: response.data.results.map(transformApiResponseToAuditLog),
    };
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      if (status === 403) {
        const detail = errorData?.detail || 'You do not have permission to view audit logs.';
        throw new Error(detail);
      }

      if (status === 404) {
        throw new Error('Audit log not found.');
      }

      if (status === 400) {
        const detail = errorData?.detail || 'Invalid request parameters.';
        throw new Error(detail);
      }

      if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Generic error message
      throw new Error(errorData?.detail || errorData?.message || 'An error occurred while fetching audit logs.');
    }

    // Network or other errors
    throw new Error(error.message || 'Failed to fetch audit logs. Please check your connection.');
  }
}

/**
 * Fetch single audit log by ID
 */
export async function getAuditLogById(id: string | number): Promise<IProcessAudit> {
  try {
    const response = await axiosInstance.get<AuditLogApiResponse>(`/audit-logs/${id}/`);
    return transformApiResponseToAuditLog(response.data);
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      if (status === 403) {
        const detail = errorData?.detail || 'You do not have permission to view this audit log.';
        throw new Error(detail);
      }

      if (status === 404) {
        throw new Error('Audit log not found.');
      }

      if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Generic error message
      throw new Error(errorData?.detail || errorData?.message || 'An error occurred while fetching audit log.');
    }

    // Network or other errors
    throw new Error(error.message || 'Failed to fetch audit log. Please check your connection.');
  }
}

