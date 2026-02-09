"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePlannerStore } from "@/store/usePlannerStore";
import { LATEST_UPDATE_DATE } from "@/data/constants";

export default function UpdatesPage() {
  const { setLastViewedUpdateDate } = usePlannerStore();
  
  useEffect(() => {
    setLastViewedUpdateDate(LATEST_UPDATE_DATE);
  }, [setLastViewedUpdateDate]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="h-4 w-4" />
            アプリに戻る
          </Button>
        </Link>
      </div>

      <h1 className="mb-8 text-2xl font-bold">アップデート情報</h1>

      <div className="space-y-6">
        {/* 2026-02-09 Update */}
        <section className="relative border-l-2 border-primary/20 pl-6 pb-8 last:pb-0">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
            <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-muted-foreground">2026.02.09</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">New</span>
            </div>
            <h2 className="mb-3 text-lg font-semibold">レシピデータの追加</h2>
            <div className="prose prose-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1">
                    <li>
                        <strong>新レシピ「みつあつめチョコワッフル」を追加</strong>
                        <br />
                        デザートカテゴリに新レシピ「みつあつめチョコワッフル」を追加しました。
                    </li>
                </ul>
            </div>
        </section>

        {/* 2025-12-29 Update */}
        <section className="relative border-l-2 border-primary/20 pl-6 pb-8 last:pb-0">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
            <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-muted-foreground">2025.12.29</span>
            </div>
            <h2 className="mb-3 text-lg font-semibold">食材管理機能の改善</h2>
            <div className="prose prose-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1">
                    <li>
                        <strong>「今週の料理カテゴリ」設定の追加</strong>
                        <br />
                        設定画面から、今週のカビゴンが好む料理カテゴリ（カレー・シチューなど）を設定できるようになりました。
                    </li>
                    <li>
                        <strong>今週のレシピ外食材の可視化</strong>
                        <br />
                        食材リストに「レシピ外の食材を強調」スイッチを追加しました。ONにすると、現在のプランで選択しているレシピ（かつ今週のカテゴリに一致するもの）で使用しない食材が強調表示され、鍋の容量調整などに使いやすくなりました。
                    </li>
                    <li>
                        <strong>設定画面のUX改善</strong>
                        <br />
                        設定画面を画面中央に表示されるモーダル形式に変更し、誤操作を防ぎやすくしました。
                    </li>
                </ul>
            </div>
        </section>
      </div>
    </div>
  );
}
