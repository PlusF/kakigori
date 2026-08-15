# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

かき氷の注文管理システム。kakigori2025 のリメイクで、「年（Year）」と「オプション（Option）」を軸に毎年使い回せる構成にしてある。

## Commands

```bash
npm run dev          # 開発サーバー
npm run lint         # ESLint
npm run new-year -- <year> [fromYear]   # 年を複製して新設
npx prisma migrate dev --name <name>    # マイグレーション
npx prisma db seed                      # seed（YEAR=2026 で年を絞れる）
```

## Git / デプロイ

- ブランチを切らず `main` に直接コミットして push する
- `main` への push で Vercel の本番デプロイが自動で走る

## Architecture

### Tech Stack

- Next.js 16 (App Router) / React 19 / Mantine 9 / TypeScript
- Vercel の Prisma Postgres + Prisma 7（driver adapter `@prisma/adapter-pg`）
- グラフは recharts、アイコンは Tabler Icons

### バージョン固定の理由

- TypeScript は 6 系。7 系（ネイティブ版）は typescript-eslint が未対応で lint が動かない
- ESLint は 9 系。10 系は eslint-config-next 16 が内包する eslint-plugin-react が非対応

### Prisma 7 の作法

- 接続先は `schema.prisma` ではなく `prisma.config.ts` の `datasource.url` に書く
- CLI は `.env` を自動で読まないので `prisma.config.ts` / スクリプト側で `process.loadEnvFile()` する
- クライアントは `src/generated/prisma`（gitignore 済み）に生成される。アプリからは `src/lib/prisma.ts` 経由で使い、`PrismaClient` には `@prisma/adapter-pg` を渡す
- Vercel の Prisma Postgres は素の `postgres://` を配るので Accelerate（`accelerateUrl`）は使えない。`prisma+postgres://` でない URL を `accelerateUrl` に渡すと実行時に落ちる

### Key Directories

- `src/app/` - App Router のページ
- `src/app/_actions/` - Server Actions
- `src/app/_components/` - 共有コンポーネント
- `src/app/_contexts/` - LoadingContext, YearContext
- `src/types/types.ts` - 型と価格計算ヘルパ
- `prisma/seed-data.ts` - 年ごとのメニュー定義

### データモデル

- `Year` … 開催年。MenuItem / Option / Order はすべて `year` を持つ
- `MenuItem` … 商品。`price` はオプション無しの価格、`targetQuantity` はダッシュボードの目標杯数
- `Option` … 練乳・オレンジなどのトッピング。`MenuItemOption` でどの商品に付けられるかを定義し、`isDefault` で最初から選択済みにする（カシオレのオレンジ）
- `Order` / `OrderItem` / `OrderItemOption` … 注文。同じ商品でもオプションが違えば別の OrderItem

### Important Patterns

1. 表示中の年は `YearContext` が持つ。データ取得系はすべて `year` を引数に取り、`year` が null の間は fetch しない
2. 単価は `unitPrice(menuItem.price, options)`（`src/types/types.ts`）で統一。合計はサーバー側で `calcTotal` が DB の価格を正として計算し直す
3. ダッシュボードと注文履歴は 5 秒ポーリングで更新する
