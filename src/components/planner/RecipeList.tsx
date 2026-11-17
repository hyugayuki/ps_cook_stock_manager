import { useCurrentPlan, usePlannerStore } from "@/store/usePlannerStore";
import { recipes } from "@/data/recipes";
import { RecipeCard } from "./RecipeCard";
import { usePlanTotals } from "@/hooks/usePlanTotals";

export function RecipeList() {
  const currentPlan = useCurrentPlan();
  const selectedIngredientId = usePlannerStore((s) => s.selectedIngredientId);
  const { categoryTotals, totalIngredients } = usePlanTotals(currentPlan);

  if (!currentPlan) return <div>プランが見つかりません。新規作成してください。</div>;

  const filteredRecipes = recipes
    .filter((recipe) => {
        const matchesCategory = recipe.category === currentPlan.category;
        const matchesIngredient = selectedIngredientId 
            ? recipe.ingredients.some(ing => ing.id === selectedIngredientId)
            : true;
        return matchesCategory && matchesIngredient;
    })
    .sort((a, b) => (b.energy ?? -1) - (a.energy ?? -1)); // エナジー未判明は末尾

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 p-2 sm:p-4">
      {filteredRecipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          count={currentPlan.targets[recipe.id] ?? 0}
          totalMode={currentPlan.totalMode}
          categoryTotals={categoryTotals}
          totalIngredients={totalIngredients}
        />
      ))}
      {filteredRecipes.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
              {selectedIngredientId 
                ? "この食材を使用するレシピは、現在のカテゴリにはありません。" 
                : "このカテゴリのレシピはまだ登録されていません。"}
          </div>
      )}
    </div>
  );
}
