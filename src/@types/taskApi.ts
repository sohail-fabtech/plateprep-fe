// ----------------------------------------------------------------------
// Task API Response Types
// ----------------------------------------------------------------------

export interface ITaskApiResponse {
  id: number;
  staff: number;
  staff_full_name: string;
  task_name: string | null;
  task_description: string;
  status: {
    value: string;
    name: string;
  };
  prority: {
    value: string;
    name: string;
  };
  started_at: string;
  completed_at: string;
  kitchen_station: string;
  attachment_video_link: string | null;
  due_date: string;
  staff_email: string;
  staff_profile: string | null;
  messages: ITaskMessage[];
  task_details: any | null;
  other_task_name: string;
  video: any | null;
  image: any | null;
  staff_detail: ITaskStaffDetail;
  assigned_by: string;
}

export interface ITaskMessage {
  id: number;
  user_name: string;
  user_email: string;
  message: string;
  created_at: string;
  user_profile?: string | null;
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
  assignedBy: string;
  comments: ITaskComment[];
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

