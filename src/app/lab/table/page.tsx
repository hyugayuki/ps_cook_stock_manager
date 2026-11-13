"use client";

import { CATEGORY_STYLE, useOverlapAnalysis } from "@/components/lab/useOverlapAnalysis";
import { OverlapSummary } from "@/components/lab/OverlapSummary";
import { ANALYSIS_CATEGORIES, IngredientOverlapRow } from "@/lib/overlapAnalysis";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

// 案A: スプレッドシートと同じ「食材 × カテゴリ」の表。必要数を決めているカテゴリを色付きで示す
export default function LabTablePage() {
  const result = useOverlapAnalysis();
  const [sort, setSort] = useState<SortKey>("default");
  const [showUnused, setShowUnused] = useState(false);

  if (!result) return <p className="text-sm text-muted-foreground">プランが見つかりません。</p>;
  const { analysis } = result;
  const rows = sortRows(
    analysis.rows.filter((r) => showUnused || r.categorySum > 0),
    sort
  );

  return (
    <>
      <OverlapSummary analysis={analysis} />

      <div className="flex flex-wrap items-center gap-1 text-xs">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            className={cn("rounded-md border px-2 py-1", sort === s.key ? "bg-muted font-semibold" : "text-muted-foreground")}
          >
            {s.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1 text-muted-foreground">
          <input type="checkbox" checked={showUnused} onChange={(e) => setShowUnused(e.target.checked)} />
          使わない食材も表示
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">このプランにはまだレシピがありません。</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-xs tabular-nums">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="sticky left-0 bg-muted px-2 py-2 text-left font-semibold">食材</th>
                <th scope="col" className="px-2 py-2 text-right font-semibold">必要</th>
                {ANALYSIS_CATEGORIES.map((c) => (
                  <th key={c} scope="col" className={cn("px-2 py-2 text-right font-semibold", CATEGORY_STYLE[c].soft)}>
                    <span aria-hidden>{CATEGORY_STYLE[c].icon}</span>
                    <span className="sr-only">{CATEGORY_STYLE[c].label}</span>
                  </th>
                ))}
                <th scope="col" className="px-2 py-2 text-right font-semibold text-emerald-600">節約</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={cn("border-t", row.categorySum === 0 && "text-muted-foreground/60")}>
                  <th scope="row" className="sticky left-0 whitespace-nowrap bg-background px-2 py-1.5 text-left font-medium">
                    <span className="mr-1">{row.emoji}</span>
                    {row.name}
                  </th>
                  <td className="px-2 py-1.5 text-right text-sm font-bold">{row.required}</td>
                  {ANALYSIS_CATEGORIES.map((c) => {
                    const amount = row.byCategory[c];
                    const isDominant = analysis.mode === "max" && amount > 0 && amount === row.required;
                    return (
                      <td
                        key={c}
                        className={cn(
                          "px-2 py-1.5 text-right",
                          isDominant ? cn("font-bold", CATEGORY_STYLE[c].soft) : "text-muted-foreground"
                        )}
                      >
                        {amount > 0 ? amount : ""}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-right font-semibold text-emerald-600">{row.shared > 0 ? row.shared : ""}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/30 font-semibold">
                <th scope="row" className="sticky left-0 bg-muted px-2 py-2 text-left">合計</th>
                <td className="px-2 py-2 text-right text-sm font-bold">{analysis.totalRequired}</td>
                {analysis.categories.map((c) => (
                  <td key={c.category} className="px-2 py-2 text-right">{c.total}</td>
                ))}
                <td className="px-2 py-2 text-right text-emerald-600">{analysis.totalShared}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        色付きのセルは、その食材の必要数を決めているカテゴリです。色のない数字は、ほかのカテゴリ用に持っている食材で賄えます。
        「節約」は、カテゴリごとに足した数と必要数の差（重複で持たずに済む数）です。
      </p>
    </>
  );
}
