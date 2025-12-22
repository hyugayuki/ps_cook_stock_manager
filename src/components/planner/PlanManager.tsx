import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useState } from "react";

export function PlanManager() {
  const { plans, createPlan, deletePlan, renamePlan, currentPlanId, switchPlan } = usePlannerStore();
  const [newPlanName, setNewPlanName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = () => {
    if (!newPlanName.trim()) return;
    createPlan(newPlanName);
    setNewPlanName("");
    setIsOpen(false);
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleUpdate = () => {
    if (editingId && editName.trim()) {
      renamePlan(editingId, editName);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("本当にこのプランを削除しますか？")) {
      deletePlan(id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>プラン管理</DialogTitle>
          <DialogDescription>
            新しい料理計画を作成、または既存の計画を編集します。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-plan-name" className="text-right">
              新規プラン
            </Label>
            <Input
              id="new-plan-name"
              name="new-plan-name"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="例: 来週のカレーウィーク"
              className="col-span-3"
              autoComplete="off"
              data-1p-ignore
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate}>作成</Button>
        </DialogFooter>

        <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">保存済みプラン一覧</h4>
            <div className="space-y-2">
                {plans.map(plan => (
                    <div key={plan.id} className="flex items-center justify-between rounded-md border p-2">
                         {editingId === plan.id ? (
                             <div className="flex flex-1 items-center gap-2">
                                 <Input 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-8"
                                    autoComplete="off"
                                    data-1p-ignore
                                 />
                                 <Button size="sm" onClick={handleUpdate}>保存</Button>
                             </div>
                         ) : (
                             <div className="flex flex-1 items-center gap-2">
                                 <span 
                                    className={`cursor-pointer text-sm ${plan.id === currentPlanId ? 'font-bold text-primary' : ''}`}
                                    onClick={() => {
                                        switchPlan(plan.id);
                                        setIsOpen(false);
                                    }}
                                 >
                                    {plan.name} {plan.id === currentPlanId && '(選択中)'}
                                 </span>
                             </div>
                         )}
                         
                         <div className="flex gap-1">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(plan.id, plan.name)}>
                                 <Pencil className="h-4 w-4" />
                             </Button>
                             {plans.length > 1 && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(plan.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             )}
                         </div>
                    </div>
                ))}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
