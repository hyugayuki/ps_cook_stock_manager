import { useMemo } from "react";
import { recipes } from "@/data/recipes";
import { computeCategoryTotals, computeTotalIngredients } from "@/lib/ingredientCalculations";
import { Plan } from "@/types";

// プランのカテゴリ別の必要食材数と、計算方法(max/sum)に沿った合計食材数
export function usePlanTotals(plan: Plan | undefined) {
  const targets = plan?.targets;
  const totalMode = plan?.totalMode;

  return useMemo(() => {
    const categoryTotals = computeCategoryTotals(targets ?? {}, recipes);
    const totalIngredients = computeTotalIngredients(categoryTotals, totalMode);
    return { categoryTotals, totalIngredients };
  }, [targets, totalMode]);
}
