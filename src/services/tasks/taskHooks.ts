import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ITaskDetail, ITaskComment } from '../../@types/taskApi';
import {
  getTaskById,
  getTasks,
  updateTask,
  updateTaskDescription,
  updateTaskStatus,
  addTaskComment,
  deleteTask,
  TaskQueryParams,
} from './taskService';

// Re-export TaskQueryParams for use in other modules
export type { TaskQueryParams };

// ----------------------------------------------------------------------

/**
 * Query key factory for tasks
 */
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: TaskQueryParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...taskKeys.details(), id] as const,
};

/**
 * Hook to fetch a single task by ID
 */
export function useTask(id: string | number | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id!),
    queryFn: () => getTaskById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch list of tasks
 */
export function useTasks(params?: TaskQueryParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => getTasks(params),
  });
}

/**
 * Hook to update a task (general update)
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<ITaskDetail> }) =>
      updateTask(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

/**
 * Hook to update task description
 */
export function useUpdateTaskDescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, description }: { id: string | number; description: string }) =>
      updateTaskDescription(id, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

/**
 * Hook to update task status
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      updateTaskStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

/**
 * Hook to add a comment to a task
 */
export function useAddTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string | number; message: string }) =>
      addTaskComment(id, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
    },
  });
}

