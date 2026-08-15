"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { assertAdmin } from "@/lib/admin";
import { AdminMenu } from "@/types/types";

export async function getAdminMenu(year: number): Promise<AdminMenu> {
  await assertAdmin();
  assertYear(year);

  const [menuItems, options] = await Promise.all([
    prisma.menuItem.findMany({
      where: { year },
      orderBy: { sortOrder: "asc" },
      include: { MenuItemOption: { include: { Option: true } } },
    }),
    prisma.option.findMany({ where: { year }, orderBy: { sortOrder: "asc" } }),
  ]);

  return {
    menuItems: menuItems.map(({ MenuItemOption, ...menuItem }) => ({
      ...menuItem,
      options: MenuItemOption.map(({ Option, isDefault }) => ({
        ...Option,
        isDefault,
      })).sort((a, b) => a.sortOrder - b.sortOrder),
    })),
    options,
  };
}
