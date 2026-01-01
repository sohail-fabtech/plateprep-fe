// ----------------------------------------------------------------------

export type IHowToCategory = 
  | 'Getting Started'
  | 'Recipes Management'
  | 'Tasks & Scheduling'
  | 'Wine Inventory'
  | 'Restaurant Locations'
  | 'User Management'
  | 'Settings & Configuration'
  | 'Troubleshooting';

export interface IHowToGuide {
  id: string;
  title: string;
  description: string;
  category: IHowToCategory;
  content: string; // HTML or markdown content
  cover?: string; // Image URL
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date | string | number;
  updatedAt?: Date | string | number;
  view: number;
  helpful: number; // Number of helpful votes
  tags?: string[];
  featured?: boolean;
  popular?: boolean;
  relatedGuides?: string[]; // IDs of related guides
}

export type IHowToFilterCategory = IHowToCategory | 'All';

export type IHowToSortBy = 'latest' | 'popular' | 'mostViewed' | 'mostHelpful';

