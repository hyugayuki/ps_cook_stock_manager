# 実装計画 - Pokemon Sleep Cooking Planner

## 1. プロジェクト初期化とセットアップ

- [ ] **Next.js プロジェクトの初期化**
  - コマンド: `npx -y create-next-app@latest . --typescript --tailwind --eslint`
  - 設定: App Router 使用, Alias `@/*` 使用。
- [ ] **依存ライブラリのインストール**
  - `lucide-react`: アイコン用。
  - `zustand`: 状態管理用。
  - `clsx`, `tailwind-merge`: 動的なクラス名生成用。
  - `shadcn-ui` (CLI 経由または手動): Button, Card, Dialog, Input, Tabs, Badge, ScrollArea などのコンポーネント用。
- [ ] **`index.css` の調整**
  - 基本スタイルの実装、HLS カラー変数によるテーマ設定（ダークモード対応を考慮）。
  - Google Fonts (Inter/Outfit 等) の設定。

## 2. コアロジックとデータ構造

- [ ] **データ型の定義 (`types/index.ts`)**
  - `Ingredient`: { id, name, image? }
  - `Recipe`: { id, name, category, ingredients: { id, count }[] }
  - `Plan`: { id, name, category: 'curry'|'salad'|'dessert', targets: { recipeId: count } }
  - `Settings`: { bagLimit: number }
- [ ] **静的データの実装**
  - `data/ingredients.ts`: ポケモンスリープの全食材リスト。
  - `data/recipes.ts`: 全レシピと必要食材の定義。
- [ ] **状態管理ストアの実装 (`store/usePlannerStore.ts`)**
  - `zustand` と `persist` ミドルウェアを使用。
  - **バージョン管理**: `persist` オプションに `version` を設定。データ構造変更時のマイグレーション関数 `migrate` を定義。
  - **State**:
    - `plans`: Map<id, Plan> (または Array)
    - `currentPlanId`: string
    - `settings`: Settings
  - **Actions**:
    - `createPlan(name)`, `deletePlan(id)`, `switchPlan(id)`, `renamePlan(id, newName)`
    - `updateTarget(recipeId, delta)`: 目標回数の増減。
    - `setCategory(category)`: 現在のプランのカテゴリ変更。
    - `setBagLimit(limit)`: バッグ上限の設定。

## 3. UI コンポーネントの実装

- [ ] **デザインシステムコンポーネント (shadcn/ui ベース)**
  - `Button`, `Input`, `Card`, `Tabs`, `Dialog` (Modal), `Badge`.
- [ ] **レイアウトコンポーネント**
  - `Header`: アプリタイトル、プラン切り替え（ドロップダウン）、設定アイコン。
  - `PlanManager`: プラン管理用モーダル（作成/削除/名前変更）。
- [ ] **レシピ操作 UI**
  - `CategoryTabs`: カレー/サラダ/デザートの切り替えタブ。
  - `RecipeCard`: レシピ詳細（名前、必要食材）を表示。
    - 操作: `-` / `+` ボタン、数値直接入力欄。
  - `RecipeList`: 選択中のカテゴリに基づいて RecipeCard をグリッド表示。
- [ ] **集計・サマリー UI**
  - `IngredientSummary`:
    - 現在のプランの目標数に基づいて必要な食材合計を計算。
    - 数量順などでソートしてリスト表示。
    - **容量チェック**: 合計 vs `bagLimit` を比較し、超過時は警告（赤字/ボーダー等）を表示。
    - _リアルタイム更新_: ストアの変更に即座に反応すること。

## 4. ページ構築

- [ ] **メインページ (`app/page.tsx`)**
  - `Header`, `CategoryTabs`, `RecipeList`, `IngredientSummary` を組み合わせる。
  - レスポンシブ対応（モバイルファースト: サマリーは下部固定やドロワー表示などを検討）。

## 5. 仕上げと改善

- [ ] **UX 改善**
  - カウンター変更時のアニメーション。
  - バッグ容量超過時の明確なフィードバック。
- [ ] **SEO & メタデータ**
  - タイトル、説明文、meta タグの設定。
- [ ] **テスト**
  - LocalStorage の永続化確認（リロード後の維持）。
  - バージョン管理の挙動確認（バージョン変更をシミュレート）。
