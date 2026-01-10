import axiosInstance from '../../utils/axios';
import { IWineInventory } from '../../@types/wineInventory';
import { QueryParams, PaginatedResponse } from '../common/types';

export type WineBottleInventory = {
  '187.5'?: number;
  '375'?: number;
  '750'?: number;
  '1500'?: number;
  '3000'?: number;
};

export type InventoryItem = {
  bottle_size: number;
  quantity: number | null;
  purchase_price: number | null;
  menu_price: number | null;
};

export interface WineInventoryQueryParams extends QueryParams {
  search?: string;
  wine_type?: string;
  region?: string;
  stock_status?: string;
  wine_profile?: string;
  flavor?: string;
  branch?: number;
  is_deleted?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface WineInventoryListResponse extends PaginatedResponse<IWineInventory> {
  page?: number;
}

export type WineInventoryApiRequest = {
  wine_name: string;
  wine_type: string;
  wine_profile: string;
  country: string;
  region: string;
  branch: number | null;
  min_stock_level: number;
  max_stock_level: number;
  stock: number;
  vintage?: number | null;
  producer?: string | null;
  description?: string | null;
  supplier_name?: string | null;
  tags?: string[];
  inventory: InventoryItem[];
  per_glass_price: number | null;
  image_url?: string | null;
};

export interface RestoreWineResponse {
  message: string;
}

export interface PermanentlyDeleteWineResponse {
  message: string;
}

type CreateWineParams = {
  data: WineInventoryApiRequest;
};

type UpdateWineParams = {
  id: string | number;
  data: Partial<WineInventoryApiRequest>;
};

export async function createWineInventory({ data }: CreateWineParams) {
  const response = await axiosInstance.post('/custom-wine/', data);

  return response.data;
}

export async function updateWineInventory({ id, data }: UpdateWineParams) {
  const response = await axiosInstance.patch(`/custom-wine/${id}/`, data);

  return response.data;
}

/**
 * Transform API response to IWineInventory format
 */
function transformApiResponseToWineInventory(apiResponse: any): IWineInventory {
  // Parse inventory from array format to object format
  const inventory: IWineInventory['inventory'] = {
    '187.5': 0,
    '375': 0,
    '750': 0,
    '1500': 0,
    '3000': 0,
  };

  const purchasePrices: IWineInventory['purchasePrices'] = {};
  const menuPrices: IWineInventory['menuPrices'] = {};

  if (Array.isArray(apiResponse.inventory)) {
    apiResponse.inventory.forEach((item: InventoryItem) => {
      const key = String(item.bottle_size) as '187.5' | '375' | '750' | '1500' | '3000';
      inventory[key] = item.quantity ?? 0;
      if (item.purchase_price !== null) {
        purchasePrices[key] = item.purchase_price;
      }
      if (item.menu_price !== null) {
        menuPrices[key] = item.menu_price;
      }
    });
  }

  // Calculate total stock from inventory
  const totalStock = Object.values(inventory).reduce((sum, val) => sum + (val || 0), 0);

  // Determine stock status
  const stock = apiResponse.stock || totalStock;
  const minStock = apiResponse.min_stock_level || 0;
  const maxStock = apiResponse.max_stock_level || 100;
  let stockStatus: IWineInventory['stockStatus'] = 'IN_STOCK';
  if (stock <= 0) {
    stockStatus = 'OUT';
  } else if (stock < minStock) {
    stockStatus = 'LOW';
  }

  // Parse tags (could be string or array)
  let tags: string[] = [];
  if (apiResponse.tags) {
    if (typeof apiResponse.tags === 'string') {
      try {
        tags = JSON.parse(apiResponse.tags);
      } catch {
        tags = [];
      }
    } else if (Array.isArray(apiResponse.tags)) {
      tags = apiResponse.tags;
    }
  }

  // Handle branch - can be a number (ID) or an object
  let locationId = '';
  let location = '';
  if (apiResponse.branch) {
    if (typeof apiResponse.branch === 'number') {
      locationId = String(apiResponse.branch);
    } else if (typeof apiResponse.branch === 'object' && apiResponse.branch.id) {
      locationId = String(apiResponse.branch.id);
      location = apiResponse.branch.branch_name || '';
    }
  }

  // Parse per_glass_price - can be string or number
  let perGlassPrice: number | undefined = undefined;
  if (apiResponse.per_glass_price !== null && apiResponse.per_glass_price !== undefined) {
    if (typeof apiResponse.per_glass_price === 'string') {
      const parsed = parseFloat(apiResponse.per_glass_price);
      perGlassPrice = isNaN(parsed) ? undefined : parsed;
    } else if (typeof apiResponse.per_glass_price === 'number') {
      perGlassPrice = apiResponse.per_glass_price;
    }
  }

  return {
    id: String(apiResponse.id),
    wineName: apiResponse.wine_name || '',
    producer: apiResponse.producer || undefined,
    vintage: apiResponse.vintage || undefined,
    country: apiResponse.country || '',
    region: apiResponse.region || '',
    wineType: apiResponse.wine_type || 'Red',
    wineProfile: apiResponse.wine_profile || 'Dry – Ripe Fruits & Spices',
    description: apiResponse.description || undefined,
    imageUrl: apiResponse.image_url || apiResponse.image || null,
    tags,
    inventory,
    purchasePrices: Object.keys(purchasePrices).length > 0 ? purchasePrices : undefined,
    menuPrices: Object.keys(menuPrices).length > 0 ? menuPrices : undefined,
    perGlassPrice,
    totalStock: stock,
    stockStatus,
    minStockLevel: apiResponse.min_stock_level || 0,
    maxStockLevel: apiResponse.max_stock_level || 0,
    supplierName: apiResponse.supplier_name || undefined,
    location,
    locationId,
    isDeleted: apiResponse.is_deleted || false,
    createdAt: apiResponse.created_at,
    updatedAt: apiResponse.updated_at,
  };
}

/**
 * Fetch wine inventory by ID
 */
export async function getWineInventoryById(id: string | number): Promise<IWineInventory> {
  const response = await axiosInstance.get(`/custom-wine/${id}/`);
  return transformApiResponseToWineInventory(response.data);
}

/**
 * Fetch list of wine inventory with pagination and filters
 */
export async function getWineInventoryList(
  params?: WineInventoryQueryParams
): Promise<WineInventoryListResponse> {
  const queryParams: Record<string, string | number | boolean> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search) queryParams.search = params.search;
  if (params?.wine_type) queryParams.wine_type = params.wine_type;
  if (params?.region) queryParams.region = params.region;
  if (params?.stock_status) queryParams.stock_status = params.stock_status;
  if (params?.wine_profile) queryParams.wine_profile = params.wine_profile;
  if (params?.flavor) queryParams.flavor = params.flavor;
  if (params?.branch) queryParams.branch = params.branch;
  if (params?.is_deleted !== undefined) queryParams.is_deleted = params.is_deleted;
  if (params?.ordering) queryParams.ordering = params.ordering;

  const response = await axiosInstance.get<{
    count: number;
    next: string | null;
    previous: string | null;
    page?: number;
    results: any[];
  }>('/custom-wine/', {
    params: queryParams,
  });

  return {
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
    page: response.data.page,
    results: response.data.results.map(transformApiResponseToWineInventory),
  };
}

/**
 * Delete wine inventory (soft delete / archive)
 */
export async function deleteWineInventory(id: string | number): Promise<void> {
  await axiosInstance.delete(`/custom-wine/${id}/`);
}

/**
 * Restore archived wine inventory
 */
export async function restoreWineInventory(
  id: string | number
): Promise<RestoreWineResponse> {
  const response = await axiosInstance.post<RestoreWineResponse>(`/custom-wine/${id}/restore/`);
  return response.data;
}

/**
 * Permanently delete wine inventory
 */
export async function permanentlyDeleteWineInventory(
  id: string | number
): Promise<PermanentlyDeleteWineResponse> {
  const response = await axiosInstance.post<PermanentlyDeleteWineResponse>(
    `/custom-wine/${id}/delete/`
  );
  return response.data;
}

