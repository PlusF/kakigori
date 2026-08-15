"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { assertAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { ActionResult, AdminMenu, OptionInput } from "@/types/types";
import { settledReason } from "./settledReason";
import { getAdminMenu } from "./getAdminMenu";

export async function saveOption(
  year: number,
  input: OptionInput
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

  const duplicated = await prisma.option.findFirst({
    where: { year, name, id: { not: input.id ?? "" } },
  });
  if (duplicated) {
    return { ok: false, message: `${name} はすでにあります` };
  }

  const data = {
    name,
    price: input.price,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };

  if (input.id) {
    await prisma.option.update({ where: { id: input.id }, data });
  } else {
    await prisma.option.create({ data: { year, ...data } });
  }

  revalidatePath("/menu");
  revalidatePath("/order");
  return { ok: true, data: await getAdminMenu(year) };
}
