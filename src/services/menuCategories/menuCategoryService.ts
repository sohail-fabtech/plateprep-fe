import axiosInstance from '../../utils/axios';

// ----------------------------------------------------------------------

export interface IMenuCategory {
  id: number;
  categoryName: string;
}

export interface IMenuCategoryApiResponse {
  id: number;
  category_name: string | null;
}

/**
 * Transform API response to internal format
 */
function transformApiResponseToMenuCategory(apiResponse: IMenuCategoryApiResponse): IMenuCategory {
  return {
    id: apiResponse.id,
    categoryName: apiResponse.category_name || '',
  };
}

/**
 * Fetch all menu categories
 * Note: This endpoint returns all categories (no pagination)
 */
export async function getMenuCategories(): Promise<IMenuCategory[]> {
  const response = await axiosInstance.get<IMenuCategoryApiResponse[]>('/menu-categories/');
  return (response.data || []).map(transformApiResponseToMenuCategory);
}

