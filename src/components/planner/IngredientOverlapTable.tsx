import { COOKING_CATEGORIES } from "@/data/constants";
import { IngredientOverlapRow, PlanOverlapAnalysis } from "@/lib/overlapAnalysis";
import { cn } from "@/lib/utils";
import { CookingCategory } from "@/types";
import { useId, useState } from "react";

// カテゴリごとのセルの色(以前使っていたスプレッドシートの色分けに合わせる)
const CATEGORY_CELL_COLOR: Record<CookingCategory, string> = {
  curry: "bg-orange-500/15",
  salad: "bg-emerald-500/15",
  dessert: "bg-yellow-400/25",
};

const SORTS = [
  { key: "default", label: "食材順" },
  { key: "required", label: "必要数順" },
  { key: "shared", label: "節約順" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

function sortRows(rows: IngredientOverlapRow[], key: SortKey) {
  if (key === "required") return rows.toSorted((a, b) => b.required - a.required);
  if (key === "shared") return rows.toSorted((a, b) => b.shared - a.shared || b.required - a.required);
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
  const captionId = useId();
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

      <div role="group" aria-label="並び順" className="flex gap-1 text-xs">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={sort === s.key}
            onClick={() => setSort(s.key)}
            className={cn("rounded-md border px-2 py-0.5", sort === s.key ? "bg-muted font-semibold" : "text-muted-foreground")}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 狭い画面では表だけを横スクロールさせる。キーボードでもスクロールできるようフォーカス可能な領域にする */}
      <div role="region" aria-labelledby={captionId} tabIndex={0} className="overflow-x-auto rounded-md border">
        <table className="w-full text-xs tabular-nums">
          <caption id={captionId} className="sr-only">
            食材ごとのカテゴリ別の必要数
          </caption>
          <thead className="whitespace-nowrap bg-muted/50">
            <tr>
              <th scope="col" className="px-1 py-1.5 text-left font-semibold">食材</th>
              <th scope="col" className="px-1 py-1.5 text-right font-semibold">必要</th>
              {COOKING_CATEGORIES.map((c) => (
                <th key={c.value} scope="col" className={cn("px-1 py-1.5 text-right font-semibold", CATEGORY_CELL_COLOR[c.value])}>
                  <span aria-hidden>{c.icon}</span>
                  <span className="sr-only">{c.label}</span>
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
                <th scope="row" className="max-w-[5rem] lg:max-w-[7.5rem] p-0 text-left font-medium">
                  {/* 行のクリックで選択する。キーボードではこのボタンで選択でき、クリックは行へ伝わって処理される */}
                  <button
                    type="button"
                    aria-pressed={selectedIngredientId === row.id}
                    className="block w-full cursor-pointer truncate px-1 py-1.5 text-left"
                    title={row.name}
                  >
                    <span className="mr-1">{row.emoji}</span>
                    {row.name}
                  </button>
                </th>
                <td className="px-1 py-1.5 text-right text-sm font-bold text-primary">{row.required}</td>
                {COOKING_CATEGORIES.map(({ value: c }) => {
                  const amount = row.byCategory[c];
                  // 必要数を決めているカテゴリ(合算では全カテゴリが必要数に加わるため色付けしない)
                  const isDominant = !isSum && amount > 0 && amount === row.required;
                  return (
                    <td
                      key={c}
                      className={cn(
                        "px-1 py-1.5 text-right",
                        isDominant ? cn("font-bold", CATEGORY_CELL_COLOR[c]) : "text-muted-foreground"
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
              {COOKING_CATEGORIES.map(({ value: c }) => (
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
