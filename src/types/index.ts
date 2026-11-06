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

// 合計食材数の計算方法
// max: 食材ごとにカテゴリ間の最大値を採用(通常週)
// sum: カテゴリをまたいで足し算(「なんでも！」などのイベント週)
export type IngredientTotalMode = 'max' | 'sum';

export interface Plan {
  id: string;
  name: string;
  category: CookingCategory;
  targets: Record<string, number>; // recipeId -> count
  totalMode?: IngredientTotalMode; // 未設定は 'max'
}

export interface Settings {
  bagLimit: number;
  weeklyCategory: CookingCategory | null;
  lastViewedUpdateDate: string | null;
}
