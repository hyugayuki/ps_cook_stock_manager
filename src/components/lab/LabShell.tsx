"use client";

import { PlanManager } from "@/components/planner/PlanManager";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/usePlannerStore";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

const PATTERNS = [
  { href: "/lab/table", label: "A 表" },
  { href: "/lab/bars", label: "B バー" },
  { href: "/lab/recipes", label: "C レシピ効率" },
];

// 試作画面の共通枠。本体と同じく、マウント後にだけ描画して localStorage の内容と揃える
export function LabShell({ children }: { children: ReactNode }) {
  // サーバーでは false、クライアントでは true になる
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const pathname = usePathname();

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ps-cook-planner-storage") usePlannerStore.persist.rehydrate();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            ホーム
          </Link>
          <PlanManager />
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-4 pb-2">
          {PATTERNS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                pathname === p.href ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-4">{children}</main>
    </div>
  );
}
