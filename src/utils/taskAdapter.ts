import { ITaskApiResponse, ITaskDetail, ITaskComment } from '../@types/taskApi';
import { ITaskApiRequest } from '../services/tasks/taskService';
import { ITaskForm } from '../@types/task';

// ----------------------------------------------------------------------
// Task Data Adapter - Transform API response to UI format
// ----------------------------------------------------------------------

/**
 * Transform API response to internal UI format
 */
export function transformApiResponseToTask(apiResponse: ITaskApiResponse): ITaskDetail {
  // Handle task_name which can be an object or null
  const taskName = apiResponse.other_task_name 
    || (apiResponse.task_name && typeof apiResponse.task_name === 'object' 
      ? apiResponse.task_name.task_name 
      : (typeof apiResponse.task_name === 'string' ? apiResponse.task_name : null))
    || 'Untitled Task';

  // Extract recipe ID if task is recipe-based
  const recipeId = apiResponse.task_name && typeof apiResponse.task_name === 'object' 
    ? apiResponse.task_name.id 
    : null;

  return {
    id: apiResponse.id,
    taskName,
    taskDescription: apiResponse.task_description || '',
    status: {
      value: apiResponse.status.value,
      label: apiResponse.status.name,
    },
    priority: {
      value: apiResponse.prority.value,
      label: apiResponse.prority.name,
    },
    startedAt: apiResponse.started_at || '',
    completedAt: apiResponse.completed_at || '',
    kitchenStation: apiResponse.kitchen_station,
    videoLink: apiResponse.attachment_video_link,
    dueDate: apiResponse.due_date || '',
    staffEmail: apiResponse.staff_email,
    staffProfile: apiResponse.staff_profile,
    staffFullName: apiResponse.staff_full_name,
    staffId: apiResponse.staff,
    assignedBy: apiResponse.assigned_by,
    comments: (apiResponse.messages || []).map((msg) => ({
      id: msg.id,
      userName: msg.message_creator_name || msg.user_profile?.full_name || 'Unknown User',
      userEmail: '', // Email not available in message response
      message: msg.message || '',
      createdAt: msg.created_at || '',
      userProfile: msg.user_profile?.profile_image_url || null,
    })),
    isDeleted: apiResponse.is_deleted || false,
    recipeId,
    otherTaskName: apiResponse.other_task_name,
    video: apiResponse.video,
    image: apiResponse.image,
    youtubeUrl: apiResponse.youtube_url,
    branchId: apiResponse.branch || null, // Extract branch ID from task payload
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
 * Transform form data to API request format
 * Used when creating/updating tasks
 */
export function transformTaskFormToApiRequest(
  formData: ITaskForm,
  branchId?: number | string | undefined,
  imageUrl?: string | null,
  videoUrl?: string | null,
  userEmail?: string | null
): ITaskApiRequest {
  const apiRequest: ITaskApiRequest = {};

  // Staff assignment (user ID) - send as string in assignTo and number in staff
  if (formData.assignTo) {
    apiRequest.assignTo = String(formData.assignTo);
    const staffId = parseInt(String(formData.assignTo), 10);
    if (!isNaN(staffId)) {
      apiRequest.staff = staffId;
    }
  }

  // Email address of assigned user
  if (userEmail) {
    apiRequest.emailAddress = userEmail;
  }

  // Task name (recipe ID) or other_task_name
  if (formData.dishSelection === 'other') {
    // Custom task name
    if (formData.taskName) {
      apiRequest.other_task_name = formData.taskName;
    }
    apiRequest.task_name = null;
  } else if (formData.dishSelection) {
    // Recipe-based task
    const recipeId = parseInt(String(formData.dishSelection), 10);
    if (!isNaN(recipeId)) {
      apiRequest.task_name = recipeId;
    }
    apiRequest.other_task_name = null;
  }

  // Task description
  if (formData.description) {
    apiRequest.task_description = formData.description;
  }

  // Priority mapping: 'low' -> 'L', 'medium' -> 'M', 'high' -> 'H', 'urgent' -> 'H'
  const priorityMap: Record<string, string> = {
    low: 'L',
    medium: 'M',
    high: 'H',
    urgent: 'H',
  };
  if (formData.priority && priorityMap[formData.priority]) {
    apiRequest.prority = priorityMap[formData.priority];
  }

  // Kitchen station
  if (formData.kitchenStation) {
    apiRequest.kitchen_station = formData.kitchenStation;
  }

  // Time fields - convert Date to ISO format (full date and time)
  if (formData.taskStartTime && formData.taskStartTime instanceof Date) {
    apiRequest.started_at = formData.taskStartTime.toISOString();
  }

  if (formData.taskCompletionTime && formData.taskCompletionTime instanceof Date) {
    apiRequest.completed_at = formData.taskCompletionTime.toISOString();
  }

  // Due date - convert Date to ISO format
  if (formData.dueDate && formData.dueDate instanceof Date) {
    apiRequest.due_date = formData.dueDate.toISOString();
  }

  // Video link - YouTube URL goes to attachment_video_link
  if (formData.videoLink) {
    if (isYouTubeUrl(formData.videoLink)) {
      // YouTube URL goes to attachment_video_link field
      apiRequest.attachment_video_link = formData.videoLink;
    } else if (!videoUrl) {
      // Non-YouTube video link goes to attachment_video_link
      // Only set if no video file was uploaded (uploaded video takes precedence)
      apiRequest.attachment_video_link = formData.videoLink;
    }
  }

  // Video file uploaded to S3 - goes to video field
  if (videoUrl) {
    apiRequest.video = videoUrl;
  }

  // Image (S3 URL)
  if (imageUrl) {
    apiRequest.image = imageUrl;
  }

  // Status (only for update, not for create - backend always sets to 'AS' on create)
  // Note: We'll only send status on update, not on create
  if (formData.status) {
    const statusMap: Record<string, string> = {
      'pending': 'AS',
      'in-progress': 'IP',
      'completed': 'CP',
      'cancelled': 'CL',
      'draft': 'AS',
    };
    if (statusMap[formData.status]) {
      apiRequest.status = statusMap[formData.status];
    }
  }

  // Branch ID
  if (branchId) {
    const branchIdNum = typeof branchId === 'string' ? parseInt(branchId, 10) : branchId;
    if (!isNaN(branchIdNum)) {
      apiRequest.branch = branchIdNum;
    }
  }

  return apiRequest;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/i;
  return youtubeRegex.test(url);
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

