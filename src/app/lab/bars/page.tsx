"use client";

import { CATEGORY_STYLE, useOverlapAnalysis } from "@/components/lab/useOverlapAnalysis";
import { OverlapSummary } from "@/components/lab/OverlapSummary";
import { ANALYSIS_CATEGORIES } from "@/lib/overlapAnalysis";
import { cn } from "@/lib/utils";

const pct = (value: number, max: number) => `${max > 0 ? (value / max) * 100 : 0}%`;

// 案B: 食材ごとにカテゴリ別の必要数をバーで並べる。バーの長さがそろっているほど重複が効いている
export default function LabBarsPage() {
  const result = useOverlapAnalysis();
  if (!result) return <p className="text-sm text-muted-foreground">プランが見つかりません。</p>;

  const { analysis } = result;
  const isSum = analysis.mode === "sum";
  const rows = analysis.rows
    .filter((r) => r.categorySum > 0)
    .sort((a, b) => b.required - a.required);
  const scale = Math.max(1, ...rows.map((r) => (isSum ? r.categorySum : r.required)));

  return (
    <>
      <OverlapSummary analysis={analysis} />

      {/* カテゴリごとに、他カテゴリと共有できている割合 */}
      {!isSum && (
        <section className="space-y-2 rounded-xl border bg-card p-3">
          <h2 className="text-sm font-semibold">カテゴリごとの共有率</h2>
          <p className="text-xs text-muted-foreground">
            そのカテゴリの食材のうち、ほかのカテゴリ用にも持っている分（濃い色）の割合です。高いほど追加の持ち物が少なく済みます。
          </p>
          {analysis.categories.map((c) => {
            const style = CATEGORY_STYLE[c.category];
            const rate = c.total > 0 ? c.sharedWithOthers / c.total : 0;
            return (
              <div key={c.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{style.icon} {style.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {c.sharedWithOthers} / {c.total}個（{Math.round(rate * 100)}%）
                  </span>
                </div>
                <div className={cn("h-3 overflow-hidden rounded-full", style.soft)}>
                  <div className={cn("h-full rounded-full", style.bar)} style={{ width: pct(c.sharedWithOthers, c.total) }} />
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section className="space-y-3 rounded-xl border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">食材ごとの内訳</h2>
          <div className="flex gap-2 text-[11px] text-muted-foreground">
            {ANALYSIS_CATEGORIES.map((c) => (
              <span key={c} className="flex items-center gap-1">
                <span className={cn("inline-block h-2 w-2 rounded-full", CATEGORY_STYLE[c].bar)} />
                {CATEGORY_STYLE[c].label}
              </span>
            ))}
          </div>
        </div>

        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">このプランにはまだレシピがありません。</p>
        )}

        {rows.map((row) => (
          <div key={row.id} className="space-y-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium">
                {row.emoji} {row.name}
              </span>
              <span className="tabular-nums">
                <span className="text-sm font-bold">{row.required}</span>
                {row.shared > 0 && <span className="ml-1.5 text-emerald-600">節約 {row.shared}</span>}
              </span>
            </div>

            {isSum ? (
              // 合算: カテゴリを積み上げた1本のバー
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted" style={{ width: pct(row.categorySum, scale) }}>
                {ANALYSIS_CATEGORIES.map((c) =>
                  row.byCategory[c] > 0 ? (
                    <div key={c} className={CATEGORY_STYLE[c].bar} style={{ width: pct(row.byCategory[c], row.categorySum) }} />
                  ) : null
                )}
              </div>
            ) : (
              // 通常: カテゴリごとに1本ずつ。最も長いバーが必要数になる
              <div className="space-y-0.5">
                {ANALYSIS_CATEGORIES.map((c) => {
                  const amount = row.byCategory[c];
                  if (amount <= 0) return null;
                  return (
                    <div key={c} className="flex items-center gap-2">
                      <div className="h-2 flex-1">
                        <div className={cn("h-full rounded-full", CATEGORY_STYLE[c].bar)} style={{ width: pct(amount, scale) }} />
                      </div>
                      <span className="w-7 text-right text-[10px] tabular-nums text-muted-foreground">{amount}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
