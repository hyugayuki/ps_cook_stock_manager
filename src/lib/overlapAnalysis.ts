import { CookingCategory, Ingredient, IngredientTotalMode, Plan, Recipe } from "@/types";
import { CategoryTotals, computeCategoryTotals, computeTotalIngredients } from "@/lib/ingredientCalculations";

export const ANALYSIS_CATEGORIES: CookingCategory[] = ["curry", "salad", "dessert"];

export interface IngredientOverlapRow {
  id: string;
  name: string;
  emoji?: string;
  byCategory: Record<CookingCategory, number>;
  required: number; // 合計食材数に計上される数(max: カテゴリ間の最大値 / sum: 合算)
  categorySum: number; // カテゴリをまたいで単純に足した数
  shared: number; // 重複により持たずに済んでいる数(categorySum - required)
  usedCategoryCount: number; // この食材を使うカテゴリ数
  dominant: CookingCategory | null; // 必要数を決めているカテゴリ(max のとき、最大値のカテゴリ)
}

export interface CategoryOverlapSummary {
  category: CookingCategory;
  total: number; // このカテゴリのレシピに必要な食材の合計
  sharedWithOthers: number; // そのうち、他カテゴリでも必要なため追加の持ち物にならない数
  energy: number; // このカテゴリのレシピのエナジー合計(目標回数分)
  recipeCount: number; // 目標回数の合計
}

export interface RecipeEfficiencyRow {
  recipe: Recipe;
  count: number;
  energy: number; // 1回あたりのエナジー
  amount: number; // 1回あたりの食材数
  marginal: number; // 1回減らすと合計食材数が減る数(= この1回の実質的な食材コスト)
  energyPerMarginal: number | null; // marginal が 0 のときは null(実質タダ)
}

export interface PlanOverlapAnalysis {
  mode: IngredientTotalMode;
  rows: IngredientOverlapRow[]; // 全食材(使われていない食材も含む)
  categories: CategoryOverlapSummary[];
  recipes: RecipeEfficiencyRow[];
  totalRequired: number;
  totalCategorySum: number;
  totalShared: number;
  sharedRate: number; // totalShared / totalCategorySum(0〜1)
  totalEnergy: number;
}

function sumValues(record: Record<string, number>): number {
  return Object.values(record).reduce((sum, v) => sum + v, 0);
}

function requiredTotal(targets: Record<string, number>, recipes: Recipe[], mode: IngredientTotalMode): number {
  return sumValues(computeTotalIngredients(computeCategoryTotals(targets, recipes), mode));
}

function amountOf(categoryTotals: CategoryTotals, category: CookingCategory, ingredientId: string): number {
  return categoryTotals[category]?.[ingredientId] ?? 0;
}

// プラン内で、食材がどのカテゴリでどれだけ使われ、どれだけ重複しているかを集計する
export function analyzePlanOverlap(
  plan: Plan,
  recipes: Recipe[],
  ingredients: Ingredient[]
): PlanOverlapAnalysis {
  const mode: IngredientTotalMode = plan.totalMode === "sum" ? "sum" : "max";
  const categoryTotals = computeCategoryTotals(plan.targets, recipes);
  const required = computeTotalIngredients(categoryTotals, mode);

  const rows: IngredientOverlapRow[] = ingredients.map((ing) => {
    const byCategory = {
      curry: amountOf(categoryTotals, "curry", ing.id),
      salad: amountOf(categoryTotals, "salad", ing.id),
      dessert: amountOf(categoryTotals, "dessert", ing.id),
    };
    const categorySum = byCategory.curry + byCategory.salad + byCategory.dessert;
    const req = required[ing.id] ?? 0;
    const maxAmount = Math.max(byCategory.curry, byCategory.salad, byCategory.dessert);
    const dominant =
      mode === "max" && maxAmount > 0
        ? ANALYSIS_CATEGORIES.find((c) => byCategory[c] === maxAmount) ?? null
        : null;

    return {
      id: ing.id,
      name: ing.name,
      emoji: ing.emoji,
      byCategory,
      required: req,
      categorySum,
      shared: categorySum - req,
      usedCategoryCount: ANALYSIS_CATEGORIES.filter((c) => byCategory[c] > 0).length,
      dominant,
    };
  });

  const categories: CategoryOverlapSummary[] = ANALYSIS_CATEGORIES.map((category) => {
    let total = 0;
    let sharedWithOthers = 0;
    rows.forEach((row) => {
      const own = row.byCategory[category];
      if (own <= 0) return;
      total += own;
      if (mode === "max") {
        const othersMax = Math.max(
          ...ANALYSIS_CATEGORIES.filter((c) => c !== category).map((c) => row.byCategory[c])
        );
        sharedWithOthers += Math.min(own, othersMax);
      }
    });

    let energy = 0;
    let recipeCount = 0;
    Object.entries(plan.targets).forEach(([recipeId, count]) => {
      if (count <= 0) return;
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe || recipe.category !== category) return;
      energy += recipe.energy * count;
      recipeCount += count;
    });

    return { category, total, sharedWithOthers, energy, recipeCount };
  });

  const totalRequired = sumValues(required);
  const recipeRows: RecipeEfficiencyRow[] = [];
  Object.entries(plan.targets).forEach(([recipeId, count]) => {
    if (count <= 0) return;
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    const marginal = totalRequired - requiredTotal({ ...plan.targets, [recipeId]: count - 1 }, recipes, mode);
    recipeRows.push({
      recipe,
      count,
      energy: recipe.energy,
      amount: recipe.totalIngredients,
      marginal,
      energyPerMarginal: marginal > 0 ? recipe.energy / marginal : null,
    });
  });

  const totalCategorySum = rows.reduce((sum, r) => sum + r.categorySum, 0);
  const totalShared = totalCategorySum - totalRequired;

  return {
    mode,
    rows,
    categories,
    recipes: recipeRows,
    totalRequired,
    totalCategorySum,
    totalShared,
    sharedRate: totalCategorySum > 0 ? totalShared / totalCategorySum : 0,
    totalEnergy: categories.reduce((sum, c) => sum + c.energy, 0),
  };
}
