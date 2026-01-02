import { useQuery } from '@tanstack/react-query';
import { getMenuCategories, IMenuCategory } from './menuCategoryService';

// ----------------------------------------------------------------------

export const menuCategoryKeys = {
  all: ['menuCategories'] as const,
  lists: () => [...menuCategoryKeys.all, 'list'] as const,
  list: () => [...menuCategoryKeys.lists()] as const,
};

/**
 * Hook to fetch menu categories list
 * Note: This endpoint returns all categories (no pagination)
 */
export function useMenuCategories() {
  return useQuery<IMenuCategory[]>({
    queryKey: menuCategoryKeys.list(),
    queryFn: () => getMenuCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

