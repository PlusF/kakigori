"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { assertAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { ActionResult, AdminMenu, MenuItemInput } from "@/types/types";
import { settledReason } from "./settledReason";
import { getAdminMenu } from "./getAdminMenu";

export async function saveMenuItem(
  year: number,
  input: MenuItemInput
): Promise<ActionResult<AdminMenu>> {
  await assertAdmin();
  assertYear(year);

  const reason = await settledReason(year);
  if (reason) {
    return { ok: false, message: reason };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, message: "名前を入力してください" };
  }

  const duplicated = await prisma.menuItem.findFirst({
    where: { year, name, id: { not: input.id ?? "" } },
  });
  if (duplicated) {
    return { ok: false, message: `${name} はすでにあります` };
  }

  const data = {
    name,
    price: input.price,
    image: input.image.trim(),
    targetQuantity: input.targetQuantity,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };

  if (input.id) {
    const menuItemId = input.id;
    // 対応表は差分を取らず貼り直す
    await prisma.$transaction([
      prisma.menuItem.update({ where: { id: menuItemId }, data }),
      prisma.menuItemOption.deleteMany({ where: { menuItemId } }),
      prisma.menuItemOption.createMany({
        data: input.options.map((option) => ({ menuItemId, ...option })),
      }),
    ]);
  } else {
    await prisma.menuItem.create({
      data: { year, ...data, MenuItemOption: { create: input.options } },
    });
  }

  revalidatePath("/menu");
  revalidatePath("/order");
  return { ok: true, data: await getAdminMenu(year) };
}
