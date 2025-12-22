import { Button } from "@/components/ui/button";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Recipe } from "@/types";
import { ChevronDown, Minus, Plus, Zap } from "lucide-react";
import { ingredients } from "@/data/ingredients";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { plans, currentPlanId, updateTarget } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const count = currentPlan?.targets[recipe.id] || 0;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleIncrement = () => updateTarget(recipe.id, count + 1);
  const handleDecrement = () => updateTarget(recipe.id, count - 1);

  const isActive = count > 0;

  return (
    <div 
        className={cn(
            "group relative flex flex-col rounded-xl border transition-all duration-200",
            isActive 
                ? "border-primary bg-secondary/50 shadow-sm dark:bg-secondary/20" 
                : "bg-card hover:border-primary/50 hover:bg-muted/30"
        )}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3 p-3">
          {/* Info */}
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-bold leading-tight">{recipe.name}</h3>
            </div>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <Zap className={cn("mr-0.5 h-3 w-3", isActive ? "fill-primary text-primary" : "fill-muted-foreground")} />
                {recipe.energy.toLocaleString()} 
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full border-muted-foreground/30 hover:border-primary hover:bg-primary/10 hover:text-primary" onClick={handleDecrement}>
                <Minus className="h-3 w-3" />
              </Button>
              <div className={cn(
                  "flex w-8 justify-center text-lg font-bold tabular-nums",
                  isActive ? "text-primary" : "text-muted-foreground"
              )}>
                 {count}
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full border-muted-foreground/30 hover:border-primary hover:bg-primary/10 hover:text-primary" onClick={handleIncrement}>
                <Plus className="h-3 w-3" />
              </Button>
          </div>

          {/* Expand Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted"
            onClick={() => setIsExpanded(!isExpanded)}
          >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
          </Button>
      </div>

      {/* Expanded Content (Ingredients) */}
      {isExpanded && (
          <div className="border-t bg-muted/20 p-3 pt-2">
              <div className="text-xs font-semibold text-muted-foreground mb-1">必要食材 ({recipe.totalIngredients})</div>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.map(ing => {
                    const ingredient = ingredients.find(i => i.id === ing.id);
                    return (
                        <div key={ing.id} className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs">
                            <span className="text-base leading-none">{ingredient?.emoji}</span>
                            <span className="font-medium text-muted-foreground">{ingredient?.name || ing.id}</span>
                            <span className="font-bold text-foreground">x{ing.count}</span>
                        </div>
                    )
                })}
              </div>
          </div>
      )}
    </div>
  );
}
