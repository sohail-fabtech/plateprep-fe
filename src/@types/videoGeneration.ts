// ----------------------------------------------------------------------

export type IVideoGenerationStatus = 'all' | 'live' | 'archived';

export interface IVideoGeneration {
  id: number;
  dish_name: string;
  video: string; // Video URL
  status?: 'live' | 'draft' | 'archived';
  isArchived?: boolean;
  createdAt?: string;
}

export interface IVideoTemplate {
  id: string;
  name: string;
  thumbnail: string;
  videoUrl: string;
  duration: string; // Format: "MM:SS"
}

export interface IVideoGenerationForm {
  selectedTemplate: string;
  recipe: string; // Recipe ID or "other"
  recipeName?: string; // Manual recipe name when "other" is selected
  language: string;
  introduction: string;
  lastWords: string;
  ingredients: string[]; // Just ingredient names, no quantity/unit
  steps: string[];
}
