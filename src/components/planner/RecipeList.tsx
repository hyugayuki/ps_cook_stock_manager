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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 p-2 sm:p-4">
      {filteredRecipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
      {filteredRecipes.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
              このカテゴリのレシピはまだ登録されていません。
          </div>
      )}
    </div>
  );
}
