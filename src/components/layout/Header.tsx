import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Settings as SettingsIcon, Info } from "lucide-react";
import Link from "next/link";
import { PlanManager } from "../planner/PlanManager";
import { GAME_CONSTANTS, COOKING_CATEGORIES } from "@/data/constants";

export function Header() {
  const { plans, currentPlanId, switchPlan, settings, setBagLimit, setWeeklyCategory } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);

  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto relative flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="hidden text-lg font-bold md:block">PS Cooking Planner</h1>
          <h1 className="text-lg font-bold md:hidden">PSCP</h1>
        </div>

        {/* Plan Selection UI - Centered on mobile, Right-aligned on desktop */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:static md:flex-1 md:translate-x-0 md:translate-y-0 md:justify-end">
            <Select value={currentPlanId} onValueChange={switchPlan} disabled={plans.length <= 1}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="プラン選択" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PlanManager />
        </div>

        {/* Settings - Always Right */}
        <div className="flex items-center justify-end md:ml-2">
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <SettingsIcon className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">設定</h4>
                        <p className="text-xs text-muted-foreground">
                            アプリ全体の共通設定です。
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="bagLimit">食材バック容量</Label>
                            <Input
                                id="bagLimit"
                                type="number"
                                className="h-8"
                                value={settings.bagLimit}
                                max={GAME_CONSTANTS.DEFAULT_BAG_LIMIT}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val <= GAME_CONSTANTS.DEFAULT_BAG_LIMIT) {
                                        setBagLimit(val);
                                    }
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                             <Label htmlFor="weeklyCategory">今週の料理カテゴリ</Label>
                             <Select
                                value={settings.weeklyCategory || "none"}
                                onValueChange={(val) => {
                                    setWeeklyCategory(val === "none" ? null : (val as any));
                                }}
                             >
                                <SelectTrigger className="h-8 w-full">
                                    <SelectValue placeholder="未設定" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">未設定</SelectItem>
                                    {COOKING_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            <span className="mr-2">{cat.icon}</span>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                        </div>

                    </div>
                    <div className="border-t pt-4">
                        <Link href="/about" passHref>
                            <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
                                <span>
                                    <Info className="h-4 w-4" />
                                    このアプリについて
                                </span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
