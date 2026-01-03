// ----------------------------------------------------------------------
// Task API Response Types
// ----------------------------------------------------------------------

export interface ITaskApiResponse {
  id: number;
  staff: number | null;
  staff_full_name: string;
  task_name: {
    task_name: string;
    id: number;
  } | null;
  task_description: string;
  status: {
    value: string;
    name: string;
  };
  prority: {
    value: string;
    name: string;
  };
  started_at: string | null;
  completed_at: string | null;
  kitchen_station: string;
  attachment_video_link: string | null;
  youtube_url: string | null;
  due_date: string | null;
  staff_email: string;
  staff_profile: string | null;
  messages?: ITaskMessage[];
  task_details?: any | null;
  other_task_name: string | null;
  video: string | null;
  image: string | null;
  staff_detail?: ITaskStaffDetail;
  assigned_by: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  branch?: number | null; // Branch ID from task payload
}

export interface ITaskMessage {
  id: number;
  task_id: number;
  message: string;
  message_creator_name: string;
  created_at: string;
  user_profile?: {
    id: number;
    full_name: string;
    profile_image_url: string | null;
  } | null;
}

export interface ITaskStaffDetail {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_owner: boolean;
  profile: string;
  profile_image_url: string | null;
  phone_number: string;
  date_of_birth: string;
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_active: boolean;
  role_name: string;
  is_password_changed: boolean;
  is_deleted: boolean;
  resturant: any;
  branch: any;
  user_role: any;
  individual_permissions: any[];
}

// Internal UI Type (transformed from API)
export interface ITaskDetail {
  id: number;
  taskName: string;
  taskDescription: string;
  status: {
    value: string;
    label: string;
  };
  priority: {
    value: string;
    label: string;
  };
  startedAt: string;
  completedAt: string;
  kitchenStation: string;
  videoLink: string | null;
  dueDate: string;
  staffEmail: string;
  staffProfile: string | null;
  staffFullName: string;
  staffId: number | null;
  assignedBy: string;
  comments: ITaskComment[];
  isDeleted?: boolean;
  recipeId?: number | null; // Recipe ID if task is recipe-based
  otherTaskName?: string | null; // Custom task name if not recipe-based
  video?: string | null; // S3 video URL
  image?: string | null; // Image URL
  youtubeUrl?: string | null; // YouTube URL
  branchId?: number | null; // Branch ID from task payload
}

export interface ITaskComment {
  id: number;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: string;
  userProfile?: string | null;
}

// Status options
export const TASK_STATUS_OPTIONS = [
  { value: 'AS', label: 'Assigned' },
  { value: 'IP', label: 'In Progress' },
  { value: 'CO', label: 'Completed' },
  { value: 'CA', label: 'Cancelled' },
  { value: 'DR', label: 'Draft' },
];

