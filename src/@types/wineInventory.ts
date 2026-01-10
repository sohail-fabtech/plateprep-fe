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
  purchasePrices?: {
    '187.5'?: number;
    '375'?: number;
    '750'?: number;
    '1500'?: number;
    '3000'?: number;
  };
  menuPrices?: {
    '187.5'?: number;
    '375'?: number;
    '750'?: number;
    '1500'?: number;
    '3000'?: number;
  };
  perGlassPrice?: number;
  totalStock: number;
  stockStatus: IStockStatus;
  minStockLevel: number;
  maxStockLevel: number;
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
  // Bottle quantities
  bottle187: number | null;
  bottle375: number | null;
  bottle750: number | null;
  bottle1500: number | null;
  bottle3000: number | null;
  // Purchase prices per bottle size
  purchasePrice187: number | null;
  purchasePrice375: number | null;
  purchasePrice750: number | null;
  purchasePrice1500: number | null;
  purchasePrice3000: number | null;
  // Menu prices per bottle size
  menuPrice187: number | null;
  menuPrice375: number | null;
  menuPrice750: number | null;
  menuPrice1500: number | null;
  menuPrice3000: number | null;
  // Per glass price
  perGlassPrice: number | null;
  minStockLevel: number;
  maxStockLevel: number;
  stock: number;
  supplierName?: string | null;
  locationId: string;
};
