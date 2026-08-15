import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** 前年のメニューとオプションを丸ごと複製して新しい年を作る */
async function main() {
  const [yearArg, fromArg] = process.argv.slice(2);
  const year = Number(yearArg);
  if (!year) {
    throw new Error("usage: npm run new-year -- <year> [fromYear]");
  }

  const from = fromArg
    ? Number(fromArg)
    : (
        await prisma.year.findFirst({
          where: { year: { lt: year } },
          orderBy: { year: "desc" },
        })
      )?.year;

  await prisma.year.create({ data: { year, label: `${year}年` } });

  if (!from) {
    console.log(`✅ ${year} を作成しました（複製元なし）`);
    return;
  }

  const options = await prisma.option.findMany({ where: { year: from } });
  const optionIdByName = new Map<string, string>();
  for (const option of options) {
    const created = await prisma.option.create({
      data: {
        year,
        name: option.name,
        price: option.price,
        isActive: option.isActive,
        sortOrder: option.sortOrder,
      },
    });
    optionIdByName.set(option.name, created.id);
  }

  const newOptionId = (name: string) => {
    const id = optionIdByName.get(name);
    if (!id) throw new Error(`Unknown option: ${name}`);
    return id;
  };

  const menuItems = await prisma.menuItem.findMany({
    where: { year: from },
    include: { MenuItemOption: { include: { Option: true } } },
  });
  for (const menuItem of menuItems) {
    await prisma.menuItem.create({
      data: {
        year,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        isActive: menuItem.isActive,
        sortOrder: menuItem.sortOrder,
        targetQuantity: menuItem.targetQuantity,
        MenuItemOption: {
          create: menuItem.MenuItemOption.map(({ Option }) => ({
            optionId: newOptionId(Option.name),
          })),
        },
      },
    });
  }

  console.log(
    `✅ ${from} から ${year} を作成しました（メニュー${menuItems.length}件 / オプション${options.length}件）`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
