"use client";

import { CATEGORY_STYLE, useOverlapAnalysis } from "@/components/lab/useOverlapAnalysis";
import { OverlapSummary } from "@/components/lab/OverlapSummary";
import { recipes } from "@/data/recipes";
import { computeCategoryTotals, computeTotalIngredients, getIncrementImpact } from "@/lib/ingredientCalculations";
import { ANALYSIS_CATEGORIES } from "@/lib/overlapAnalysis";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Minus, Plus } from "lucide-react";
import { useMemo } from "react";

const CANDIDATES_PER_CATEGORY = 3;

// null は「食材が増えない(実質タダ)」を表す
function formatRatio(value: number | null) {
  return value === null ? "増えない" : Math.round(value).toLocaleString();
}

// 食材あたりエナジーの比較。null(食材が増えない)は最も効率が高いものとして扱う
function compareRatio(a: number | null, b: number | null) {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

// 案C: レシピ単位で「1回分の実質的な食材コスト」とエナジーを比べる
export default function LabRecipesPage() {
  const result = useOverlapAnalysis();
  const updateTarget = usePlannerStore((s) => s.updateTarget);
  const plan = result?.plan;

  // プランにまだ入っていないレシピのうち、+1したときの食材あたりエナジーが高いもの
  const candidates = useMemo(() => {
    if (!plan) return [];
    const mode = plan.totalMode === "sum" ? "sum" : "max";
    const categoryTotals = computeCategoryTotals(plan.targets, recipes);
    const totals = computeTotalIngredients(categoryTotals, mode);
    return ANALYSIS_CATEGORIES.flatMap((category) =>
      recipes
        .filter((r) => r.category === category && !(plan.targets[r.id] > 0) && r.totalIngredients > 0)
        .map((r) => {
          const increment = getIncrementImpact(r, categoryTotals, totals, mode);
          return { recipe: r, increment, ratio: increment > 0 ? r.energy / increment : null };
        })
        .sort((a, b) => compareRatio(b.ratio, a.ratio) || b.recipe.energy - a.recipe.energy)
        .slice(0, CANDIDATES_PER_CATEGORY)
    );
  }, [plan]);

  if (!result) return <p className="text-sm text-muted-foreground">プランが見つかりません。</p>;
  const { analysis } = result;
  const rows = [...analysis.recipes].sort((a, b) => compareRatio(a.energyPerMarginal, b.energyPerMarginal));

  return (
    <>
      <OverlapSummary analysis={analysis} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">プラン内のレシピ（効率の低い順）</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          「実質」は、そのレシピを1回減らしたときに合計食材数が減る数です。ほかのカテゴリと共有している食材は数えません。
          「⚡/個」は実質1個あたりのエナジーで、低いレシピほど入れ替えの候補になります。
        </p>

        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">このプランにはまだレシピがありません。</p>
        )}

        {rows.map((row) => {
          const style = CATEGORY_STYLE[row.recipe.category];
          const sharedRate = row.amount > 0 ? 1 - row.marginal / row.amount : 0;
          return (
            <div key={row.recipe.id} className="space-y-2 rounded-xl border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">
                    <span className="mr-1">{style.icon}</span>
                    {row.recipe.name}
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">⚡{row.energy.toLocaleString()} / 回</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="1回減らす"
                    onClick={() => updateTarget(row.recipe.id, row.count - 1)}
                    className="rounded-md border p-1"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold tabular-nums">{row.count}</span>
                  <button
                    type="button"
                    aria-label="1回増やす"
                    onClick={() => updateTarget(row.recipe.id, row.count + 1)}
                    className="rounded-md border p-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs tabular-nums">
                <div>
                  <div className="text-[10px] text-muted-foreground">食材</div>
                  <div className="font-semibold">{row.amount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">実質</div>
                  <div className="font-semibold">{row.marginal}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">⚡/個</div>
                  <div className="font-bold">{formatRatio(row.energyPerMarginal)}</div>
                </div>
              </div>

              {/* 食材のうち、実質(濃い色)と共有分(薄い色)の割合 */}
              <div className="space-y-0.5">
                <div className={cn("flex h-2 overflow-hidden rounded-full", "bg-emerald-500/30")}>
                  <div className={style.bar} style={{ width: `${row.amount > 0 ? (row.marginal / row.amount) * 100 : 0}%` }} />
                </div>
                <div className="text-right text-[10px] text-muted-foreground">
                  共有 {Math.round(sharedRate * 100)}%
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">次に足すなら（カテゴリごとの上位{CANDIDATES_PER_CATEGORY}件）</h2>
        <p className="text-xs text-muted-foreground">
          プランに入っていないレシピを+1したときの、増える食材1個あたりのエナジーです（🎒バッジと同じ計算）。
          「増えない」は、ほかのカテゴリ用に持つ食材の範囲で作れるため、合計食材数が増えないレシピです。
        </p>
        <div className="divide-y rounded-xl border bg-card">
          {candidates.map(({ recipe, increment, ratio }) => (
            <div key={recipe.id} className="flex items-center gap-2 px-3 py-2 text-xs">
              <span>{CATEGORY_STYLE[recipe.category].icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{recipe.name}</div>
                <div className="tabular-nums text-[10px] text-muted-foreground">
                  ⚡{recipe.energy.toLocaleString()} / 🎒+{increment}
                </div>
              </div>
              <div className="w-16 shrink-0 text-right tabular-nums">
                <div className="text-[10px] text-muted-foreground">⚡/個</div>
                <div className={cn("font-bold", ratio === null && "text-emerald-600")}>{formatRatio(ratio)}</div>
              </div>
              <button
                type="button"
                aria-label={`${recipe.name}を追加`}
                onClick={() => updateTarget(recipe.id, 1)}
                className="shrink-0 rounded-md border p-1"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
