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
}

/**
 * Fetch task by ID
 */
export async function getTaskById(id: string | number): Promise<ITaskDetail> {
  const response = await axiosInstance.get<ITaskApiResponse>(`/api/tasks/${id}/`);
  return transformApiResponseToTask(response.data);
}

/**
 * Fetch list of tasks
 */
export async function getTasks(params?: TaskQueryParams): Promise<ITaskDetail[]> {
  const response = await axiosInstance.get<PaginatedResponse<ITaskApiResponse>>('/api/tasks/', {
    params,
  });
  return response.data.results.map(transformApiResponseToTask);
}

/**
 * Update task (general update)
 */
export async function updateTask(id: string | number, data: Partial<ITaskDetail>): Promise<ITaskDetail> {
  const response = await axiosInstance.patch<ITaskApiResponse>(`/api/tasks/${id}/`, data);
  return transformApiResponseToTask(response.data);
}

/**
 * Update task description
 */
export async function updateTaskDescription(id: string | number, description: string): Promise<void> {
  await axiosInstance.patch(`/api/tasks/${id}/`, {
    task_description: description,
  });
}

/**
 * Update task status
 */
export async function updateTaskStatus(id: string | number, statusValue: string): Promise<void> {
  await axiosInstance.patch(`/api/tasks/${id}/`, {
    status: statusValue,
  });
}

/**
 * Add comment to task
 */
export async function addTaskComment(id: string | number, message: string): Promise<ITaskComment> {
  const response = await axiosInstance.post<ITaskComment>(`/api/tasks/${id}/comments/`, {
    message,
  });
  return response.data;
}

/**
 * Delete task
 */
export async function deleteTask(id: string | number): Promise<void> {
  await axiosInstance.delete(`/api/tasks/${id}/`);
}

