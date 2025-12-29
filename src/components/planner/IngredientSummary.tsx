import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ingredients } from "@/data/ingredients";
import { recipes } from "@/data/recipes";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useMemo, useState } from "react";
import { AlertCircle, ChevronUp } from "lucide-react";
import { COOKING_CATEGORIES } from "@/data/constants";

export function IngredientSummary() {
  const { plans, currentPlanId, settings, selectedIngredientId, setSelectedIngredient } = usePlannerStore();
  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const [open, setOpen] = useState(false);
  const [filterWeeklyCategory, setFilterWeeklyCategory] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedIngredient(selectedIngredientId === id ? null : id);
    setOpen(false); // Close drawer on mobile selection
  };

  const summary = useMemo(() => {
    if (!currentPlan) return [];

    const totalIngredients: Record<string, number> = {};

    // Calculate totals based on recipes
    // Calculate totals per category
    const categoryTotals: Record<string, Record<string, number>> = {};

    Object.entries(currentPlan.targets).forEach(([recipeId, count]) => {
      if (count <= 0) return;
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) return;

      const cat = recipe.category;
      if (!categoryTotals[cat]) categoryTotals[cat] = {};

      recipe.ingredients.forEach((ing) => {
        categoryTotals[cat][ing.id] = (categoryTotals[cat][ing.id] || 0) + ing.count * count;
      });
    });

    // Take the maximum across categories for each ingredient
    Object.values(categoryTotals).forEach((catTotal) => {
        Object.entries(catTotal).forEach(([ingId, amount]) => {
            totalIngredients[ingId] = Math.max(totalIngredients[ingId] || 0, amount);
        });
    });

    // Map all ingredients, not just used ones
    return ingredients
      .map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        emoji: ingredient.emoji,
        count: totalIngredients[ingredient.id] || 0,
      }));
  }, [currentPlan, plans]);

  const totalCount = summary.reduce((sum, item) => sum + item.count, 0);
  const isOverLimit = totalCount > settings.bagLimit;

  // Always show the component even if count is 0


  if (summary.length === 0) {
      return null;
  }

  // Calculate ingredients used in the weekly category (Limited to active plan)
  const weeklyCategoryIngredients = useMemo(() => {
    if (!settings.weeklyCategory || !currentPlan) return new Set<string>();
    
    const usedIds = new Set<string>();
    Object.entries(currentPlan.targets).forEach(([recipeId, count]) => {
        if (count <= 0) return;
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe && recipe.category === settings.weeklyCategory) {
            recipe.ingredients.forEach(i => usedIds.add(i.id));
        }
    });

    return usedIds;
  }, [settings.weeklyCategory, currentPlan]);

  const listItems = (
    <div className="space-y-1">
      {summary.map((item) => {
        const isSelected = selectedIngredientId === item.id;
        // Identify if this item is NOT used in the weekly category (surplus)
        const isSurplus = filterWeeklyCategory && settings.weeklyCategory && !weeklyCategoryIngredients.has(item.id);

        return (
            <div 
                key={item.id} 
                className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-2 transition-colors border ${
                    isSelected 
                    ? "bg-primary/20 hover:bg-primary/30 border-primary/50 ring-1 ring-primary/50" 
                    : isSurplus
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/50"
                        : "hover:bg-muted/50 border-transparent"
                }`}
                onClick={() => handleSelect(item.id)}
            >
            <span className="text-sm font-medium flex items-center">
                <span className="mr-3 text-lg">{item.emoji}</span>
                {item.name}
                {isSurplus && (
                    <Badge variant="outline" className="ml-2 h-5 border-emerald-500 text-emerald-600 text-[10px] px-1 py-0">
                        レシピ外
                    </Badge>
                )}
            </span>
            <span className={`text-sm font-bold ${item.count === 0 ? 'text-muted-foreground' : 'text-primary'}`}>{item.count}</span>
            </div>
        )
      })}
    </div>
  );

  const headerBadge = (
    <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
           <span className="text-sm text-muted-foreground">合計食材数</span>
           <Badge variant={isOverLimit ? "destructive" : "secondary"} className="text-base">
               {isOverLimit && <AlertCircle className="mr-1 h-4 w-4" />}
               {totalCount} / {settings.bagLimit}
           </Badge>
        </div>
        
        <div className={`flex items-center space-x-2 ${!settings.weeklyCategory ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Switch 
                id="weekly-filter" 
                checked={filterWeeklyCategory} 
                onCheckedChange={(checked) => {
                   if (!settings.weeklyCategory) {
                       toast.error("今週の調理カテゴリを設定してください");
                       return;
                   }
                   setFilterWeeklyCategory(checked);
                }}
                disabled={!settings.weeklyCategory}
            />
            <Label 
                htmlFor="weekly-filter" 
                className={`text-sm ${!settings.weeklyCategory ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={(e) => {
                    e.preventDefault();
                    if (!settings.weeklyCategory) {
                        toast.error("今週の調理カテゴリを設定してください");
                        return;
                    }
                    setFilterWeeklyCategory(!filterWeeklyCategory);
                }}
            >
                今週のレシピ外の食材を強調
            </Label>
            <span className="text-xs text-muted-foreground">
                ({settings.weeklyCategory 
                    ? COOKING_CATEGORIES.find(c => c.value === settings.weeklyCategory)?.label 
                    : "未設定"})
            </span>
        </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Bottom Floating Bar & Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <span className="font-bold">合計: {totalCount}</span>
                 {isOverLimit && <span className="text-xs text-destructive">容量オーバー!</span>}
            </div>
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <Button>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    詳細を見る
                </Button>
              </DrawerTrigger>
              <DrawerContent className="flex h-[90vh] flex-col">
                <DrawerHeader>
                  <DrawerTitle>必要食材リスト</DrawerTitle>
                  <DrawerDescription>
                    目標達成に必要な食材の合計です。
                  </DrawerDescription>
                </DrawerHeader>
                
                <div className="flex flex-1 flex-col overflow-hidden p-4 pt-0">
                    {headerBadge}
                    <div className="flex-1 overflow-y-auto pr-4">
                        {listItems}
                    </div>
                </div>

                <DrawerFooter className="pt-2">
                  <DrawerClose asChild>
                    <Button variant="outline">閉じる</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
         </div>
      </div>

      {/* Desktop: Sidebar Card */}
      <div className="hidden md:block">
          <Card className="h-full border shadow-sm">
            <CardHeader>
              <CardTitle>必要食材リスト</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {headerBadge}
                <ScrollArea className="h-[calc(100vh-250px)] w-full pr-4">
                    {listItems}
                </ScrollArea>
            </CardContent>
          </Card>
      </div>
    </>
  );
}
