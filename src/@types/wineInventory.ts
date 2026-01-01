// ----------------------------------------------------------------------

export type IWineType = 'Red' | 'White' | 'Rosé' | 'Sparkling' | 'Fortified' | 'Dessert';

export type IWineProfile =
  | 'Bone Dry – Bold Bitter Finish'
  | 'Bone Dry – Savory'
  | 'Dry – Vegetables & Herbs'
  | 'Dry – Tart Fruits & Flowers'
  | 'Dry – Ripe Fruits & Spices'
  | 'Dry – Fruit Sauce & Vanilla'
  | 'Semi-Sweet – Candied Fruit & Flowers'
  | 'Sweet – Fruit Jam & Chocolate'
  | 'Very Sweet – Figs, Raisins & Dates';

export type IStockStatus = 'IN_STOCK' | 'LOW' | 'OUT';

export type IWineInventoryFilterStatus = 'all' | 'active' | 'archived';

export type IWineInventory = {
  id: string;
  wineName: string;
  producer?: string;
  vintage?: number;
  country: string;
  region: string;
  wineType: IWineType;
  wineProfile?: IWineProfile;
  description?: string;
  imageUrl?: string | null;
  tags: string[];
  inventory: {
    '187.5'?: number; // Split / Piccolo
    '375'?: number; // Demi / Half
    '750'?: number; // Standard
    '1500'?: number; // Magnum
    '3000'?: number; // Jeroboam
  };
  totalStock: number;
  stockStatus: IStockStatus;
  minStockLevel: number;
  maxStockLevel: number;
  purchasePrice?: number;
  supplierName?: string;
  location: string;
  locationId: string;
  isDeleted: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type IWineInventoryForm = {
  wineName: string;
  producer?: string | null;
  vintage?: number | null;
  country: string;
  region: string;
  regionOther?: string | null;
  description?: string | null;
  image: string | null;
  wineType: IWineType;
  wineProfile: IWineProfile;
  tags: string[];
  inventory: {
    '187.5'?: number | null;
    '375'?: number | null;
    '750'?: number | null;
    '1500'?: number | null;
    '3000'?: number | null;
  };
  minStockLevel: number;
  maxStockLevel: number;
  purchasePrice?: number | null;
  supplierName?: string | null;
  locationId: string;
};
