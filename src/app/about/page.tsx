import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto min-h-screen px-4 py-8 max-w-2xl">
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
            <h1 className="text-3xl font-bold tracking-tight">このアプリについて</h1>
            <p className="text-muted-foreground">
                Pokemon Sleep Cooking Planner (PSCP)
            </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>概要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              ポケモンスリープ（Pokémon Sleep）での料理計画をサポートするための非公式ツールです。
              作りたい料理と回数を設定することで、必要な食材の合計数を自動計算し、バッグ容量との比較やおてつだいチームの編成に役立てることができます。
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>レシピごとの必要食材計算</li>
                <li>指定回数分の食材合計シミュレーション</li>
                <li>バッグ容量オーバーのアラート</li>
                <li>食材によるレシピの絞り込み機能</li>
            </ul>
             <p className="text-xs text-muted-foreground pt-2">
                ※当アプリはポケモンスリープおよび株式会社ポケモンとは一切関係ありません。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>製作者</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="space-y-1">
                    <p className="font-medium">gahyu_3</p>
                    <p className="text-xs text-muted-foreground">
                        機能の要望やバグ報告等はX（旧Twitter）までお寄せください。
                    </p>
                </div>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href="https://x.com/gahyu_3" target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                 X (@gahyu_3) をフォローする
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
