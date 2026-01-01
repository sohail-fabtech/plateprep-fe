// ----------------------------------------------------------------------

export type IRestaurantLocationFilterStatus = 'all' | 'active' | 'archived';

export type ISocialMedia = {
  name: string;
  url: string;
};

export type IRestaurantLocation = {
  id: number;
  branchName: string;
  branchLocation: string;
  phoneNumber: string;
  email: string;
  socialMedia: ISocialMedia[];
  restaurantName: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

// API Response types
export type IRestaurantLocationApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: IRestaurantLocationApiItem[];
  page: number;
};

export type IRestaurantLocationApiItem = {
  id: number;
  branch_name: string;
  branch_location: string;
  phone_number: string;
  email: string;
  social_media: string; // JSON string
  restaurant_name: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

export type IRestaurantLocationForm = {
  branchName: string;
  branchLocation: string;
  phoneNumber: string;
  email: string;
  socialMedia: ISocialMedia[];
};

