"use server";

import { prisma } from "@/lib/prisma";
import { MenuItemWithOptions } from "@/types/types";

export async function getMenu(year: number): Promise<MenuItemWithOptions[]> {
  const menuItems = await prisma.menuItem.findMany({
    where: { year, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      MenuItemOption: {
        include: { Option: true },
      },
    },
  });

  return menuItems.map(({ MenuItemOption, ...menuItem }) => ({
    ...menuItem,
    options: MenuItemOption.filter(({ Option }) => Option.isActive)
      .map(({ Option, isDefault }) => ({ ...Option, isDefault }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}
