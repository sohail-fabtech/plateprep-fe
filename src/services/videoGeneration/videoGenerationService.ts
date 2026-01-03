import axiosInstance from '../../utils/axios';

// ----------------------------------------------------------------------

export interface GenerateVideoRequest {
  title: string;
  recipe: number;
  introduction: string;
  steps: string[];
  ingredient: string[];
  last_words: string;
  template_id: string;
  language: string;
}

export interface GenerateVideoResponse {
  id: number;
  title: string;
  video: string | null;
}

/**
 * Generate a video for a recipe
 */
/**
 * Extract user-friendly error message from API error response
 */
function getErrorMessage(error: any): string {
  // Handle network errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Video generation may take several minutes. Please try again.';
  }

  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  // Handle API response errors
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data;

    // Authentication errors
    if (status === 401) {
      return 'Your session has expired. Please login again.';
    }

    // Permission errors
    if (status === 403) {
      const detail = errorData?.detail || '';
      if (detail.includes('subscription')) {
        return 'Your subscription has expired or is inactive. Please renew your subscription to generate videos.';
      }
      if (detail.includes('permission')) {
        return 'You do not have permission to generate videos. Please contact your administrator.';
      }
      return detail || 'You do not have permission to perform this action.';
    }

    // Validation errors (400)
    if (status === 400) {
      // Handle specific error messages from backend
      if (errorData?.error) {
        const errorMsg = errorData.error;
        
        // OpenAI API errors
        if (errorMsg.includes('OpenAI') || errorMsg.includes('API key')) {
          return 'AI translation service is currently unavailable. Please try again later.';
        }
        
        // Synthesia API errors
        if (errorMsg.includes('Synthesia') || errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          return 'Video generation service authentication failed. Please contact support.';
        }
        if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
          return 'Video generation service access denied. Please contact support.';
        }
        if (errorMsg.includes('404') || errorMsg.includes('Not Found') || errorMsg.includes('Template not found')) {
          return 'Selected video template is invalid or not found. Please select a different template.';
        }
        if (errorMsg.includes('400') || errorMsg.includes('Bad Request') || errorMsg.includes('Invalid template')) {
          return 'Invalid video template data. Please check your recipe information and try again.';
        }
        if (errorMsg.includes('500') || errorMsg.includes('Server Error')) {
          return 'Video generation service is temporarily unavailable. Please try again later.';
        }
        
        // Video processing errors
        if (errorMsg.includes('Video not ready') || errorMsg.includes('timeout') || errorMsg.includes('100 attempts')) {
          return 'Video processing is taking longer than expected. Please try again or contact support if the issue persists.';
        }
        if (errorMsg.includes('Video processing failed') || errorMsg.includes('rendering failed')) {
          return 'Video processing failed. Please check your recipe data and try again.';
        }
        if (errorMsg.includes('Download URL not found')) {
          return 'Video download failed. Please try generating the video again.';
        }
        
        // Translation errors
        if (errorMsg.includes('translation') || errorMsg.includes('invalid syntax') || errorMsg.includes('malformed')) {
          return 'Failed to translate recipe content. Please check your recipe information and try again.';
        }
        
        // Recipe errors
        if (errorMsg.includes('Recipe') && errorMsg.includes('not exist')) {
          return 'Selected recipe no longer exists. Please select a different recipe.';
        }
        if (errorMsg.includes('already has a video')) {
          return 'This recipe already has a video. Please delete the existing video before creating a new one.';
        }
        
        // File storage errors
        if (errorMsg.includes('file') || errorMsg.includes('storage') || errorMsg.includes('save')) {
          return 'Failed to save video file. Please try again or contact support.';
        }
        
        // Database errors
        if (errorMsg.includes('database') || errorMsg.includes('Database') || errorMsg.includes('connection')) {
          return 'Database error occurred. Please try again later.';
        }
        
        // Connection errors
        if (errorMsg.includes('Connection') || errorMsg.includes('connection refused') || errorMsg.includes('ConnectionError')) {
          return 'Unable to connect to video generation service. Please check your internet connection and try again.';
        }
        
        // Generic error message from backend
        return errorMsg;
      }

      // Handle field-specific validation errors
      const errorMessages: string[] = [];
      Object.keys(errorData).forEach((field) => {
        if (field === 'error' || field === 'detail') return; // Skip generic error fields
        
        if (Array.isArray(errorData[field])) {
          errorData[field].forEach((msg: string) => {
            // Map field names to user-friendly labels
            const fieldLabel = field === 'ingredient' ? 'ingredients' : 
                              field === 'last_words' ? 'last words' :
                              field === 'template_id' ? 'template' :
                              field === 'recipe' ? 'recipe selection' :
                              field;
            errorMessages.push(`${fieldLabel}: ${msg}`);
          });
        } else if (typeof errorData[field] === 'string') {
          const fieldLabel = field === 'ingredient' ? 'ingredients' : 
                            field === 'last_words' ? 'last words' :
                            field === 'template_id' ? 'template' :
                            field === 'recipe' ? 'recipe selection' :
                            field;
          errorMessages.push(`${fieldLabel}: ${errorData[field]}`);
        }
      });
      
      if (errorMessages.length > 0) {
        return errorMessages.join(', ');
      }
      
      return 'Please check your input and try again.';
    }

    // Server errors (500, 502, 503, 504)
    if (status >= 500) {
      return 'Server error occurred. Please try again later. If the problem persists, contact support.';
    }

    // Other HTTP errors
    const detail = errorData?.detail || errorData?.error || errorData?.message;
    if (detail) {
      return detail;
    }
    
    return `Request failed with status ${status}. Please try again.`;
  }

  // Handle request errors (no response)
  if (error.request) {
    return 'No response from server. Please check your internet connection and try again.';
  }

  // Handle other errors
  if (error.message) {
    // Network-related error messages
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      return 'Request timed out. Video generation may take several minutes. Please try again.';
    }
    if (error.message.includes('Network') || error.message.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connection refused')) {
      return 'Unable to connect to server. Please try again later.';
    }
    
    return error.message;
  }

  // Fallback error message
  return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
}

/**
 * Generate a video for a recipe
 */
export async function generateVideo(data: GenerateVideoRequest): Promise<GenerateVideoResponse> {
  try {
    const response = await axiosInstance.post<GenerateVideoResponse>('/video_generation/generate_video/', data, {
      timeout: 20 * 60 * 1000, // 20 minutes timeout for long-running video generation
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}

