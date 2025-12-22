import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plan, Settings, CookingCategory } from '@/types';
import { GAME_CONSTANTS } from '@/data/constants';

interface PlannerState {
  plans: Plan[];
  currentPlanId: string;
  settings: Settings;

  // Actions
  createPlan: (name: string) => void;
  deletePlan: (id: string) => void;
  switchPlan: (id: string) => void;
  renamePlan: (id: string, name: string) => void;
  setCategory: (category: CookingCategory) => void;
  updateTarget: (recipeId: string, count: number) => void;
  setBagLimit: (limit: number) => void;
}

const DEFAULT_PLAN_ID = 'default-plan';

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      plans: [
        {
          id: DEFAULT_PLAN_ID,
          name: '通常週',
          category: 'curry',
          targets: {},
        },
      ],
      currentPlanId: DEFAULT_PLAN_ID,
      settings: {
        bagLimit: GAME_CONSTANTS.DEFAULT_BAG_LIMIT,
      },

      createPlan: (name) =>
        set((state) => {
          const newId = crypto.randomUUID();
          return {
            plans: [
              ...state.plans,
              {
                id: newId,
                name,
                category: 'curry',
                targets: {},
              },
            ],
            currentPlanId: newId,
          };
        }),

      deletePlan: (id) =>
        set((state) => {
          if (state.plans.length <= 1) return state;
          
          const newPlans = state.plans.filter((p) => p.id !== id);
          let newCurrentId = state.currentPlanId;
          if (id === state.currentPlanId) {
            newCurrentId = newPlans[0].id;
          }

          return {
            plans: newPlans,
            currentPlanId: newCurrentId,
          };
        }),

      switchPlan: (id) =>
        set(() => ({
          currentPlanId: id,
        })),

      renamePlan: (id, name) =>
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),

      setCategory: (category) =>
        set((state) => {
          return {
            plans: state.plans.map((p) =>
              p.id === state.currentPlanId ? { ...p, category } : p
            ),
          };
        }),

      updateTarget: (recipeId, count) =>
        set((state) => {
           const safeCount = Math.max(0, count);
           return {
            plans: state.plans.map((p) => {
              if (p.id === state.currentPlanId) {
                const newTargets = { ...p.targets };
                if (safeCount === 0) {
                    delete newTargets[recipeId];
                } else {
                    newTargets[recipeId] = safeCount;
                }
                return { ...p, targets: newTargets };
              }
              return p;
            }),
           };
        }),

      setBagLimit: (limit) =>
        set((state) => ({
          settings: { ...state.settings, bagLimit: limit },
        })),
    }),
    {
      name: 'ps-cook-planner-storage',
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version === 1) {
            // Rename '基本プラン' to '通常週'
             if (persistedState && persistedState.plans) {
                persistedState.plans = persistedState.plans.map((p: any) => 
                    p.name === '基本プラン' ? { ...p, name: '通常週' } : p
                );
            }
        }
        return persistedState;
      },
    }
  )
);
