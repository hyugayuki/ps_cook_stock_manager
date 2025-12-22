import { Button } from "@/components/ui/button";
import { usePlannerStore } from "@/store/usePlannerStore";
import { CookingCategory } from "@/types";

const categories: { value: CookingCategory; label: string }[] = [
  { value: "curry", label: "カレー" },
  { value: "salad", label: "サラダ" },
  { value: "dessert", label: "デザート" },
];

export function CategoryTabs() {
  const { plans, currentPlanId, setCategory } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);

  if (!currentPlan) return null;

  return (
    <div className="flex justify-center p-4">
      <div className="flex w-full max-w-[400px] rounded-md border bg-muted p-1">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={currentPlan.category === cat.value ? "secondary" : "ghost"}
            className={`flex-1 ${currentPlan.category === cat.value ? 'bg-background shadow-sm' : ''}`}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
