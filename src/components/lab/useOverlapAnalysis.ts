import { useMemo } from "react";
import { ingredients } from "@/data/ingredients";
import { recipes } from "@/data/recipes";
import { analyzePlanOverlap } from "@/lib/overlapAnalysis";
import { usePlannerStore } from "@/store/usePlannerStore";
import { CookingCategory } from "@/types";

// カテゴリごとの表示用の色(スプレッドシートの色分けに合わせる)
export const CATEGORY_STYLE: Record<CookingCategory, { label: string; icon: string; bar: string; soft: string; text: string }> = {
  curry: { label: "カレー", icon: "🍛", bar: "bg-orange-500", soft: "bg-orange-500/15", text: "text-orange-600" },
  salad: { label: "サラダ", icon: "🥗", bar: "bg-emerald-500", soft: "bg-emerald-500/15", text: "text-emerald-600" },
  dessert: { label: "デザート", icon: "🥤", bar: "bg-yellow-400", soft: "bg-yellow-400/25", text: "text-yellow-700" },
};

// 選択中プランの重複分析。プランが見つからない場合は null
export function useOverlapAnalysis() {
  const { plans, currentPlanId } = usePlannerStore();
  const plan = plans.find((p) => p.id === currentPlanId) ?? null;

  return useMemo(() => (plan ? { plan, analysis: analyzePlanOverlap(plan, recipes, ingredients) } : null), [plan]);
}
