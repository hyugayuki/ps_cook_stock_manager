import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Backpack, Zap } from "lucide-react";
import Link from "next/link";

const EXAMPLE_INGREDIENTS = [
  { emoji: "🫚", name: "あったかジンジャー", count: 39, delta: 0 },
  { emoji: "🍄", name: "あじわいキノコ", count: 31, delta: 18 },
  { emoji: "🌿", name: "げきからハーブ", count: 22, delta: 0 },
  { emoji: "🍖", name: "マメミート", count: 20, delta: 0 },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            ホームに戻る
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">使い方</h1>
          <p className="text-muted-foreground">
            レシピの選択から必要食材の確認までの流れを説明します。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本の流れ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <ol className="list-decimal space-y-2 pl-5">
              <li>カテゴリタブ（カレー・シチュー / サラダ / デザート）を選び、作りたいレシピを探します。</li>
              <li>レシピの「＋」「－」ボタンで、そのレシピを何回作るか（目標回数）を設定します。</li>
              <li>画面下部（モバイル）またはサイドバー（デスクトップ）の「必要食材リスト」で、目標達成に必要な食材の合計数を確認します。</li>
              <li>合計食材数がバッグ容量を超えていないか確認しながら、レシピの回数を調整します。</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Backpack className="h-4 w-4" />
              🎒バッジ（+1したときの食材の増加分）について
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              各レシピには、そのレシピを<strong className="text-foreground">あと1回作る場合に、必要食材リストの合計数が実際に何個増えるか</strong>を示す
              🎒バッジが表示されます。
            </p>
            <p>
              合計食材数は、カレー・サラダ・デザートの各カテゴリごとに必要数を計算したあと、
              <strong className="text-foreground">食材ごとにカテゴリ間で最も多い数だけを採用</strong>する仕組みになっています
              （同時に持ち歩くバッグは1つで、カテゴリごとに食材を積み増すわけではないためです）。
            </p>
            <p>
              そのため、あるレシピの食材がすでに<strong className="text-foreground">別カテゴリでもっと多く必要とされている</strong>場合、
              そのレシピを+1しても合計食材数は増えません。この場合、🎒バッジは緑色の
              <span className="font-semibold text-emerald-600">+0</span>
              と表示されます。逆に、他カテゴリより多く必要になる（または新たに必要になる）食材がある場合は、その増加分がグレーの
              <span className="font-semibold">+数値</span>
              で表示されます。
            </p>

            {/* レシピ一覧での表示例 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">例：レシピ一覧での表示</p>
              <div className="rounded-xl border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold leading-tight text-foreground">とびはねるカレーうどん</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Zap className="mr-0.5 h-3 w-3 fill-muted-foreground" />
                      25,539
                    </span>
                    <Badge
                      variant="outline"
                      className="h-5 gap-0.5 border-muted-foreground/30 px-1.5 py-0 text-[10px] font-semibold text-muted-foreground"
                    >
                      <Backpack className="h-3 w-3" />
                      +18
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <p>
              レシピを開く（展開する）と、必要食材ひとつひとつについても同様に🎒バッジで内訳が確認できます。
              上の例では、ジンジャー・ハーブ・マメミートはすでに別カテゴリでより多く必要とされているため+0、
              キノコだけがこのレシピ分として新たに18個必要になる、という内訳になっています。
            </p>

            {/* レシピ詳細での表示例 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">例：レシピ詳細（展開時）での表示</p>
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="mb-1 text-xs font-semibold text-muted-foreground">必要食材 (112)</div>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_INGREDIENTS.map((ing) => (
                    <div
                      key={ing.name}
                      className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs"
                    >
                      <span className="text-base leading-none">{ing.emoji}</span>
                      <span className="font-medium text-muted-foreground">{ing.name}</span>
                      <span className="font-bold text-foreground">x{ing.count}</span>
                      <span
                        className={
                          "flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-semibold " +
                          (ing.delta === 0
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        <Backpack className="h-2.5 w-2.5" />
                        +{ing.delta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
