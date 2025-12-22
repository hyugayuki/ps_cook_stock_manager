import { usePlannerStore } from "@/store/usePlannerStore";
import { recipes } from "@/data/recipes";
import { RecipeCard } from "./RecipeCard";

export function RecipeList() {
  const { plans, currentPlanId, selectedIngredientId } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);

  if (!currentPlan) return <div>プランが見つかりません。新規作成してください。</div>;

  const filteredRecipes = recipes
    .filter((recipe) => {
        const matchesCategory = recipe.category === currentPlan.category;
        const matchesIngredient = selectedIngredientId 
            ? recipe.ingredients.some(ing => ing.id === selectedIngredientId)
            : true;
        return matchesCategory && matchesIngredient;
    })
    .sort((a, b) => b.energy - a.energy);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 p-2 sm:p-4">
      {filteredRecipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
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
