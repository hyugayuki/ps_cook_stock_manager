import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Check, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

// プランの切り替え・作成・編集・削除と、選択中プランの計算方法の設定をまとめたセレクター
export function PlanManager() {
  const { plans, createPlan, deletePlan, renamePlan, setPlanTotalMode, currentPlanId, switchPlan } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const resetForms = () => {
    setIsAdding(false);
    setNewPlanName("");
    setEditingId(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForms();
  };

  const handleSwitch = (id: string) => {
    switchPlan(id);
    handleOpenChange(false);
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    createPlan(newPlanName.trim());
    resetForms();
  };

  const startEdit = (id: string, currentName: string) => {
    setIsAdding(false);
    setEditingId(id);
    setEditName(currentName);
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (editingId && editName.trim()) {
      renamePlan(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("本当にこのプランを削除しますか？")) {
      deletePlan(id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[160px] justify-between gap-2 font-normal md:w-[200px]"
          aria-label={`プラン: ${currentPlan?.name ?? "未選択"}`}
        >
          <span className="min-w-0 truncate">{currentPlan?.name ?? "プラン選択"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={16}
        className="w-[min(22rem,calc(100vw-2rem))] p-2"
        onEscapeKeyDown={(e) => {
          // 入力中のEscは入力の取り消しだけにして、パネルは閉じない
          if (isAdding || editingId) {
            e.preventDefault();
            resetForms();
          }
        }}
      >
        <ul className="max-h-[40vh] space-y-1 overflow-y-auto">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <li key={plan.id} className={cn("flex items-center gap-1 rounded-md", isCurrent && "bg-secondary/50")}>
                {editingId === plan.id ? (
                  <form onSubmit={handleUpdate} className="flex flex-1 items-center gap-2 p-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      aria-label="プラン名"
                      className="h-8"
                      autoComplete="off"
                      data-1p-ignore
                      autoFocus
                    />
                    <Button type="submit" size="sm">保存</Button>
                  </form>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="h-9 min-w-0 flex-1 justify-start gap-2 px-2 font-normal"
                      aria-current={isCurrent ? "true" : undefined}
                      onClick={() => handleSwitch(plan.id)}
                    >
                      <Check className={cn("h-4 w-4 shrink-0", !isCurrent && "invisible")} />
                      <span className={cn("min-w-0 truncate", isCurrent && "font-semibold")}>{plan.name}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label={`${plan.name}の名前を編集`}
                      onClick={() => startEdit(plan.id, plan.name)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {plans.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        aria-label={`${plan.name}を削除`}
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {isAdding ? (
          <form onSubmit={handleCreate} className="mt-1 flex items-center gap-2 p-1">
            <Input
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              aria-label="新しいプランの名前"
              placeholder="例: 来週のカレーウィーク"
              className="h-8"
              autoComplete="off"
              data-1p-ignore
              autoFocus
            />
            <Button type="submit" size="sm">作成</Button>
          </form>
        ) : (
          <Button
            variant="ghost"
            className="mt-1 h-9 w-full justify-start gap-2 px-2 font-normal"
            onClick={() => {
              setEditingId(null);
              setIsAdding(true);
            }}
          >
            <Plus className="h-4 w-4" />
            新しいプラン
          </Button>
        )}

        {currentPlan && (
          <div className="mt-2 border-t px-2 pb-1 pt-2">
            <p className="truncate text-xs font-semibold text-muted-foreground">「{currentPlan.name}」の計算方法</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <Label htmlFor="plan-total-mode" className="cursor-pointer text-sm">
                全カテゴリを合算（イベント用）
              </Label>
              <Switch
                id="plan-total-mode"
                checked={currentPlan.totalMode === "sum"}
                onCheckedChange={(checked) => setPlanTotalMode(currentPlan.id, checked ? "sum" : "max")}
              />
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              カテゴリをまたいで必要数を足し算します。「なんでも！」週向けです。
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
