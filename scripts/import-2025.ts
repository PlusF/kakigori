import { readFileSync } from "node:fs";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * kakigori2025 の DB から 2025 年のメニューと注文を取り込む一度きりのスクリプト。
 * usage: npm run import-2025 -- ../kakigori2025/.env
 */
const legacyEnvPath = process.argv[2] ?? "../kakigori2025/.env";
const legacyUrl = readFileSync(legacyEnvPath, "utf8")
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim()
  .replace(/^"|"$/g, "");

if (!legacyUrl) {
  throw new Error(`DATABASE_URL not found in ${legacyEnvPath}`);
}

process.loadEnvFile(".env");
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

/** 2025 のダッシュボードにハードコードされていた目標杯数 */
const TARGETS: Record<string, number> = {
  初恋いちご: 200,
  青春ブルーハワイ: 200,
  ほろ苦コーヒー: 100,
  宵カシス: 100,
};

type LegacyMenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  sortOrder: number;
};

type LegacyOrder = {
  id: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

type LegacyOrderItem = {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  createdAt: Date;
};

async function main() {
  const legacy = new Client({ connectionString: legacyUrl });
  await legacy.connect();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    // 販売実績のない「〜抜き」系は取り込まない
    const { rows: menuItems } = await legacy.query<LegacyMenuItem>(
      `select m.id, m.name, m.price, m.image, m."sortOrder"
         from "MenuItem" m
        where m."isActive"
           or exists (select 1 from "OrderItem" oi where oi."menuItemId" = m.id)
        order by m."sortOrder"`
    );
    const { rows: orders } = await legacy.query<LegacyOrder>(
      `select id, total, "createdAt", "updatedAt" from "Order"`
    );
    const { rows: orderItems } = await legacy.query<LegacyOrderItem>(
      `select id, "orderId", "menuItemId", quantity, "createdAt" from "OrderItem"`
    );

    await prisma.year.upsert({
      where: { year: 2025 },
      update: { label: "2025年" },
      create: { year: 2025, label: "2025年" },
    });

    const menuItemIdMap = new Map<string, string>();
    for (const [index, item] of menuItems.entries()) {
      const saved = await prisma.menuItem.upsert({
        where: { year_name: { year: 2025, name: item.name } },
        update: {},
        create: {
          year: 2025,
          name: item.name,
          price: Math.round(item.price),
          image: item.image,
          sortOrder: index,
          targetQuantity: TARGETS[item.name] ?? 0,
        },
      });
      menuItemIdMap.set(item.id, saved.id);
    }

    const importedOrders = await prisma.order.createMany({
      data: orders.map((order) => ({
        id: order.id,
        year: 2025,
        total: Math.round(order.total),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      skipDuplicates: true,
    });

    const importedItems = await prisma.orderItem.createMany({
      data: orderItems.flatMap((item) => {
        const menuItemId = menuItemIdMap.get(item.menuItemId);
        if (!menuItemId) {
          console.warn(`skip OrderItem ${item.id}: unknown menu item`);
          return [];
        }
        return [
          {
            id: item.id,
            orderId: item.orderId,
            menuItemId,
            quantity: item.quantity,
            createdAt: item.createdAt,
          },
        ];
      }),
      skipDuplicates: true,
    });

    console.log(
      `✅ 2025: メニュー${menuItems.length}件 / 注文${importedOrders.count}件 / 明細${importedItems.count}件`
    );
  } finally {
    await legacy.end();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
