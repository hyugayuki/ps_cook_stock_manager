import { Button } from "@/components/ui/button";
import { usePlannerStore } from "@/store/usePlannerStore";
import { CookingCategory } from "@/types";

import { COOKING_CATEGORIES } from "@/data/constants";

const categories = COOKING_CATEGORIES;

export function CategoryTabs() {
  const { plans, currentPlanId, setCategory } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);

  if (!currentPlan) return null;

  return (
    <div className="flex justify-center">
      <div className="flex w-full max-w-[500px] items-center justify-center gap-2 sm:gap-4">
        {categories.map((cat) => {
          const isActive = currentPlan.category === cat.value;
          return (
            <Button
              key={cat.value}
              variant={isActive ? "secondary" : "outline"}
              className={`h-10 flex-1 rounded-full border px-2 sm:px-4 transition-all duration-200 ${
                  isActive 
                  ? "border-secondary-foreground/10 bg-secondary font-bold text-secondary-foreground shadow-sm" 
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-background hover:text-foreground"
              }`}
              onClick={() => setCategory(cat.value)}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.label}
            </Button>
          )
        })}
      </div>
    </div>
  );
}
