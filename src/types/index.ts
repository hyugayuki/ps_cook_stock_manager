export type CookingCategory = 'curry' | 'salad' | 'dessert';

export interface Ingredient {
  id: string;
  name: string;
  emoji?: string;
}

export interface RecipeIngredient {
  id: string; // Ingredient ID
  count: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: CookingCategory;
  ingredients: RecipeIngredient[];
  energy: number;
  totalIngredients: number;
}

export interface Plan {
  id: string;
  name: string;
  category: CookingCategory;
  targets: Record<string, number>; // recipeId -> count
}

export interface Settings {
  bagLimit: number;
  weeklyCategory: CookingCategory | null;
  lastViewedUpdateDate: string | null;
}
