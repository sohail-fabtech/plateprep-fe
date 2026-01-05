// ----------------------------------------------------------------------

export type ITemplateStatus = 'all' | 'draft' | 'active' | 'archived';

export interface ITemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail: string;
  category?: string;
  status: ITemplateStatus;
  isAvailable: boolean;
  width?: number;
  height?: number;
  json?: string;
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
  createdBy?: string;
}

// ----------------------------------------------------------------------

export type ITemplateFilterValue = string | string[];

