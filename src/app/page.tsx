"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { CategoryTabs } from "@/components/planner/CategoryTabs";
import { RecipeList } from "@/components/planner/RecipeList";
import { IngredientSummary } from "@/components/planner/IngredientSummary";
import { usePlannerStore } from "@/store/usePlannerStore";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { switchPlan, currentPlanId, plans } = usePlannerStore();

  // Hydration fix for Persist middleware & Cross-tab synchronization
  useEffect(() => {
    setMounted(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ps-cook-planner-storage') {
        usePlannerStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col pb-[250px] md:pb-0"> 
      {/* pb-[250px] accounts for fixed IngredientSummary on mobile */}
      
      <Header />
      
      <main className="container mx-auto flex-1 p-2 sm:p-4">
        <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_350px]">
          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            <p className="text-center text-xs text-muted-foreground">
              指定した回数分のレシピに必要な食材数を合計・管理できます
            </p>
            <CategoryTabs />
            <RecipeList />
          </div>
          
          {/* Sidebar Area - Sticky */}
          <div className="hidden md:block">
            <div className="sticky top-[70px]">
             <IngredientSummary />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Summary (Fixed Bottom) */}
      <div className="md:hidden">
          <IngredientSummary />
      </div>
    </div>
  );
}
