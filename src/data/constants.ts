export const GAME_CONSTANTS = {
  // Current max bag limit (as of latest update)
  DEFAULT_BAG_LIMIT: 800,
};

export const COOKING_CATEGORIES = [
  { value: "curry", label: "カレー", icon: "🍛" },
  { value: "salad", label: "サラダ", icon: "🥗" },
  { value: "dessert", label: "デザート", icon: "🥤" },
] as const;
