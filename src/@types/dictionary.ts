// ----------------------------------------------------------------------

export interface IDictionaryCategory {
  id: number;
  name: string;
  description: string;
}

export interface IDictionaryTerm {
  id: number;
  term: string;
  definition: string;
  description: string;
  category: {
    id: number;
    name: string;
  };
}

