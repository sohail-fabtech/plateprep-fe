import axiosInstance from '../../utils/axios';
import { IAccessLog } from '../../@types/tracking';
import { QueryParams } from '../common/types';

// ----------------------------------------------------------------------

export interface AccessLogQueryParams extends QueryParams {
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface AccessLogApiResponse {
  id: number;
  user: {
    full_name: string;
    email: string;
    role: string;
  } | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface AccessLogApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: AccessLogApiResponse[];
}

export interface AccessLogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IAccessLog[]; // Results are transformed to IAccessLog format
}

/**
 * Transform API response to UI format
 */
function transformApiResponseToAccessLog(apiResponse: AccessLogApiResponse): IAccessLog {
  return {
    id: apiResponse.id,
    user: apiResponse.user
      ? {
          fullName: apiResponse.user.full_name,
          email: apiResponse.user.email,
          role: apiResponse.user.role,
        }
      : {
          fullName: 'Unknown User',
          email: 'N/A',
          role: 'N/A',
        },
    ipAddress: apiResponse.ip_address || 'N/A',
    userAgent: apiResponse.user_agent || 'N/A',
    timestamp: apiResponse.timestamp,
  };
}

/**
 * Fetch list of access logs
 */
export async function getAccessLogs(params?: AccessLogQueryParams): Promise<AccessLogListResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.page_size !== undefined && params.page_size !== null) {
    queryParams.page_size = params.page_size;
  }
  if (params?.search) queryParams.search = params.search;
  if (params?.ordering) queryParams.ordering = params.ordering;

  try {
    const response = await axiosInstance.get<AccessLogApiListResponse>('/access-logs/', {
      params: queryParams,
    });

    // Transform results to UI format
    return {
      ...response.data,
      results: response.data.results.map(transformApiResponseToAccessLog),
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
        const detail = errorData?.detail || 'You do not have permission to view access logs.';
        throw new Error(detail);
      }

      if (status === 404) {
        throw new Error('Access log not found.');
      }

      if (status === 400) {
        const detail = errorData?.detail || 'Invalid request parameters.';
        throw new Error(detail);
      }

      if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Generic error message
      throw new Error(errorData?.detail || errorData?.message || 'An error occurred while fetching access logs.');
    }

    // Network or other errors
    throw new Error(error.message || 'Failed to fetch access logs. Please check your connection.');
  }
}

/**
 * Fetch single access log by ID
 */
export async function getAccessLogById(id: string | number): Promise<IAccessLog> {
  try {
    const response = await axiosInstance.get<AccessLogApiResponse>(`/access-logs/${id}/`);
    return transformApiResponseToAccessLog(response.data);
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      if (status === 403) {
        const detail = errorData?.detail || 'You do not have permission to view this access log.';
        throw new Error(detail);
      }

      if (status === 404) {
        throw new Error('Access log not found.');
      }

      if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Generic error message
      throw new Error(errorData?.detail || errorData?.message || 'An error occurred while fetching access log.');
    }

    // Network or other errors
    throw new Error(error.message || 'Failed to fetch access log. Please check your connection.');
  }
}

