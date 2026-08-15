"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { assertAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { ActionResult, Year } from "@/types/types";
import { getYears } from "./getYears";

export async function unsettleYear(
  year: number
): Promise<ActionResult<Year[]>> {
  await assertAdmin();
  assertYear(year);

  await prisma.year.update({ where: { year }, data: { settledAt: null } });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
  return { ok: true, data: await getYears() };
}
