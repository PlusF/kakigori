# 氷川かき氷

かき氷の注文管理システム。「年」ごとにメニューと注文を分けて持つので、毎年そのまま使い回せる。
トッピングは「オプション」として管理し、選択に応じて価格を加算する（例: 練乳 +50円 / オレンジ +100円）。

## セットアップ

DB は Vercel の Prisma Postgres を使う（2025 と同じ構成）。

1. Vercel でこのリポジトリをインポートしてプロジェクトを作る
2. プロジェクトの Storage から Prisma Postgres を作成してリンクする
3. 接続情報をローカルに落とす

```bash
npm install
vercel link
vercel env pull .env   # PRISMA_DATABASE_URL と DATABASE_URL が入る
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

- `PRISMA_DATABASE_URL` … アプリのランタイムが使う Accelerate 経由の接続
- `DATABASE_URL` … `prisma migrate` / `db seed` / `studio` が使う直結の接続

## 年の運用

```bash
# 新しい年を前年のメニューごと複製する（複製元省略時は直近の年）
npm run new-year -- 2027
npm run new-year -- 2027 2026

# seed-data.ts に定義した年だけを流し込む
YEAR=2026 npx prisma db seed
```

画面右上のセレクトで表示中の年を切り替える。ダッシュボード・メニュー・注文・注文履歴はすべて選択中の年に対して動く。

## データベース操作

```bash
npx prisma generate                             # Prisma Client を生成（src/generated/prisma）
npx prisma migrate dev --name <migration_name>  # マイグレーション作成 & 適用
npx prisma studio                               # GUI
```
