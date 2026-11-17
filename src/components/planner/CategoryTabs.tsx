import { Button } from "@/components/ui/button";
import { useCurrentPlan, usePlannerStore } from "@/store/usePlannerStore";
import { COOKING_CATEGORIES } from "@/data/constants";

export function CategoryTabs() {
  const currentPlan = useCurrentPlan();
  const setCategory = usePlannerStore((s) => s.setCategory);

  if (!currentPlan) return null;

  return (
    <div className="flex justify-center">
      <div className="flex w-full max-w-[500px] items-center justify-center gap-2 sm:gap-4">
        {COOKING_CATEGORIES.map((cat) => {
          const isActive = currentPlan.category === cat.value;
          return (
            <Button
              key={cat.value}
              variant={isActive ? "secondary" : "outline"}
              aria-pressed={isActive}
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
