import { CookingCategory, IngredientTotalMode, Recipe } from "@/types";

export type CategoryTotals = Partial<Record<CookingCategory, Record<string, number>>>;

// カテゴリ(curry/salad/dessert)ごとに、必要食材数を積み上げる
export function computeCategoryTotals(
  targets: Record<string, number>,
  recipes: Recipe[]
): CategoryTotals {
  const categoryTotals: CategoryTotals = {};

  Object.entries(targets).forEach(([recipeId, count]) => {
    if (count <= 0) return;
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const cat = recipe.category;
    if (!categoryTotals[cat]) categoryTotals[cat] = {};

    recipe.ingredients.forEach((ing) => {
      categoryTotals[cat]![ing.id] = (categoryTotals[cat]![ing.id] || 0) + ing.count * count;
    });
  });

  return categoryTotals;
}

// 食材ごとの合計を計算する。
// max: カテゴリ間で最大の必要数を採用する(同時に持ち歩くのは1カテゴリ分でよいため)
// sum: カテゴリをまたいで足し算する(同じ期間に全カテゴリを作るイベント向け)
export function computeTotalIngredients(
  categoryTotals: CategoryTotals,
  mode: IngredientTotalMode = "max"
): Record<string, number> {
  const totals: Record<string, number> = {};

  Object.values(categoryTotals).forEach((catTotal) => {
    if (!catTotal) return;
    Object.entries(catTotal).forEach(([ingId, amount]) => {
      const current = totals[ingId] || 0;
      totals[ingId] = mode === "sum" ? current + amount : Math.max(current, amount);
    });
  });

  return totals;
}

export interface IngredientIncrementDetail {
  id: string;
  recipeAmount: number; // このレシピが1回あたりに必要とする量
  delta: number; // +1したときに合計食材数へ実際に加算される量(他カテゴリで賄える分は0)
}

// 指定レシピを+1した場合に、食材ごとに合計食材数がどれだけ増えるかを計算する。
// max: 他カテゴリで同じ食材がより多く必要とされている場合、その食材分の増加は0になる。
// sum: 他カテゴリでは賄えないので、常にレシピの必要数がそのまま増える。
export function getIncrementBreakdown(
  recipe: Recipe,
  categoryTotals: CategoryTotals,
  totalIngredients: Record<string, number>,
  mode: IngredientTotalMode = "max"
): IngredientIncrementDetail[] {
  if (mode === "sum") {
    return recipe.ingredients.map((ing) => ({
      id: ing.id,
      recipeAmount: ing.count,
      delta: ing.count,
    }));
  }

  const catTotal = categoryTotals[recipe.category] || {};

  return recipe.ingredients.map((ing) => {
    const currentCategoryAmount = catTotal[ing.id] || 0;
    const newCategoryAmount = currentCategoryAmount + ing.count;
    const currentGlobalMax = totalIngredients[ing.id] || 0;
    const newGlobalMax = Math.max(newCategoryAmount, currentGlobalMax);
    return {
      id: ing.id,
      recipeAmount: ing.count,
      delta: newGlobalMax - currentGlobalMax,
    };
  });
}

// 指定レシピを+1した場合に、合計食材数がどれだけ増えるかを計算する。
export function getIncrementImpact(
  recipe: Recipe,
  categoryTotals: CategoryTotals,
  totalIngredients: Record<string, number>,
  mode: IngredientTotalMode = "max"
): number {
  return getIncrementBreakdown(recipe, categoryTotals, totalIngredients, mode).reduce(
    (sum, detail) => sum + detail.delta,
    0
  );
}
