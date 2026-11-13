import { ANALYSIS_CATEGORIES, IngredientOverlapRow, PlanOverlapAnalysis } from "@/lib/overlapAnalysis";
import { cn } from "@/lib/utils";
import { CookingCategory } from "@/types";
import { useState } from "react";

// カテゴリごとのセルの色(以前使っていたスプレッドシートの色分けに合わせる)
const CATEGORY_CELL: Record<CookingCategory, { label: string; icon: string; soft: string }> = {
  curry: { label: "カレー", icon: "🍛", soft: "bg-orange-500/15" },
  salad: { label: "サラダ", icon: "🥗", soft: "bg-emerald-500/15" },
  dessert: { label: "デザート", icon: "🥤", soft: "bg-yellow-400/25" },
};

const SORTS = [
  { key: "default", label: "食材順" },
  { key: "required", label: "必要数順" },
  { key: "shared", label: "節約順" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

function sortRows(rows: IngredientOverlapRow[], key: SortKey) {
  if (key === "required") return [...rows].sort((a, b) => b.required - a.required);
  if (key === "shared") return [...rows].sort((a, b) => b.shared - a.shared || b.required - a.required);
  return rows;
}

interface Props {
  analysis: PlanOverlapAnalysis;
  selectedIngredientId: string | null;
  onSelect: (id: string) => void;
}

// 食材ごとに、どのカテゴリでいくつ使うかと、重複で節約できている数を示す表
export function IngredientOverlapTable({ analysis, selectedIngredientId, onSelect }: Props) {
  const [sort, setSort] = useState<SortKey>("default");
  const isSum = analysis.mode === "sum";
  const rows = sortRows(
    analysis.rows.filter((r) => r.categorySum > 0),
    sort
  );

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">レシピを追加すると、カテゴリ別の内訳が表示されます。</p>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {isSum ? (
          <>全カテゴリ合算のプランのため、重複による節約はありません。</>
        ) : (
          <>
            カテゴリ別の合計 <span className="font-semibold tabular-nums text-foreground">{analysis.totalCategorySum}</span> のうち、
            重複で <span className="font-semibold tabular-nums text-emerald-600">{analysis.totalShared}個（{Math.round(analysis.sharedRate * 100)}%）</span>
            を節約しています。
          </>
        )}
      </div>

      <div className="flex gap-1 text-xs">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            className={cn("rounded-md border px-2 py-0.5", sort === s.key ? "bg-muted font-semibold" : "text-muted-foreground")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-xs tabular-nums">
          <thead className="whitespace-nowrap bg-muted/50">
            <tr>
              <th scope="col" className="px-1 py-1.5 text-left font-semibold">食材</th>
              <th scope="col" className="px-1 py-1.5 text-right font-semibold">必要</th>
              {ANALYSIS_CATEGORIES.map((c) => (
                <th key={c} scope="col" className={cn("px-1 py-1.5 text-right font-semibold", CATEGORY_CELL[c].soft)}>
                  <span aria-hidden>{CATEGORY_CELL[c].icon}</span>
                  <span className="sr-only">{CATEGORY_CELL[c].label}</span>
                </th>
              ))}
              <th scope="col" className="px-1 py-1.5 text-right font-semibold text-emerald-600">節約</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onSelect(row.id)}
                className={cn(
                  "cursor-pointer border-t hover:bg-muted/50",
                  selectedIngredientId === row.id && "bg-primary/20 hover:bg-primary/30"
                )}
              >
                <th scope="row" className="max-w-[5rem] truncate px-1 py-1.5 text-left font-medium" title={row.name}>
                  <span className="mr-1">{row.emoji}</span>
                  {row.name}
                </th>
                <td className="px-1 py-1.5 text-right text-sm font-bold text-primary">{row.required}</td>
                {ANALYSIS_CATEGORIES.map((c) => {
                  const amount = row.byCategory[c];
                  // 必要数を決めているカテゴリ(合算では全カテゴリが必要数に加わるため色付けしない)
                  const isDominant = !isSum && amount > 0 && amount === row.required;
                  return (
                    <td
                      key={c}
                      className={cn(
                        "px-1 py-1.5 text-right",
                        isDominant ? cn("font-bold", CATEGORY_CELL[c].soft) : "text-muted-foreground"
                      )}
                    >
                      {amount > 0 ? amount : ""}
                    </td>
                  );
                })}
                <td className="px-1 py-1.5 text-right font-semibold text-emerald-600">{row.shared > 0 ? row.shared : ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/30 font-semibold">
              <th scope="row" className="px-1 py-1.5 text-left">合計</th>
              <td className="px-1 py-1.5 text-right text-sm font-bold">{analysis.totalRequired}</td>
              {ANALYSIS_CATEGORIES.map((c) => (
                <td key={c} className="px-1 py-1.5 text-right">{analysis.categoryTotals[c]}</td>
              ))}
              <td className="px-1 py-1.5 text-right text-emerald-600">{analysis.totalShared}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isSum && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          色付きのセルは、その食材の必要数を決めているカテゴリです。色のない数は、ほかのカテゴリ用に持つ食材で賄えます。
        </p>
      )}
    </div>
  );
}
