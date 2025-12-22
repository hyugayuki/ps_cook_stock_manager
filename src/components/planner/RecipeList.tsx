import { usePlannerStore } from "@/store/usePlannerStore";
import { recipes } from "@/data/recipes";
import { RecipeCard } from "./RecipeCard";

export function RecipeList() {
  const { plans, currentPlanId } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);

  if (!currentPlan) return <div>プランが見つかりません。新規作成してください。</div>;

  const filteredRecipes = recipes
    .filter((recipe) => recipe.category === currentPlan.category)
    .sort((a, b) => b.energy - a.energy);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filteredRecipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
      {filteredRecipes.length === 0 && (
          <div className="col-span-full py-8 text-center text-muted-foreground">
              このカテゴリのレシピはまだ登録されていません。
          </div>
      )}
    </div>
  );
}
