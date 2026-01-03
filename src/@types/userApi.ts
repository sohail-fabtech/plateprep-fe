// ----------------------------------------------------------------------
// User API Types - Matching API Response Structure
// ----------------------------------------------------------------------

export interface IUserApiResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_name: string;
  is_owner: boolean;
  profile: string | null;
  profile_image_url: string | null;
  phone_number: string;
  date_of_birth: string | null;
  street_address: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  is_active: boolean;
  is_password_changed: boolean;
  is_deleted: boolean;
  resturant: {
    id: number;
    resturant_name: string;
  } | null;
  branch: {
    id: number;
    branch_name: string;
    branch_location: string;
    phone_number?: string;
    email?: string;
  } | null;
  user_role: {
    id: number;
    role_name: string;
    description: string;
    permissions: Array<{
      id: number;
      name: string;
      codename: string;
    }>;
  } | null;
  individual_permissions: Array<{
    id: number;
    name: string;
    codename: string;
  }>;
}

export interface IUserDetail extends IUserApiResponse {
  // Same structure as API response for now
}

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  results: IUserApiResponse[];
}

export interface RestoreUserResponse {
  message: string;
  user: IUserApiResponse;
}

export interface PermanentlyDeleteUserResponse {
  message: string;
}

