import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Recipe } from "@/types";
import { Minus, Plus, Zap } from "lucide-react";
import { ingredients } from "@/data/ingredients";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { plans, currentPlanId, updateTarget } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const count = currentPlan?.targets[recipe.id] || 0;

  const handleIncrement = () => updateTarget(recipe.id, count + 1);
  const handleDecrement = () => updateTarget(recipe.id, count - 1);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      updateTarget(recipe.id, val);
    } else if (e.target.value === "") {
        updateTarget(recipe.id, 0); // Handle empty input as 0 or keep previous? Usually 0 is safer for UX.
    }
  };

  return (
    <Card className={`flex h-full flex-col transition-all duration-200 ${count > 0 ? "border-orange-500 bg-orange-50 shadow-md dark:border-orange-400 dark:bg-orange-950/20" : ""}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex min-h-[3rem] items-center">
             <CardTitle className="line-clamp-2 text-base font-bold leading-tight">{recipe.name}</CardTitle>
        </div>
        <div className="mt-1 flex items-center text-xs text-muted-foreground">
             <Zap className={`mr-1 h-3 w-3 ${count > 0 ? "fill-orange-400 text-orange-500" : "fill-yellow-400 text-yellow-500"}`} />
             {recipe.energy.toLocaleString()} ({recipe.totalIngredients})
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4 pt-0">
        <div className="mb-2 flex-1 space-y-1 text-xs text-muted-foreground">
            {recipe.ingredients.map(ing => {
                const ingredient = ingredients.find(i => i.id === ing.id);
                return (
                    <div key={ing.id} className="flex justify-between">
                        <span className="truncate">
                            <span className="mr-1">{ingredient?.emoji}</span>
                            {ingredient?.name || ing.id}
                        </span>
                        <span className="ml-2 shrink-0 font-medium">x{ing.count}</span>
                    </div>
                )
            })}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDecrement}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="0"
            value={count === 0 ? "" : count}
            placeholder="0"
            onChange={handleChange}
            className={`h-8 w-16 text-center font-bold ${count > 0 ? "border-orange-500 bg-white text-orange-600 dark:bg-black" : ""}`}
          />
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleIncrement}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
