import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { YearSeed, yearSeeds } from "./seed-data";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function seedYear(seed: YearSeed) {
  await prisma.year.upsert({
    where: { year: seed.year },
    update: { label: seed.label },
    create: { year: seed.year, label: seed.label },
  });

  const options = new Map<string, string>();
  for (const [index, option] of seed.options.entries()) {
    const saved = await prisma.option.upsert({
      where: { year_name: { year: seed.year, name: option.name } },
      update: { price: option.price, sortOrder: index },
      create: {
        year: seed.year,
        name: option.name,
        price: option.price,
        sortOrder: index,
      },
    });
    options.set(option.name, saved.id);
  }

  for (const [index, menuItem] of seed.menuItems.entries()) {
    const saved = await prisma.menuItem.upsert({
      where: { year_name: { year: seed.year, name: menuItem.name } },
      update: {
        price: menuItem.price,
        image: menuItem.image,
        targetQuantity: menuItem.targetQuantity,
        sortOrder: index,
      },
      create: {
        year: seed.year,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        targetQuantity: menuItem.targetQuantity,
        sortOrder: index,
      },
    });

    const links = [...options].map(([name, optionId]) => ({
      optionId,
      isDefault: menuItem.defaultOptions?.includes(name) ?? false,
    }));

    for (const link of links) {
      await prisma.menuItemOption.upsert({
        where: {
          menuItemId_optionId: {
            menuItemId: saved.id,
            optionId: link.optionId,
          },
        },
        update: { isDefault: link.isDefault },
        create: { menuItemId: saved.id, ...link },
      });
    }
  }

  console.log(
    `✅ ${seed.year}: メニュー${seed.menuItems.length}件 / オプション${seed.options.length}件`
  );
}

async function main() {
  console.log("🌱 Starting seed...");

  const target = process.env.YEAR ? Number(process.env.YEAR) : null;
  const seeds = target
    ? yearSeeds.filter((seed) => seed.year === target)
    : yearSeeds;

  if (seeds.length === 0) {
    throw new Error(`No seed data for year ${target}`);
  }

  for (const seed of seeds) {
    await seedYear(seed);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
