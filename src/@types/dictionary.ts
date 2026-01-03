// ----------------------------------------------------------------------

export interface IDictionaryCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface IDictionaryTerm {
  id: number;
  term: string;
  definition: string | null;
  description: string | null;
  category: {
    id: number;
    name: string;
  };
}

