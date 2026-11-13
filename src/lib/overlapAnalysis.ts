import { CookingCategory, Ingredient, IngredientTotalMode, Plan, Recipe } from "@/types";
import { computeCategoryTotals, computeTotalIngredients } from "@/lib/ingredientCalculations";

export const ANALYSIS_CATEGORIES: CookingCategory[] = ["curry", "salad", "dessert"];

export interface IngredientOverlapRow {
  id: string;
  name: string;
  emoji?: string;
  byCategory: Record<CookingCategory, number>;
  required: number; // 合計食材数に計上される数(max: カテゴリ間の最大値 / sum: 合算)
  categorySum: number; // カテゴリをまたいで単純に足した数
  shared: number; // 重複により持たずに済んでいる数(categorySum - required)
}

export interface PlanOverlapAnalysis {
  mode: IngredientTotalMode;
  rows: IngredientOverlapRow[]; // 全食材(使われていない食材も含む)
  categoryTotals: Record<CookingCategory, number>; // カテゴリごとの必要食材の合計
  totalRequired: number;
  totalCategorySum: number;
  totalShared: number;
  sharedRate: number; // totalShared / totalCategorySum(0〜1)
}

// プラン内で、食材がどのカテゴリでどれだけ使われ、どれだけ重複しているかを集計する
export function analyzePlanOverlap(plan: Plan, recipes: Recipe[], ingredients: Ingredient[]): PlanOverlapAnalysis {
  const mode: IngredientTotalMode = plan.totalMode === "sum" ? "sum" : "max";
  const perCategory = computeCategoryTotals(plan.targets, recipes);
  const required = computeTotalIngredients(perCategory, mode);

  const rows: IngredientOverlapRow[] = ingredients.map((ing) => {
    const byCategory = {
      curry: perCategory.curry?.[ing.id] ?? 0,
      salad: perCategory.salad?.[ing.id] ?? 0,
      dessert: perCategory.dessert?.[ing.id] ?? 0,
    };
    const categorySum = byCategory.curry + byCategory.salad + byCategory.dessert;
    const req = required[ing.id] ?? 0;
    return { id: ing.id, name: ing.name, emoji: ing.emoji, byCategory, required: req, categorySum, shared: categorySum - req };
  });

  const categoryTotals = {
    curry: rows.reduce((sum, r) => sum + r.byCategory.curry, 0),
    salad: rows.reduce((sum, r) => sum + r.byCategory.salad, 0),
    dessert: rows.reduce((sum, r) => sum + r.byCategory.dessert, 0),
  };
  const totalRequired = rows.reduce((sum, r) => sum + r.required, 0);
  const totalCategorySum = rows.reduce((sum, r) => sum + r.categorySum, 0);
  const totalShared = totalCategorySum - totalRequired;

  return {
    mode,
    rows,
    categoryTotals,
    totalRequired,
    totalCategorySum,
    totalShared,
    sharedRate: totalCategorySum > 0 ? totalShared / totalCategorySum : 0,
  };
}
