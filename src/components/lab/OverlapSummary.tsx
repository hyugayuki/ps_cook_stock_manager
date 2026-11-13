import { Badge } from "@/components/ui/badge";
import { PlanOverlapAnalysis } from "@/lib/overlapAnalysis";
import { CATEGORY_STYLE } from "./useOverlapAnalysis";

// プラン全体の重複度のサマリー(各案で共通)
export function OverlapSummary({ analysis }: { analysis: PlanOverlapAnalysis }) {
  const isSum = analysis.mode === "sum";

  return (
    <div className="space-y-3 rounded-xl border bg-card p-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[11px] text-muted-foreground">合計食材数</div>
          <div className="text-xl font-bold tabular-nums">{analysis.totalRequired}</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">カテゴリ別の単純合計</div>
          <div className="text-xl font-bold tabular-nums text-muted-foreground">{analysis.totalCategorySum}</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">重複で節約</div>
          <div className="text-xl font-bold tabular-nums text-emerald-600">
            {analysis.totalShared}
            <span className="ml-0.5 text-xs font-semibold">({Math.round(analysis.sharedRate * 100)}%)</span>
          </div>
        </div>
      </div>

      {/* カテゴリごとの食材数とエナジー */}
      <div className="grid grid-cols-3 gap-2 border-t pt-2 text-center text-xs">
        {analysis.categories.map((c) => (
          <div key={c.category}>
            <div className="font-semibold">
              {CATEGORY_STYLE[c.category].icon} {CATEGORY_STYLE[c.category].label}
              <span className="ml-0.5 font-normal text-muted-foreground">({c.recipeCount})</span>
            </div>
            <div className="tabular-nums">{c.total}個</div>
            <div className="tabular-nums text-muted-foreground">⚡{c.energy.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {isSum && (
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="h-5 shrink-0 px-1.5 py-0 text-[10px]">
            全カテゴリ合算
          </Badge>
          <span>このプランはカテゴリをまたいで足し算するため、重複による節約はありません。</span>
        </div>
      )}
    </div>
  );
}
