import { ITaskApiResponse, ITaskDetail, ITaskComment } from '../@types/taskApi';

// ----------------------------------------------------------------------
// Task Data Adapter - Transform API response to UI format
// ----------------------------------------------------------------------

/**
 * Transform API response to internal UI format
 */
export function transformApiResponseToTask(apiResponse: ITaskApiResponse): ITaskDetail {
  return {
    id: apiResponse.id,
    taskName: apiResponse.other_task_name || apiResponse.task_name || 'Untitled Task',
    taskDescription: apiResponse.task_description || '',
    status: {
      value: apiResponse.status.value,
      label: apiResponse.status.name,
    },
    priority: {
      value: apiResponse.prority.value,
      label: apiResponse.prority.name,
    },
    startedAt: apiResponse.started_at,
    completedAt: apiResponse.completed_at,
    kitchenStation: apiResponse.kitchen_station,
    videoLink: apiResponse.attachment_video_link,
    dueDate: apiResponse.due_date,
    staffEmail: apiResponse.staff_email,
    staffProfile: apiResponse.staff_profile,
    staffFullName: apiResponse.staff_full_name,
    assignedBy: apiResponse.assigned_by,
    comments: apiResponse.messages.map((msg) => ({
      id: msg.id,
      userName: msg.user_name,
      userEmail: msg.user_email,
      message: msg.message,
      createdAt: msg.created_at,
      userProfile: msg.user_profile,
    })),
  };
}

/**
 * Fetch task by ID from API
 */
export async function fetchTaskById(id: string): Promise<ITaskDetail> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/tasks/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.statusText}`);
    }
    
    const apiData: ITaskApiResponse = await response.json();
    return transformApiResponseToTask(apiData);
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
}

/**
 * Update task description
 */
export async function updateTaskDescription(
  taskId: number,
  description: string
): Promise<void> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_description: description,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating task description:', error);
    throw error;
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: number,
  statusValue: string
): Promise<void> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: statusValue,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update task status: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}

/**
 * Add comment to task
 */
export async function addTaskComment(
  taskId: number,
  message: string
): Promise<ITaskComment> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/tasks/${taskId}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      id: data.id,
      userName: data.user_name,
      userEmail: data.user_email,
      message: data.message,
      createdAt: data.created_at,
      userProfile: data.user_profile,
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Delete task
 */
export async function deleteTask(taskId: number): Promise<void> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/tasks/${taskId}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Get YouTube video ID from URL
 */
export function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return match && match[2].length === 11 ? match[2] : null;
}

