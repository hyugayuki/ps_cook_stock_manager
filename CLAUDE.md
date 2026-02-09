# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pokemon Sleep の料理プランニングツール。レシピ選択・食材管理・バッグ容量管理をブラウザ上で完結するクライアントサイドアプリケーション。UIは日本語。

## Tech Stack

- **Next.js 16** (App Router) / **React 19** / **TypeScript** (strict mode)
- **Tailwind CSS 4** + **shadcn/ui** (new-york style, Radix UI ベース)
- **Zustand 5** (persist middleware v2, localStorage)
- **Sentry** (エラー監視) / **Vercel Analytics**
- Node.js v20.17.0 (`.nvmrc`)

## Commands

```bash
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # プロダクションビルド (Sentry source map 含む)
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint 実行
```

## Architecture

### データフロー

サーバーサイド・DB は無し。全データはクライアントで完結する。

- **静的データ**: `src/data/` 内の TypeScript ファイル（レシピ76件、食材19種、定数）
- **ユーザー状態**: Zustand ストア → localStorage (`ps-cook-planner-storage`) に永続化
- **クロスタブ同期**: `storage` イベントで `usePlannerStore.persist.rehydrate()` を呼ぶ

### ストア (`src/store/usePlannerStore.ts`)

アプリの中心。プラン CRUD、レシピ数量管理、設定（バッグ上限・週間カテゴリ）を一元管理。persist middleware の `version: 2` でマイグレーション対応済み。

### コンポーネント構成

- `src/components/planner/` — ビジネスロジック UI（PlanManager, CategoryTabs, RecipeList, RecipeCard, IngredientSummary）
- `src/components/ui/` — shadcn/ui コンポーネント群
- `src/components/layout/` — Header（設定モーダル含む）

### レスポンシブ設計

- モバイル: 画面下部固定の食材サマリー + Drawer
- デスクトップ: sticky サイドバー（`md:` breakpoint で切替）

### SSR ハイドレーション対策

Zustand persist は SSR と相性が悪いため、`page.tsx` で `mounted` state を使い、マウント後にのみレンダリングする。

### パス alias

`@/*` → `./src/*` (`tsconfig.json`)

## Key Types (`src/types/index.ts`)

- `CookingCategory`: `'curry' | 'salad' | 'dessert'`
- `Plan`: プラン定義（targets は `Record<recipeId, count>`）
- `Recipe`: レシピ定義（ingredients, energy, totalIngredients）
- `Settings`: バッグ上限、週間カテゴリ、最終閲覧更新日

## Deployment

Vercel にデプロイ。Sentry source map は `next.config.ts` で設定済み。
