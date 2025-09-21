export interface Recipe {
  id: string;
  image: string; // Base64 encoded string
  title: string;
  description: string;
  category: string;
  servingSize: number;
  time: string;
  ingredients: { value: string }[];
  steps: { value: string }[];
  referenceLink: string;
  thumbnailUrl?: string | null;
}
