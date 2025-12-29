export const GAME_CONSTANTS = {
  // Current max bag limit (as of latest update)
  DEFAULT_BAG_LIMIT: 800,
};

export const COOKING_CATEGORIES = [
  { value: "curry", label: "カレー", icon: "🍛" },
  { value: "salad", label: "サラダ", icon: "🥗" },
  { value: "dessert", label: "デザート", icon: "🥤" },
] as const;

// 最終更新日時（ISO 8601形式: YYYY-MM-DDTHH:mm:ss）
// 同日の複数回アップデートに対応するため、時間を含めて管理します
export const LATEST_UPDATE_DATE = "2025-12-29T16:10:00";
