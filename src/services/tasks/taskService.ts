import axiosInstance from '../../utils/axios';
import { ITaskDetail, ITaskComment } from '../../@types/taskApi';
import { ITaskApiResponse } from '../../@types/taskApi';
import { transformApiResponseToTask } from '../../utils/taskAdapter';
import { QueryParams, PaginatedResponse } from '../common/types';

// ----------------------------------------------------------------------

export interface TaskQueryParams extends QueryParams {
  search?: string;
  status?: string;
  priority?: string;
  staffId?: number;
  branch?: number;
  is_deleted?: boolean;
  page_size?: number;
  ordering?: string;
}

/**
 * Fetch task by ID
 */
export async function getTaskById(id: string | number): Promise<ITaskDetail> {
  const response = await axiosInstance.get<ITaskApiResponse>(`/task/${id}/`);
  return transformApiResponseToTask(response.data);
}

/**
 * Task list response type
 */
export interface TaskListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: ITaskDetail[];
}

/**
 * Fetch list of tasks
 */
export async function getTasks(params?: TaskQueryParams): Promise<TaskListResponse> {
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.status) queryParams.status = params.status;
  if (params?.priority) queryParams.priority = params.priority;
  if (params?.staffId) queryParams.staff = params.staffId;
  if (params?.branch) queryParams.branch = params.branch;
  if (params?.is_deleted !== undefined) queryParams.is_deleted = params.is_deleted;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<PaginatedResponse<ITaskApiResponse>>('/task/', {
    params: queryParams,
  });

  return {
    count: response.data.count || 0,
    next: response.data.next || null,
    previous: response.data.previous || null,
    page: response.data.page || 1,
    results: response.data.results.map(transformApiResponseToTask),
  };
}

/**
 * Create a new task
 */
export interface ITaskApiRequest {
  staff?: number | string | null;
  assignTo?: string | null;
  emailAddress?: string | null;
  task_name?: number | null;
  task_description?: string | null;
  status?: string;
  prority?: string;
  started_at?: string | null;
  completed_at?: string | null;
  kitchen_station?: string;
  attachment_video_link?: string | null;
  due_date?: string | null;
  other_task_name?: string | null;
  video?: string | null;
  image?: string | null;
  branch?: number;
}

export async function createTask(data: ITaskApiRequest): Promise<ITaskDetail> {
  const response = await axiosInstance.post<ITaskApiResponse>('/task/', data);
  return transformApiResponseToTask(response.data);
}

/**
 * Update task (general update)
 */
export async function updateTask(id: string | number, data: Partial<ITaskApiRequest>): Promise<ITaskDetail> {
  const response = await axiosInstance.patch<ITaskApiResponse>(`/task/${id}/`, data);
  return transformApiResponseToTask(response.data);
}

/**
 * Update task description
 */
export async function updateTaskDescription(id: string | number, description: string): Promise<void> {
  await axiosInstance.patch(`/task/${id}/`, {
    task_description: description,
  });
}

/**
 * Update task status
 */
export async function updateTaskStatus(id: string | number, statusValue: string): Promise<void> {
  await axiosInstance.patch(`/task/${id}/update_task_status/`, {
    status: statusValue,
  });
}

/**
 * Add comment to task
 * API endpoint: POST /message/ with task_id in body
 * Response structure: { id, task_id, message, message_creator_name, created_at, user_profile: { full_name, profile_image_url } }
 */
export async function addTaskComment(id: string | number, message: string): Promise<ITaskComment> {
  interface MessageApiResponse {
    id: number;
    task_id: number;
    message: string;
    message_creator_name: string;
    created_at: string;
    user_profile: {
      id: number;
      full_name: string;
      profile_image_url: string | null;
    };
  }

  const response = await axiosInstance.post<MessageApiResponse>('/message/', {
    task_id: id,
    message,
  });

  // Transform API response to ITaskComment format
  return {
    id: response.data.id,
    userName: response.data.message_creator_name,
    userEmail: response.data.user_profile?.id ? '' : '', // Email not in response, will be empty
    message: response.data.message,
    createdAt: response.data.created_at,
    userProfile: response.data.user_profile?.profile_image_url || null,
  };
}

/**
 * Update comment message
 * API endpoint: PATCH /message/{id}/ with message in body
 * Response structure: { id, task_id, message, message_creator_name, created_at, user_profile: { full_name, profile_image_url } }
 */
export async function updateTaskComment(commentId: string | number, message: string): Promise<ITaskComment> {
  interface MessageApiResponse {
    id: number;
    task_id: number;
    message: string;
    message_creator_name: string;
    created_at: string;
    user_profile: {
      id: number;
      full_name: string;
      profile_image_url: string | null;
    };
  }

  const response = await axiosInstance.patch<MessageApiResponse>(`/message/${commentId}/`, {
    message,
  });

  // Transform API response to ITaskComment format
  return {
    id: response.data.id,
    userName: response.data.message_creator_name,
    userEmail: response.data.user_profile?.id ? '' : '', // Email not in response, will be empty
    message: response.data.message,
    createdAt: response.data.created_at,
    userProfile: response.data.user_profile?.profile_image_url || null,
  };
}

/**
 * Delete task (soft delete/archive)
 * Sets is_deleted=True
 */
export async function deleteTask(id: string | number): Promise<void> {
  await axiosInstance.delete(`/task/${id}/`);
}

/**
 * Restore archived task
 * Sets is_deleted=False
 */
export interface RestoreTaskResponse {
  message: string;
}

export async function restoreTask(id: string | number): Promise<RestoreTaskResponse> {
  const response = await axiosInstance.post<RestoreTaskResponse>(`/task/${id}/restore/`);
  return response.data;
}

/**
 * Permanently delete task
 * Removes task from database (cannot be undone)
 */
export interface PermanentlyDeleteTaskResponse {
  message: string;
}

export async function permanentlyDeleteTask(id: string | number): Promise<PermanentlyDeleteTaskResponse> {
  const response = await axiosInstance.post<PermanentlyDeleteTaskResponse>(`/task/${id}/delete/`);
  return response.data;
}

